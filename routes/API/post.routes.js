const express = require('express');
const router = express.Router();
const post = require('./../../models/post.model');
const constellation = require('./../../models/constellation.model');
const m = require('./../../helpers/middlewares');

/* All devices */
router.get('/', async (req, res) => {
    await post.getDevices()
        .then(devices => res.json(devices))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        })
});

/* A device by id */
router.get('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id;
    await post.getDevice(id)
        .then(post => res.json(post))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        })
});

/* Insert a new device */
router.post('/', m.checkFieldsPost, async (req, res) => {
    await post.insertDevice(req.body)
        .then(post => res.status(201).json({
            message: `The post #${post.id} has been created`,
            content: post
        }))
        .catch(err => res.status(500).json({ message: err.message }))
});

/* Update a post */
router.put('/:id', m.mustBeInteger, m.checkFieldsPost, async (req, res) => {
    const id = req.params.id;
    await post.updateDevice(id, req.body)
        .then(post => res.json({
            message: `The device #${id} has been updated`,
            content: post
        }))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            }
            res.status(500).json({ message: err.message })
        })
});

/* Delete a post */
router.delete('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id;

    await post.deleteDevice(id)
        .then(post => res.json({
            message: `The post #${id} has been deleted`
        }))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({message: err.message})
            }
        })
});

/* Get results */
router.get('/result/:id', async (req, res) => {
    const id = req.params.id;
    await  post.getDevice(id)
        .then(post => {
            console.log("Found: " + post);
            const filename = post.resultDir;
            post.getResult(filename)
                .then(result => {
                    res.json({
                        result
                    });
                }).catch(err => {
                    throw err;
                });
        })
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        });
});

/* Start Constellation */
router.get('/constellation/', async (req, res) => {
    await constellation.startConstellation()
        .then(post => res.json(post))
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