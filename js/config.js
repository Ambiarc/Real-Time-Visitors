var config = {

    // paretoToken: '<YOUR API KEY>'
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
    recieverFloors: {
        'notman:first:east': 'L001',
        'notman:first:west': 'L001',
        'notman:first:centre': 'L001',
        'notman:second:centre' : 'L002',
        'notman:second:west' : 'L002',
        'notman:second:east' : 'L002',
        'notman:third:west': 'L003',
        'notman:third:east': 'L003',
        'notman:cafe' : 'L004'
    },
    floorsNameHolders: {
        'B00001::L003': 'Third Floor',
        'B00001::L002': 'Second Floor',
        'B00001::L001': 'Main Floor',
        'B00001::L004': 'Basement'
    }
};

DEFAULT_INTERVAL_MILLISECONDS = 3000;
DEFAULT_HOST = "http://localhost:8000";