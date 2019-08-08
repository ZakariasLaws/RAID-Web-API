let fs = require('fs');
let node_ssh = require('node-ssh');
const { spawn } = require('child_process');

const poolName = "pool.name";
const CONSTELLATION_BIN_DIR = "/home/zaklaw01/Projects/odroid-constellation/edgeinference-constellation/build/install/edgeinference-constellation";

// Directory ame used for logging
let logDir;
let server_wstream;

let server_process;
let server_port;
let server_ip;

let target_processes = {};
let source_processes = {};
let predictor_processes = {};

let buffer = [];

/**
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

function killDevices(device, role){
    console.log("Stopping " + device[0] + " " + role);

    return new Promise((resolve, reject) => {
        const params = ['-tt', device[0], 'kill', '-2', "`ps aux | grep '" + role + "' | grep -v 'grep' | awk '{print $2}'`"];

        let child = spawn('ssh', params);

        child.stdout.on('data', (data) => {
            console.log(`Killing stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`Killing stderr: ${data}`);
        });

        child.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
        });
        resolve();
    });
}

function startConstellation(binDir, executionName) {
    return new Promise((resolve, reject) => {
        if (executionName === ''){
            console.log('No execution name provided, rejecting');
            reject("No execution name provided");
            return;
        }

        const serverUrl = binDir + "/bin/distributed/constellation-server";
        const configUrl = binDir + "/config.RAID";

        // Create log directory
        let date = new Date();
        logDir = `logs/${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`;

        if (!fs.existsSync(logDir)){
            fs.mkdirSync(logDir);
        }

        if (!fs.existsSync(logDir + '/' + executionName)){
            logDir = logDir + '/' + executionName;
            fs.mkdirSync(logDir);
        } else {
            recursiveCreateFileName(executionName, 1); // Recursively look for an available name
        }

        server_wstream = fs.createWriteStream(logDir + '/constellation-server.log');

        // Start process
        server_process = spawn(serverUrl, [configUrl]);

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
            server_ip = info.split("-")[0].split("/")[1];
        });

        server_process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            server_wstream.end();
        });

        wait(2000);
        resolve(1);
    });
}

function stopConstellation() {
    server_process.kill('SIGTERM');
}

function startDevice(data){
    return new Promise((resolve, reject) => {
        const scriptLoc = CONSTELLATION_BIN_DIR + "/bin/distributed/remote_execution/start_remote.bash";

        let params = [`${data.username}@${data.ip}`, data.role, server_ip, poolName, data.params];

        // Add output file to logs
        if (data.role === 't'){
            params.push('-outputFile ' + require('path').resolve(__dirname, '..') + '/' + logDir + '/targets/' + data.id + '-results.log');
        }
        let handler;
        let deviceLogDir;

        handler = [`${data.username}@${data.ip}`, spawn(scriptLoc, params), false];
        switch (data.role) {
            case 't':
                if (!fs.existsSync(logDir + '/targets')){
                    fs.mkdirSync(logDir + '/targets');
                }
                deviceLogDir = logDir + '/targets/' + data.id + '.log'; // Might overwrite existing file
                target_processes[data.id] = handler;
                break;
            case 's':
                if (!fs.existsSync(logDir + '/sources')){
                    fs.mkdirSync(logDir + '/sources');
                }
                deviceLogDir = logDir + '/sources/' + data.id + '.log'; // Might overwrite existing file
                source_processes[data.id] = handler;
                break;
            case 'p':
                if (!fs.existsSync(logDir + '/predictors')){
                    fs.mkdirSync(logDir + '/predictors');
                }
                deviceLogDir = logDir + '/predictors/' + data.id + '.log'; // Might overwrite existing file
                predictor_processes[data.id] = handler;
                break;
            default:
                console.log('Unrecognized role: ' + data.role);
                reject();
                return;
        }

        handler.push(fs.createWriteStream(deviceLogDir));

        const role = data.role;
        handler[1].stdout.on('data', (data) => {
            if (role === 't')
                console.log(`Target stdout: ${data}`);
            handler[3].write(`${data}`);
        });

        handler[1].stderr.on('data', (data) => {
            if (role === 't')
                console.log(`Target stderr: ${data}`);
            handler[3].write(`${data}`);
        });

        handler[1].on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            handler[2] = true;
            handler[3].end();
        });

        resolve();
    });
}

function stopDevice(id, role) {
    return new Promise((resolve, reject) => {
        switch (role) {
            case 't':
                killDevices(target_processes[id], 'TARGET')
                    .then(response => {
                        resolve();
                    })
                    .catch(err =>{
                        reject(err);
                    });
                break;
            case 's':
                killDevices(source_processes[id], 'SOURCE')
                    .then(response => {
                        resolve();
                    })
                    .catch(err =>{
                        reject(err);
                    });
                break;
            case 'p':
                killDevices(predictor_processes[id], 'PREDICTOR')
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

/**
 * Only for Target
 * @param id
 */
function getResult(id){
    const buf2 = buffer;
    buffer = [];
    return buf2;
}

module.exports = {
    startConstellation,
    stopConstellation,
    startDevice,
    stopDevice,
    deviceIsStopped,
    getResult,
};