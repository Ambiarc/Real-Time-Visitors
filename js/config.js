var config = {

    // paretoToken: <API KEY GOES HERE>,
    paretoURL: 'https://pareto.reelyactive.com',
    apiRoot: 'https://pareto.reelyactive.com',
    defaultDirectoryId: 'Unspecified',
    defaultUpdateMiliseconds: 1000,
    defaultBeaverOptions: {
        mergeEvents: true,
        mergeEventProperties: [ 'receiverId', 'receiverDirectory', 'rssi' ],
        maintainDirectories: true,
        observeOnlyFiltered: true,
        filters: {
            minSessionDuration: 60000,
            maxSessionDuration: 86400000
        }
    },
};

DEFAULT_INTERVAL_MILLISECONDS = 3000;
DEFAULT_HOST = "http://localhost:8000";