let fs = require('fs');
let node_ssh = require('node-ssh');
const { spawn } = require('child_process');

let server_process;
let server_port;
let server_ip;

let target_processes = [];
let source_processes = [];
let predictor_processes = [];

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

function startSource() {
}

function stopSource() {

}

function startTarget(data) {
    return new Promise((resolve, reject) => {
        let ssh = new node_ssh();

        ssh.connect({
            host: data.ip,
            username: data.username,
            password: data.password
        })
        .then(() => {
            // ssh.exec('/bin/distributed/run.bash', params, { cwd: binDir, stream: 'stdout', options: { pty: true } }).then(result => {
            //     console.log('STDOUT: ' + result);
            // })
            // With streaming stdout/stderr callbacks
            ssh.exec('/bin/distributed/run.bash', data.params, {
                cwd: data.binDir,
                onStdout(chunk) {
                    console.log('stdoutChunk', chunk.toString('utf8'))
                },
                onStderr(chunk) {
                    console.log('stderrChunk', chunk.toString('utf8'))
                },
            });
        });
    });
}

function stopTarget() {

}

function startPredictor() {

}

function stopPredictor() {

}

module.exports = {
    startConstellation,
    stopConstellation,
    startSource,
    stopSource,
    startTarget,
    stopTarget,
    startPredictor,
    stopPredictor
};