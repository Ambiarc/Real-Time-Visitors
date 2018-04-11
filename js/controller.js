DEFAULT_INTERVAL_MILLISECONDS = 10000;
DEFAULT_HOST = "http://localhost:8000";

var ambiarc;
var directories = {};
var directories_state = {};
var currentBuildingId, currentFloorId;
var previousFloor = null;

// global state indicating if the map is is Floor Selector mode
var isFloorSelectorEnabled = false;

var updateDevicesNumbers = function(){

    //all devices
    var devices = angular.element(document.getElementById('notmanCtrl')).scope().devices;

    //devices on selected floor
    var devicesOnFLoor = 0;
    $.each(devices, function(i, device){

        if(config.recieverFloors[device.event.receiverDirectory] == currentFloorId){
            devicesOnFLoor ++;
        }
    });

    $('#tot_num_devices').html(devices.length);
    $('#floor_num_devices').html(devicesOnFLoor);
};


var updateReceiverState = function(){
    console.log("update receiver state function!");

    var directoriesArray = angular.element(document.getElementById('notmanCtrl')).scope().directories;

    $.each(directoriesArray, function(i, directory){
        var iconColor = (directory.deviceCount > 0) ? 'dot_green.png' : 'dot_gray.png';
        var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +'/img/'+iconColor;
        var mapLabelId = directories[directory.id];
        var currentLabelInfo = ambiarc.poiList[mapLabelId];
        var devicesNum = directory.deviceCount;
        var tooltipText = devicesNum+' ACTIVE VISITORS';

        currentLabelInfo.partialPath = img;
        currentLabelInfo.tooltipTitle = tooltipText;

        var mapLabelInfo = {
            mapLabelId: mapLabelId,
            buildingId: 'B00001',
            floorId: currentLabelInfo.floorId,
            showTooltip: true,
            tooltipTitle: tooltipText,
            latitude: currentLabelInfo.latitude,
            longitude: currentLabelInfo.longitude,
            category: 'Label',
            location: 'URL',
            partialPath: img,
            label: currentLabelInfo.label,
            fontSize: 26,
            showOnCreation: true
        };

        ambiarc.updateMapLabel(mapLabelId, ambiarc.mapLabel.IconWithText, mapLabelInfo);
    });
};



/**
 * Update function "OFFICE AVAILABLITY" mode. Goes through directories and activates them if they have a deviceCount above 0.
 */
var UpdateDirectories = function() {

    var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    var directoryArray = angular.element(document.getElementById('notmanCtrl')).scope().directories;

    $.each(directoryArray, function(i, directory){
        var dirId = directory.id;
        var iconColor = (directory.deviceCount > 0) ? 'dot_green.png' : 'dot_gray.png'
        var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +'/img/'+iconColor;

        if(!directories[dirId]){

            // skip to next iteration, device count < 0 and not in array
            if(directory.deviceCount == 0) return true;

            // CREATE MAP
            directories_state[dirId] = true;

            var floorNum = config.recieverFloors[directory.id];
            var deviceKey = Object.keys(directory.devices)[0];

            //sometimes reelyactive sends empty devices property - in that case we're creating label on next periodic update
            try{
                var latitude = directory.devices[deviceKey].event.position[1];
                var longitude = directory.devices[deviceKey].event.position[0];
                var devicesNum = directory.deviceCount;
                var tooltipText = devicesNum+' ACTIVE VISITORS';

                if(latitude && longitude) {

                    var mapLabelInfo = {
                        buildingId: 'B00001',
                        floorId: floorNum,
                        showTooltip: true,
                        tooltipTitle: tooltipText,
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

            // UPDATE MAP

            if (directory.deviceCount == 0){
                var latitude =  ambiarc.poiList[dirId].latitude;
                var longitude =  ambiarc.poiList[dirId].longitude;
                var devicesNum = 0;
                var tooltipText = devicesNum+' ACTIVE VISITORS';
                    directories_state[dirId] = false;
            }
            else {
                try{
                    var device = directory.devices[Object.keys(directory.devices)[0]];
                    var latitude = device.event.position[1];
                    var longitude = device.event.position[0];
                    var devicesNum = directory.deviceCount;
                    var tooltipText = devicesNum+' ACTIVE VISITORS';
                    directories_state[dirId] = true;
                }
                catch(e){
                    return true
                }
            }

            if(latitude && longitude){
                var floorNum = config.recieverFloors[directory.id];

                var mapLabelInfo = {
                    mapLabelId: directories[dirId],
                    buildingId: 'B00001',
                    floorId: floorNum,
                    showTooltip: true,
                    tooltipTitle: tooltipText,
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


function fillBuildingsListHardcoded(){

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

            $.each(config.floorsNameHolders, function(key, value){
                var listItem = document.createElement('option');
                listItem.clasName = 'bldg-floor-item';
                listItem.value = key;
                listItem.textContent = value;
                $('#bldg-floor-select').append(listItem);
            });
        });
    });
}


// temporary not in use - waiting for possble map update
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
                        // listItem.textContent = bldgValue+': '+floorValue.id;
                        listItem.textContent = config.floorsNameHolders[floorValue.id];
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
var PeriodicUpdate = function () {
    updateReceiverState();
    updateDevicesNumbers();
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

    fillBuildingsListHardcoded();
    importGeoData();

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
        console.log("REGISTERED 1000, CALLING EXTERIOR!!!")
        ambiarc.focusOnFloor(mainBldgID, null);
        currentFloorId = null;
        $('#bldg-floor-select').val('Exterior');
        isFloorSelectorEnabled = false;
    }
}


// closes the floor menu when a floor was selected
var onFloorSelected = function(event) {

    var floorInfo = event.detail;
    console.log("floor info:");
    console.log(event);
    currentFloorId = floorInfo.floorId;
    previousFloor = floorInfo.floorId;


    if(currentFloorId == null){

        console.log("current floor is null1!!!!!!");
        console.log(currentFloorId);

        $('#select2-bldg-floor-select-container').html('Exterior');
    }
    else {

        console.log("CURRENT FLOOR NOT NULL!!");
        console.log($('#bldg-floor-select').val());

        $('#select2-bldg-floor-select-container').html(config.floorsNameHolders[currentBuildingId+'::'+currentFloorId]);
        $('#bldg-floor-select').select2('close')
    }

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


var importGeoData = function(){

    console.log("import geo data!!");

    $.ajax({
        url: 'map/geodata.json',
        type: 'get',
        success: function(res) {
            console.log("success!!");
            console.log(JSON.stringify(res));

            try {
                loadReceiversData(res);
            }
            catch (e) {
                console.log("Please select valid json file");
                console.log(e);
                return;
            }
        },
        error: function(e){
            console.log("error loading file...");
            console.log(e);
        }
    });
};



var loadReceiversData = function (properties) {

    console.log("LOADING RECEIVERS DATA!!!");

    $.each(properties.features, function (i, feature) {
        var mapLabelInfo = feature.properties;
        mapLabelInfo.longitude = parseFloat(feature.geometry.coordinates[0]);
        mapLabelInfo.latitude = parseFloat(feature.geometry.coordinates[1]);

        $.each(feature.user_properties, function (prop, val) {
            mapLabelInfo[prop] = val;
        });

        console.log("mapLabelInfo before createmaplabel:");
        console.log(mapLabelInfo);

        ambiarc.createMapLabel(mapLabelInfo.type, mapLabelInfo, function(labelId) {
            // push reference of POI to list
            console.log("checking malabelproperties...:");
            console.log(mapLabelInfo);
            var dirId = mapLabelInfo.directoryId;

            directories[dirId] = {};
            directories[dirId] = labelId;
            ambiarc.poiList[labelId] = mapLabelInfo;
        });
    });
};


$('document').ready(function(){

    $('#bldg-floor-select').select2();

    $('body').on('change', '#bldg-floor-select', function(){

        console.log("changed value!!");
        console.log($(this).val());

        $('#select2-bldg-floor-select-container').html($(this).val());

        if($(this).val() == 'Exterior'){
            console.log("CALLING EXTERIOR!!!");
            // ambiarc.viewFloorSelector(mainBldgID, 1000);
            ambiarc.focusOnFloor(mainBldgID, null);

            var currentBuildingId = mainBldgID;
            var currentFloorId = null;
            return;
        }

        var parsedValue = $(this).val().split('::');
        var currentBuildingId = parsedValue[0];
        var currentFloorId = parsedValue[1];

        ambiarc.focusOnFloor(currentBuildingId, currentFloorId);
    });





    $('.floor_select_btn').find('.select2').on('click', function(){
        console.log("clicked select form");

        // console.log($('.select2-container--open').is(':visible'));

        if($('.select2-container--open').is(':visible') == false){

            console.log("CLICK EVENT");

            // return to previous floor
            if(currentBuildingId != undefined){
                // focus to exterior
                if(currentFloorId == null){ ambiarc.focusOnFloor(currentBuildingId, null);}
                // focus to normal floor
                else { ambiarc.focusOnFloor(currentBuildingId, previousFloor); }
            }

            else { ambiarc.focusOnFloor(mainBldgID, null); }

            isFloorSelectorEnabled = false;
        }

        else {
            // call selector mode
            console.log("floor selector:");
            console.log(isFloorSelectorEnabled);
            if(isFloorSelectorEnabled) { return; }
            else {
                ambiarc.viewFloorSelector(mainBldgID);
                isFloorSelectorEnabled = true;
            }
        }
    });
});