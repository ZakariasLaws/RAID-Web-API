const express = require('express');
const router = express.Router();
const constellation = require('./../models/constellation.model');

/* Start Constellation */
router.get('/start', async (req, res) => {
    await constellation.startConstellation(req.query.binDir)
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

router.post('/target/start', async (req, res) => {
   await constellation.startTarget(req.body)
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

// Routes
module.exports = router;