var fs = require('fs');

const filename = './data/devices.json';
let posts = require('./../data/devices.json');
const helper = require('./../helpers/helper.js');

function getDevices() {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject({
                message: 'no posts available',
                status: 202
            })
        }
        resolve(posts)
    })
}
function getDevice(id)     {
    return new Promise((resolve, reject) => {
        helper.mustBeInArray(posts, id)
            .then(post => resolve(post))
            .catch(err => reject(err))
    });
}
function insertDevice(newDevice) {
    return new Promise((resolve, reject) => {
        const id = { id: helper.getNewId(posts) };
        const date = {
            createdAt: helper.newDate(),
            updatedAt: helper.newDate()
        };
        newDevice = { ...id, ...date, ...newDevice };
        posts.push(newDevice);
        helper.writeJSONFile(filename, posts);
        resolve(newDevice)
    })
}
function updateDevice(id, newDevice) {
    return new Promise((resolve, reject) => {
        helper.mustBeInArray(posts, id)
            .then(post => {
                const index = posts.findIndex(p => p.id === post.id);
                id = { id: post.id };
                const date = {
                    createdAt: post.createdAt,
                    updatedAt: helper.newDate()
                };
                posts[index] = { ...id, ...date, ...newDevice };
                helper.writeJSONFile(filename, posts);
                resolve(posts[index])
            })
            .catch(err => reject(err))
    })
}
function deleteDevice(id) {
    return new Promise((resolve, reject) => {
        helper.mustBeInArray(posts, id)
            .then(() => {
                posts = posts.filter(p => p.id != id);
                helper.writeJSONFile(filename, posts);
                resolve()
            })
            .catch(err => reject(err))
    })
}

function getResult(filePath){
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', function(err, contents) {
            console.log(contents);
            resolve(contents);
        });
    });
}

module.exports = {
    getDevices,
    getDevice,
    insertDevice,
    updateDevice,
    deleteDevice,
    getResult
};