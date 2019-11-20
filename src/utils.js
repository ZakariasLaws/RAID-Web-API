const handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
};

export const Utils = {
    API_URL: '/api/devices',
    CONSTELLATION_URL: {
        start: '/constellation/start',
        stop: '/constellation/stop',
        startDevice: '/constellation/device/start',
        stopDevice: '/constellation/device/stop',
        checkIfStopped: '/constellation/device/stopped',
        getResults: '/constellation/device/result',
    },
    CONSTELLATION_BIN_DIR: "/Users/zaklaw01/Projects/raid-constellation/build/install/raid-constellation", 
    ODROID_BIN_DIR: '/home/odroid/Constellation/raid-constellation/build/install/raid-constellation',
    views: {
        home: 'home',
        deviceManagement: 'deviceManagement',
        logs: 'logs'
    },
    models: [
        "MNIST",
        "YOLO",
        "TINY_YOLO",
        "CIFAR10",
    ],
    socket: {
        port: 3300
    },
    handleFetchErrors: handleErrors,
    deviceShutdownTimeout: 60000 // 60 seconds
};
