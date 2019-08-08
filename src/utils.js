const handleErrors = (response) => {
    if (!response.ok) {
        throw Error(JSON.stringify(response));
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
        checkIfStopped: '/constellation/device/stopped'
    },
    CONSTELLATION_BIN_DIR: "/home/zaklaw01/Projects/odroid-constellation/edgeinference-constellation/build/install/edgeinference-constellation",
    ODROID_BIN_DIR: '/home/odroid/Constellation/edgeinference-constellation/build/install/edgeinference-constellation',
    views: {
        home: 'home',
        deviceManagement: 'deviceManagement'
    },
    models: [
        "MNIST",
        "YOLO",
        "CIFAR10"
    ],
    handleFetchErrors: handleErrors,
};