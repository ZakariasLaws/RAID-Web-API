let fs = require('fs');
let node_ssh = require('node-ssh');
const { spawn, exec } = require('child_process');
const os = require('os');

const poolName = "pool.name";
const RAID_BIN_DIR = process.env.RAID_DIR;

// Directory ame used for logging
let logDir;
let server_wstream;

let server_process = null;
let server_port;
let server_ip;

let target_processes = {};
let source_processes = {};
let predictor_processes = {};

// This should be done with sockets instead
let buffer = []; // Buffer data to not overwhelm the user
let number = 0;
const timeInterval = 1000; // ms to buffer for before sending
let sendIntervalObj;

let client;

/**
 * Sleep for given time
 * Sleep for given time
 * @param ms time to sleep
 */
function wait(ms){
    let start = new Date().getTime();
    let end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

function recursiveCreateFileName(executionName, counter){
    const tmp = logDir + '/' + executionName + '-' + counter.toString();
    if (!fs.existsSync(tmp)){
        fs.mkdirSync(tmp);
        return tmp;
    }
    return recursiveCreateFileName(executionName, counter + 1);
}

/**
 * Signals a RAID agent to terminate using kill -2 <process_name>
 *
 * Since this method kills the processes using a process name, it will kill all agents of the same role
 * on the targeted device. For example, if we have 2 local SOURCES and kill this method on one of them, both
 * will be killed. TODO fix this by e.g. storing the PID of each individual process in the *handler*
 *
 * @param device
 * @param role
 * @param type
 * @returns {Promise<unknown>}
 */
function killDevices(device, role, type){
    console.log("Stopping " + device[0] + " " + role);

    return new Promise((resolve, reject) => {
        if (os.hostname() === device[0].split('@')[0] || os.userInfo().username === device[0].split('@')[0]) {
            // Running locally
            const cmdString = "kill " + type + " `ps aux | grep '" + role + "' | grep -v 'grep' | awk '{print $2}'`";
            exec(cmdString, (err, stdout, stderr) => {
                // console.log(err + " " + stdout + " " + stderr);
            });

            resolve();
            return;
        }

        const params = ['-tt', device[0], 'kill', type, "`ps aux | grep '" + role + "' | grep -v 'grep' | awk '{print $2}'`"];
        let child = spawn('ssh', params);

        child.stdout.on('data', (data) => {
            if (!`${data}`.includes('usage')) // No existing device
                console.log(`Killing stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`Killing stderr: ${data}`);
        });

        child.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
        });

        // TODO Check if there are multiple predictors on the device,
        // TODO if that is the case, tensorflow serving should NOT be shutdown

        // Shutdown Docker
        const shutdownDockerParams = ['-tt', device[0], 'docker rm $(docker stop $(docker ps -a -q --filter ancestor=tensorflow/serving --format="{{.ID}}"))'];

        spawn('ssh', shutdownDockerParams);

        resolve();
    });
}

function startConstellation(binDir, executionName) {
    return new Promise((resolve, reject) => {
        // Stop all currently running instances (if there are any)
        const params = ['-9', "`ps aux | grep 'constellation' | grep -v 'grep' | awk '{print $2}'`"];

        let child = spawn('kill', params);
        child.on('close', () => {
            if (server_process !== null){
                reject("There is already a Constellation instance running");
                return;
            }

            if (executionName === ''){
                reject("No execution name provided");
                return;
            }

            const serverUrl = binDir + "/bin/distributed/constellation-server";

            // Create log directory
            if (!fs.existsSync('logs')){
                fs.mkdirSync('logs');
            }

            let date = new Date();
            logDir = `logs/${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;

            if (!fs.existsSync(logDir)){
                fs.mkdirSync(logDir);
            }

            if (!fs.existsSync(logDir + '/' + executionName)){
                logDir = logDir + '/' + executionName;
                fs.mkdirSync(logDir);
            } else {
                logDir = recursiveCreateFileName(executionName, 1); // Recursively look for an available name
            }

            server_wstream = fs.createWriteStream(logDir + '/constellation-server.log');

            // Start process
            server_process = spawn(serverUrl);

            server_process.stdout.on('data', (data) => {
                // console.log(`stdout: ${data}`);
            });

            server_process.stderr.on('data', (data) => {
                let data2 = `${data}`; // Convert to String

                console.log(`Server stderr: ${data2}`);
                server_wstream.write(data2); // Write to log

                if (!data2.includes("Known hubs now: ")){
                    return;
                }

                let info = data2.split("Known hubs now: ")[1].split("#")[0];

                server_port = info.split("-")[1];
                let tmp = info.split("-")[0].split('/');
                server_ip = tmp[0];
            });

            server_process.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                server_wstream.end();
            });

            wait(2000);
            resolve(1);

            // Start buffering and sending
            sendIntervalObj = setInterval(sendResultsToClient, timeInterval);
        });
    });
}

function sendResultsToClient(){
    if (client !== undefined && client !== null) {
        let model_per_device = {};

        buffer.forEach(element =>{
            const name = element.classifiedAt;
            const model = element.model;
            // Model per device
            if (Object.keys(model_per_device).includes(name)){
                if (Object.keys(model_per_device[name]).includes(model)){
                    model_per_device[name][model] += 1;
                } else {
                  model_per_device[name][model] = 1;
                }
            } else {
                model_per_device[name] = {};
                model_per_device[name][model] = 1;
            }
        });

        let values = {
            length: buffer.length,
            data: model_per_device, // {Odroid-1:{MNIST: 2, YOLO:5}, Odroid-2: {MNIST:5, YOLO:7}} etc
        };

        // values = {
        //     length: 2,
        //     data: {
        //         O1: {MNIST: 1, YOLO: 4},
        //         O2: {MNIST: 2, YOLO: 2},
        //         O3: {MNIST: 8, YOLO: 6}
        //     }
        // };

        // console.log("Transmitting " + values.length + " results to client");

        client.emit('data', values);
        buffer = [];
    }
}

function streamClassification(data) {
    const time = new Date().getTime();
    number +=1;

    let model = data.split('model ')[1].split('=')[0];
    let tmp = model.split(':');
    if (tmp.length > 1){
        model = tmp[0];
    }

    let id = data.split('=')[1];
    let deviceName = `${data.split('classified at ')[1].split(' using model')[0]}-${id}`;
    let deviceName_allThreads = `${deviceName.split(":")[0]}-${deviceName.split(":")[1]}`;

    let values = {
        model: model.split('\n')[0],
        classifiedAt: deviceName_allThreads,
        number: number,
        time: time,
        id: data.split('=')[1]
    };

    buffer.push(values);
}

function stopConstellation() {
    if (server_process !== undefined && server_process !== null){
        server_process.kill('SIGTERM');
        if (sendIntervalObj !== undefined && sendIntervalObj !== null)
            clearInterval(sendIntervalObj);
        server_process = null;

        // Shutdown all remaining devices
        Object.keys(predictor_processes).filter(val => !predictor_processes[val][2]).forEach(id => {
            killDevices(predictor_processes[id], 'PREDICTOR', '-9');
        });

        Object.keys(source_processes).filter(val => !source_processes[val][2]).forEach(id => {
            killDevices(source_processes[id], 'SOURCE', '-9');
        });

        Object.keys(target_processes).filter(val => !target_processes[val][2]).forEach(id => {
            killDevices(target_processes[id], 'TARGET', '-9');
        });
    }

    predictor_processes = [];
    source_processes = [];
    target_processes = [];

    // In case the user was using Docker for TensorFlow Serving, it must be shutdown independently
    const stopDocker = "docker rm $(docker stop $(docker ps -a -q --filter ancestor=tensorflow/serving --format=\"{{.ID}}\"))";
    exec(stopDocker, (err, stdout, stderr) => {
        // console.log(err + " " + stdout + " " + stderr);
    });
}

function startDevice(data){
    return new Promise((resolve, reject) => {
        const scriptLoc = RAID_BIN_DIR + "/bin/distributed/remote_execution/start_remote.bash";

        let params = [`${data.username}@${data.ip}`, data.role, server_ip, poolName, data.params];
        let outputFile, profileOutput;

        let title = ''; // For target only

        // Add output file to logs
        if (data.role === 't'){
            // Remove title from params HAD TO BE LAST ELEMENT
            title = params[4].split('title: ')[1].trim();
            params[4] = params[4].split('title: ')[0];

            outputFile = require('path').resolve(__dirname, '..') + '/' + logDir + '/targets/' + data.id + '-results.log';
            profileOutput = require('path').resolve(__dirname, '..') + '/' + logDir + '/targets/' + data.id + '-gantt';
            params.push(`-outputFile ${outputFile}`);
            params.push(`-profileOutput ${profileOutput}`)
        }
        let handler;
        let deviceLogDir;

        switch (data.role) {
            case 't':
                if (!fs.existsSync(logDir + '/targets')){
                    fs.mkdirSync(logDir + '/targets');
                }
                deviceLogDir = logDir + '/targets/' + (data.id + 1) + '.log'; // Might overwrite existing file
                handler = [`${data.username}@${data.ip}`, spawn(scriptLoc, params), false, fs.createWriteStream(deviceLogDir), title, ''];
                target_processes[data.id] = handler;
                break;
            case 's':
                if (!fs.existsSync(logDir + '/sources')){
                    fs.mkdirSync(logDir + '/sources');
                }
                deviceLogDir = logDir + '/sources/' + (data.id + 1) + '.log'; // Might overwrite existing file

                // Get the ID of selected target FAILS IF THE TARGET DOES NOT EXIST
                let targetName = params[4].split('-target ')[1].trim();
                params[4] = params[4].split('-target')[0];
                let values = Object.values(target_processes).filter(val => {if (val[4] === targetName) return val});

                if (values.length === 0) {
                    console.log("Target \"" + targetName + "\" is not running");
                    reject("Target \"" + targetName + "\" is not running");
                    break;
                } else {
                    params[4] += '-target ' + values[0][5];
                    console.log(params[4]);
                }

                handler = [`${data.username}@${data.ip}`, spawn(scriptLoc, params), false, fs.createWriteStream(deviceLogDir)];
                source_processes[data.id] = handler;
                break;
            case 'p':
                if (!fs.existsSync(logDir + '/predictors')){
                    fs.mkdirSync(logDir + '/predictors');
                }
                deviceLogDir = logDir + '/predictors/' + (data.id + 1) + '.log'; // Might overwrite existing file
                // [host, run script, running, writeStream, docker id]
                handler = [`${data.username}@${data.ip}`, spawn(scriptLoc, params), false, fs.createWriteStream(deviceLogDir), false];
                predictor_processes[data.id] = handler;
                break;
            default:
                console.log('Unrecognized role: ' + data.role);
                reject();
                return;
        }


        const role = data.role;
        const id = data.id;
        handler[1].stdout.on('data', (data) => {
            if (`${data}`.includes("ERROR")){
                client.emit("ERROR", {data: `${data}`, id: id});
                console.log(`${data}`);
            }

            if (role === 't') {
                `${data}`.split('\n').forEach(val => {
                    if (`${val}`.includes('classified at')) {
                        streamClassification(`${val}=${id}`);
                    } else if (`${val}`.includes('when initializing the new SOURCE: ')) {
                        handler[5] = `${val}`.split('SOURCE: "')[1].replace(/"/g, "").trim();
                    }
                });
            } else if (role === 'p'){
                if (`${data}`.includes('Starting Predictor') ){
                    client.emit(`predictor_started-${id}`, {id: id})
                } else if (`${data}`.includes('Starting Source') ){
                    client.emit(`source_started-${id}`, {id: id})
                } else if (`${data}`.includes('Starting Target') ){
                    client.emit(`target_started-${id}`, {id: id})
                }
            }

            handler[3].write(`${data}`);
        });

        handler[1].stderr.on('data', (data) => {
            if (role === 't')
                console.log(`Target stderr: ${data}`);
            if (role === 's')
                console.log(`Source stderr: ${data}`);
            if (role === 'p')
                console.log(`Predictor stderr: ${data}`);
            handler[3].write(`${data}`);
        });

        handler[1].on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            handler[2] = true;
            handler[3].end();
            if (role === 'p'){
                client.emit(`predictor_closed-${id}`, {id: id, code: code});
            } else if (role === 's') {
                client.emit(`source_closed-${id}`, {id: id, code: code});
            } else if (role === 't') {
                client.emit(`target_closed-${id}`, {id: id, code: code});
            }

        });

        // Add the output file if target
        if (data.role === 't'){
            handler.push(outputFile);
        }

        resolve();
    });
}

function stopDevice(id, role) {
    return new Promise((resolve, reject) => {
        switch (role) {
            case 't':
                killDevices(target_processes[id], 'TARGET', '-2')
                    .then(response => {
                        resolve();
                    })
                    .catch(err =>{
                        reject(err);
                    });
                break;
            case 's':
                killDevices(source_processes[id], 'SOURCE','-2')
                    .then(response => {
                        resolve();
                    })
                    .catch(err =>{
                        reject(err);
                    });
                break;
            case 'p':
                killDevices(predictor_processes[id], 'PREDICTOR','-2')
                    .then(response => {
                        resolve();
                    })
                    .catch(err =>{
                        reject(err);
                    });
                break;
            }
        });
}

function deviceIsStopped(id, role){
    return new Promise((resolve, reject) => {
        switch (role) {
            case 't':
                if (target_processes[id][2]) {
                    resolve()
                } else {
                    reject("Not done")
                }
                break;
            case 's':
                if (source_processes[id][2]){
                    resolve()
                } else {
                    reject("Not done")
                }
                break;
            case 'p':
                if (predictor_processes[id][2]){
                    resolve()
                } else {
                    reject("Not done")
                }
                break;
            default:
                console.log("Not a valid role " + role);
                reject("Not a valid role " + role);
        }
    });
}

function streamData(c) {
    client = c;
}

function clientDisconnect(){
    if (client !== undefined && client !== null){
        client.disconnect(0);
        client = null;
    }

    stopConstellation();
    // Stop all currently running instances (if there are any)
    // Safety net if the stopConstellation method failed
    const params = ['-9', "`ps aux | grep 'constellation' | grep -v 'grep' | awk '{print $2}'`"];

    spawn('kill', params);
}

module.exports = {
    startConstellation,
    stopConstellation,
    startDevice,
    stopDevice,
    deviceIsStopped,
    streamData,
    clientDisconnect
};
