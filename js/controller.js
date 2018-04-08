DEFAULT_INTERVAL_MILLISECONDS = 8000;
DEFAULT_HOST = "http://localhost:8000";

var floorsObject = {
    first: 'L001',
    second: 'L002',
    third: 'L003',
    cafe: 'L004'
};

var ambiarc;
var directories = {};
var directories_state = {}


/**
 * Update function "OFFICE AVAILABLITY" mode. Goes through directories and activates them if they have a deviceCount above 0.
 */
var UpdateDirectories = function() {

    var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    var directoryArray = angular.element(document.getElementById('notmanCtrl')).scope().directories;

    for (var dir in directoryArray) {
        var dirId = directoryArray[dir].id
        var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + '/img/dot_gray.png';
        if (directoryArray[dir].deviceCount > 0) {
            img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +'/img/dot_green.png';
            if(directories_state[dirId]  && directories[dirId] != undefined) {
              return;
            }
            directories_state[dirId] = true;
        } else {
            if(!directories_state[dirId]  && directories[dirId] != undefined) return;
            directories_state[dirId] = false;
        }
        if (directories[dirId] != undefined && !directories_state[dirId]) {
            var device = directoryArray[dir].devices[Object.keys(directoryArray[dir].devices)[0]];
            var floorName = directoryArray[dir].id.split(':')[1];
            var floorNum = floorsObject[floorName];

            if (directoryArray[dir].deviceCount == 0){
              var latitude =  ambiarc.poiList[dirId].latitude;
              var longitude =  ambiarc.poiList[dirId].longitude;
            }
            else {
                var latitude = device.event.position[1];
                var longitude = device.event.position[0];
            }

            var mapLabelInfo = {
                mapLabelId: directories[dirId],
                buildingId: 'B00001',
                floorId: floorNum,
                showTooltip: true,
                tooltipTitle: dirId,
                latitude: latitude,
                longitude: longitude,
                category: 'Label',
                location: 'URL',
                partialPath: img,
                label: dirId,
                fontSize: 26,
                showOnCreation: true
            };
            ambiarc.updateMapLabel(directories[dirId], ambiarc.mapLabel.IconWithText, mapLabelInfo);
        } else if (directories[dirId] == undefined && directoryArray[dir].deviceCount > 0) {
            var deviceKey = Object.keys(directoryArray[dir].devices)[0];
            console.log(deviceKey);
            var dirId = dirId;
            var floorName = directoryArray[dir].id.split(':')[1];
            var floorNum = floorsObject[floorName];

            //sometimes reelyactive sends empty devices property - in that case we're creating label on next periodic update
            try{
              var latitude = directoryArray[dir].devices[deviceKey].event.position[1];
              var longitude = directoryArray[dir].devices[deviceKey].event.position[0];
            }
            catch(e){
                console.log("devices property undefined")
            }

            if(latitude && longitude) {

                var mapLabelInfo = {
                    buildingId: 'B00001',
                    floorId: floorNum,
                    showTooltip: true,
                    tooltipTitle: dirId,
                    latitude: latitude,
                    longitude: longitude,
                    category: 'Label',
                    location: 'URL',
                    label: dirId,
                    fontSize: 26,
                    partialPath: img,
                    showOnCreation: true
                };

                ambiarc.createMapLabel(ambiarc.mapLabel.IconWithText, mapLabelInfo, (labelId) => {
                    directories[dirId] = {}
                    directories[dirId] = labelId;
                ambiarc.poiList[dirId] = mapLabelInfo;
            });
            }
        }
    }
}


/**
 * Periodic updater function, updates device count and the map depending ont the state of the UI
 */
var PeriodicUpdate = function() {
  UpdateDirectories();
};

/**
 * Registers our initilization method once the iframe containing mabiarc has loaded.
 */
var iframeLoaded = function() {
  $("#ambiarcIframe")[0].contentWindow.document.addEventListener('AmbiarcAppInitialized', function() {
    onAmbiarcLoaded();
  });
};

/**
 * Starts the periodic updater method and enables the UI.
 */
var onAmbiarcLoaded = function () {
    ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    ambiarc.poiList = {};
    $('#bootstrap').removeAttr('hidden');
    $('#controls-section').fadeIn();

    setTimeout(function () {
    }, 500);
    setInterval(PeriodicUpdate, DEFAULT_INTERVAL_MILLISECONDS);

};