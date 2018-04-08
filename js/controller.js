DEFAULT_INTERVAL_MILLISECONDS = 3000;
DEFAULT_HOST = "http://localhost:8000";

var floorsObject = {
    first: 'L001',
    second: 'L002',
    third: 'L003',
    cafe: 'L004'
};

var ambiarc;
var directories = {};
var directories_state = {};
var currentBuildingId, currentFloorId;

// global state indicating if the map is is Floor Selector mode
var isFloorSelectorEnabled = false;


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
};


var fillBuildingsList = function(){

    var bldgListItem = document.createElement('option');
        bldgListItem.clasName = 'bldg-list-item';
        bldgListItem.value = 'Exterior';
        bldgListItem.textContent = 'Exterior';

    $('#poi-bulding-id').append(bldgListItem);
    $('#bldg-floor-select').append(bldgListItem);

    ambiarc.getAllBuildings(function(buildings){
        mainBldgID = buildings[0];
        currentBuildingId = buildings[0];
        currentFloorId = null;

        $.each(buildings, function(id, bldgValue){

            var floorList = document.createElement('select');
            floorList.className = 'poi-floor-id poi-details-input form-control';
            floorList.setAttribute('data-bldgId', bldgValue);

            ambiarc.getAllFloors(bldgValue, function(floors){
                $.each(floors, function(i, floorValue){

                    //poi details panel floor dropdown
                    var floorItem = document.createElement('option');
                        floorItem.clasName = 'floor-item';
                        floorItem.value = floorValue.id;
                        floorItem.textContent = floorValue.id;
                        $(floorList).append(floorItem);

                    // main building-floor dropdown
                    var listItem = document.createElement('option');
                        listItem.clasName = 'bldg-floor-item';
                        listItem.value = bldgValue+'::'+floorValue.id;
                        listItem.textContent = bldgValue+': '+floorValue.id;
                    $('#bldg-floor-select').append(listItem);
                });
            });
        });

        var exteriorListItem = document.createElement('option');
        exteriorListItem.clasName = 'bldg-list-item';
        exteriorListItem.value = 'Exterior';
        exteriorListItem.textContent = 'Exterior';

        $('#poi-bulding-id').prepend(exteriorListItem);

    });
};


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

    ambiarc.registerForEvent(ambiarc.eventLabel.CameraMotionCompleted, cameraCompletedHandler);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected, onFloorSelected);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelectorEnabled, onEnteredFloorSelector);

    ambiarc.poiList = {};
    $('#bootstrap').removeAttr('hidden');
    $('#controls-section').fadeIn();

    fillBuildingsList();

    setTimeout(function () {
    }, 500);
    setInterval(PeriodicUpdate, DEFAULT_INTERVAL_MILLISECONDS);

};


var cameraCompletedHandler = function(event){

    if(currentFloorId == null){
        $('#bldg-floor-select').val('Exterior');
    }
    else {
        $('#bldg-floor-select').val(currentBuildingId+'::'+currentFloorId);
    }

    // 1000 is id for exterior
    if(event.detail == 1000){
        ambiarc.focusOnFloor(mainBldgID, null, 300);
        currentFloorId = null;
        $('#bldg-floor-select').val('Exterior');
        return;
    }
}


// closes the floor menu when a floor was selected
var onFloorSelected = function(event) {

    var floorInfo = event.detail;
    currentFloorId = floorInfo.floorId;

    if(currentFloorId !== null){
        $('#bldg-floor-select').val(currentBuildingId+'::'+currentFloorId);
    }
    else $('#bldg-floor-select').val('Exterior');
    if (isFloorSelectorEnabled) {
        $("#levels-dropdown").removeClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', false);
        isFloorSelectorEnabled = false;
    }
    console.log("Ambiarc received a FloorSelected event with a buildingId of " + floorInfo.buildingId + " and a floorId of " + floorInfo.floorId);
};


var onEnteredFloorSelector = function(event) {

    var buildingId = event.detail;
    currentFloorId = null;
    if (!isFloorSelectorEnabled) {
        isFloorSelectorEnabled = true;
        $("#levels-dropdown").addClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', true);
    }
    console.log("Ambiarc received a FloorSelectorEnabled event with a building of " + buildingId);
};

$('document').ready(function(){

    $('body').on('change', '#bldg-floor-select', function(){

        console.log("changed value!!");
        console.log($(this).val());

        if($(this).val() == 'Exterior'){
            ambiarc.viewFloorSelector(mainBldgID, 1000);
            return;
        }

        var parsedValue = $(this).val().split('::');
        var buildingId = parsedValue[0];
        var floorId = parsedValue[1];

        ambiarc.focusOnFloor(buildingId, floorId, 300);
    });

})