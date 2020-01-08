const express = require('express');
const router = express.Router();
const constellation = require('../models/raid.model');

const server = require('http').createServer();
const io = require('socket.io')(server);

/* Start Constellation */
router.get('/start', async (req, res) => {
    await constellation.startConstellation(req.query.binDir, req.query.executionName)
        .then(post => res.json(post))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        })
});

/* Start Constellation */
router.get('/stop', async (req, res) => {
    constellation.stopConstellation(req);
    res.json('')
});

router.post('/device/start', async (req, res) => {
   await constellation.startDevice(req.body)
       .then(response => {
           res.json(response)
       })
       .catch(err => {
           if (err.status) {
               res.status(err.status).json({ message: err.message })
           } else {
               res.status(500).json({ message: err.message })
           }
       });
});

/**
 * Stop a device and remove it from the running Constellation instance gracefully.
 *
 * Removing the device might take up to a minute (because of fault-tolerance), hence
 * use the method "/device/stopped" to check if the device has successfully been removed
 */
router.get('/device/stop', async (req, res) => {
    await constellation.stopDevice(req.query.id, req.query.role)
        .then(response => res.json(response))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        });
});

router.get('/device/stopped', async (req, res) => {
    await constellation.deviceIsStopped(req.query.id, req.query.role)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        });
});

io.on('connection', client => {
    constellation.streamData(client);

    client.on('setup', data => {
        console.log('Client connected: ' + data);
    });

    client.on('disconnect', () => {
        console.log('client disconnect...', client.id);
        constellation.clientDisconnect()
    });

    client.on('error', err => {
        console.log('received error from client:', client.id);
        console.log(err)
    })
});

server.listen(3300,  (err) => {
    if (err) throw err;
    console.log('Socket listening on port ' + 3300);
});

// Routes
module.exports = router;