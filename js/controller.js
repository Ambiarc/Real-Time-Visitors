DEFAULT_INTERVAL_MILLISECONDS = 1000;
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

    var devices = angular.element(document.getElementById('notmanCtrl')).scope().devices;
    console.log("all devices locations:");
    $('#num_devices').html(devices.length);

    $.each(devices, function(a,b){
        console.log(b.event.receiverDirectory);
    });


    var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    var directoryArray = angular.element(document.getElementById('notmanCtrl')).scope().directories;

    $.each(directoryArray, function(i, directory){

        console.log("each...");
        console.log(directory);
        var dirId = directory.id;

        var iconColor = (directory.deviceCount > 0) ? 'dot_green.png' : 'dot_gray.png'
        var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +'/img/'+iconColor;

        if(!directories[dirId]){

            // skip to next iteration, device count < 0 and not in array
            if(directory.deviceCount == 0) return true;

            console.log("creating...");
            // CREATE MAP
            directories_state[dirId] = true;

            var floorName = directory.id.split(':')[1];
            var floorNum = floorsObject[floorName];
            var deviceKey = Object.keys(directory.devices)[0];

            //sometimes reelyactive sends empty devices property - in that case we're creating label on next periodic update
            try{
                var latitude = directory.devices[deviceKey].event.position[1];
                var longitude = directory.devices[deviceKey].event.position[0];
                var devicesNum = directory.deviceCount;

                if(latitude && longitude) {

                    var mapLabelInfo = {
                        buildingId: 'B00001',
                        floorId: floorNum,
                        showTooltip: true,
                        tooltipTitle: devicesNum,
                        latitude: latitude,
                        longitude: longitude,
                        category: 'Label',
                        location: 'URL',
                        label: dirId,
                        fontSize: 26,
                        partialPath: img,
                        showOnCreation: true
                    };

                    ambiarc.createMapLabel(ambiarc.mapLabel.IconWithText, mapLabelInfo, function(labelId) {
                        directories[dirId] = {};
                        directories[dirId] = labelId;
                    ambiarc.poiList[dirId] = mapLabelInfo;
                    });
                }

            }
            catch(e){
                console.log("devices property undefined")
            }
        }
        else {

            console.log("UPDATING MAP LABEL:");
            console.log(img);
            // UPDATE MAP

            if (directory.deviceCount == 0){
                var latitude =  ambiarc.poiList[dirId].latitude;
                var longitude =  ambiarc.poiList[dirId].longitude;
                var devicesNum = 0;
                    directories_state[dirId] = false;
            }
            else {
                try{
                    var device = directory.devices[Object.keys(directory.devices)[0]];
                    var latitude = device.event.position[1];
                    var longitude = device.event.position[0];
                    var devicesNum = directory.deviceCount;
                    directories_state[dirId] = true;
                }
                catch(e){
                    return true
                }
            }

            if(latitude && longitude){
                var floorName = directory.id.split(':')[1];
                var floorNum = floorsObject[floorName];

                var mapLabelInfo = {
                    mapLabelId: directories[dirId],
                    buildingId: 'B00001',
                    floorId: floorNum,
                    showTooltip: true,
                    tooltipTitle: devicesNum,
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
                ambiarc.poiList[dirId] = mapLabelInfo;
            }
        }
    });
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