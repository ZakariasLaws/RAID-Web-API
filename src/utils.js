const handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
};

export const Utils = {
    API_URL: '/api/devices',
    RAID_URL: {
        start: '/raid/start',
        stop: '/raid/stop',
        startDevice: '/raid/device/start',
        stopDevice: '/raid/device/stop',
        checkIfStopped: '/raid/device/stopped',
        getResults: '/raid/device/result',
    },
    RAID_BIN_DIR: "/home/zakarias/Projects/raid-constellation/build/install/raid-constellation",
    DEVICE_BIN_DIR: '/home/odroid/Constellation/raid-constellation/build/install/raid-constellation',
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
