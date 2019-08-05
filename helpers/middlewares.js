function mustBeInteger(req, res, next) {
    const id = req.params.id;
    if (!Number.isInteger(parseInt(id))) {
        res.status(400).json({ message: 'ID must be an integer' })
    } else {
        next()
    }
}

function checkFieldsPost(err, req, res, next) {
    // const { title, role, contexts, target, modelName, batchSize, dataDir, resultDir } = req.body;

    const { title, role, ip } = req.body;

    if (!(title && role && ip)){
        res.status(400)({
           message: 'missing fields'
        });
    }

    if (role === 't' || role === 's' || role === 'p'){
        next()
    } else {
        res.status(400).json({ message: 'fields are not good' })
    }
}

module.exports = {
    mustBeInteger,
    checkFieldsPost
};