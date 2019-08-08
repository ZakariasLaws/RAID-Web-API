let fs = require('fs');
let node_ssh = require('node-ssh');
const { spawn } = require('child_process');

const poolName = "POOL.NAME";
const CONSTELLATION_BIN_DIR = "/home/zaklaw01/Projects/odroid-constellation/edgeinference-constellation/build/install/edgeinference-constellation";

let server_process;
let server_port;
let server_ip;

let target_processes = {};
let source_processes = {};
let predictor_processes = {};

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

function killDevices(device, role){
    console.log("Stopping " + device[0] + " " + role);

    return new Promise((resolve, reject) => {
        const params = ['-tt', device[0], 'kill', '-2', "`ps aux | grep '" + role + "' | grep -v 'grep' | awk '{print $2}'`"];

        let child = spawn('ssh', params);

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
        resolve();
    });
}

function startConstellation(binDir) {
    return new Promise((resolve, reject) => {
        const serverUrl = binDir + "/bin/distributed/constellation-server";
        const configUrl = binDir + "/config.RAID";

        server_process = spawn(serverUrl, [configUrl]);

        server_process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        server_process.stderr.on('data', (data) => {
            let data2 = `${data}`; // Convert to String

            if (!data2.includes("Known hubs now: ")){
                console.log(`stderr: ${data}`);
                return;
            }

            let info = data2.split("Known hubs now: ")[1].split("#")[0];

            server_port = info.split("-")[1];
            server_ip = info.split("-")[0].split("/")[1];
            console.log(`stderr: ${data}`);
        });

        server_process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        resolve(1);
    });
}

function stopConstellation() {
    server_process.kill('SIGTERM');
}

function startDevice(data){
    return new Promise((resolve, reject) => {
        const scriptLoc = CONSTELLATION_BIN_DIR + "/bin/distributed/remote_execution/start_remote.bash";
        let handler, params;

        // Handler contains [address, child_process, boolean indicating if shutdown]

        params = [`${data.username}@${data.ip}`, data.role, server_ip, poolName, data.params];
        handler = [`${data.username}@${data.ip}`, spawn(scriptLoc, params), false];
        switch (data.role){
            case 't':
                target_processes[data.id] = handler;
                break;
            case 's':
                source_processes[data.id] = handler;
                break;
            case 'p':
                predictor_processes[data.id] = handler;
                break;
            default:
                console.log('Unrecognized role: ' + data.role);
                resolve();
                return;
        }

        handler[1].stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        handler[1].stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        handler[1].on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            handler[2] = true;

        });

        resolve(1);
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
                    resolve(100)
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

        resolve()
    });
}

module.exports = {
    startConstellation,
    stopConstellation,
    startDevice,
    stopDevice,
    deviceIsStopped,
};