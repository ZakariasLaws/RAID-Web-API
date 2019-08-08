const express = require('express');
const router = express.Router();
const constellation = require('./../models/constellation.model');

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

router.get('/device/result', async (req, res) => {
   await constellation.getResult(req.query.id)
       .then(response => {
           res.json(response)
       })
       .catch(err => {
           if (err.status) {
               res.status(err.status).json({ message: err.message })
           } else {
               res.status(500).json({ message: err.message })
           }
       })
});

// Routes
module.exports = router;