DEFAULT_INTERVAL_MILLISECONDS = 1000;
DEFAULT_HOST = "http://localhost:8000";

var ambiarc;
var directories = {};
var currentBuildingId, currentFloorId;
var previousFloor = null;

// global state indicating if the map is is Floor Selector mode
var isFloorSelectorEnabled = false;

var updateDevicesNumbers = function () {
    //all devices
    var devices = angular.element(document.getElementById('notmanCtrl')).scope().devices;

    //devices on selected floor
    var devicesOnFLoor = 0;
    devices.forEach(function(device, i){
        if (config.recieverFloors[device.event.receiverDirectory] == currentFloorId) {
            devicesOnFLoor++;
        }
    });
    $('#tot_num_devices').html(devices.length);
    $('#floor_num_devices').html(devicesOnFLoor);
};

var updateReceiverState = function () {
    var directoriesArray = angular.element(document.getElementById('notmanCtrl')).scope().directories;

    directoriesArray.forEach(function(directory, i){
        var iconColor = (directory.deviceCount > 0) ? 'dot_green.png' : 'dot_gray.png';
        var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + '/img/' + iconColor;
        var mapLabelId = directories[directory.id];
        var currentLabelInfo = ambiarc.poiList[mapLabelId];
        var devicesNum = directory.deviceCount;
        var tooltipText = devicesNum + ' ACTIVE VISITORS';

        if (typeof currentLabelInfo === 'undefined') {
            return;
        }
        currentLabelInfo.partialPath = img;
        currentLabelInfo.tooltipTitle = tooltipText;

        var mapLabelInfo = {
            location: 'URL',
            collapsedIconLocation: 'URL',
            collapsedIconPartialPath:  img,
            partialPath: img,
            showTooltip: true,
            tooltipTitle: tooltipText
        };
        ambiarc.updateMapLabel(mapLabelId, ambiarc.mapLabel.IconWithText, mapLabelInfo);
    });
};

function fillBuildingsListHardcoded() {
    var bldgListItem = document.createElement('option');
        bldgListItem.clasName = 'bldg-list-item';
        bldgListItem.value = 'Exterior';
        bldgListItem.textContent = 'Exterior';
    $('#poi-bulding-id').append(bldgListItem);
    $('#bldg-floor-select').append(bldgListItem);

    ambiarc.getAllBuildings(function (buildings) {
        mainBldgID = buildings[0];
        currentBuildingId = buildings[0];
        currentFloorId = null;

        buildings.forEach(function(bldgValue, id){
            var floorList = document.createElement('select');
                floorList.className = 'poi-floor-id poi-details-input form-control';
                floorList.setAttribute('data-bldgId', bldgValue);

            for(var key in config.floorsNameHolders){
                var value = config.floorsNameHolders[key];
                var listItem = document.createElement('option');
                    listItem.clasName = 'bldg-floor-item';
                    listItem.value = key;
                    listItem.textContent = value;
                $('#bldg-floor-select').append(listItem);
            };
        });
    });
}

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
var iframeLoaded = function () {
    $("#ambiarcIframe")[0].contentWindow.document.addEventListener('AmbiarcAppInitialized', function () {
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
    ambiarc.registerForEvent(ambiarc.eventLabel.StartedLoadingMap, mapStartedLoading);
    ambiarc.registerForEvent(ambiarc.eventLabel.FinishedLoadingMap, mapFinishedLoading);
    ambiarc.setMapAssetBundleURL(location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")));
    ambiarc.loadMap('notman');


};

  var mapStartedLoading = function() {

 }

  var mapFinishedLoading = function() {
     $('#bootstrap').removeAttr('hidden');
    $('#controls-section').fadeIn();
    fillBuildingsListHardcoded();
    ambiarc.poiList = {};
    ambiarc.setSkyColor("#d6ebf2","#f2ddd6")
    ambiarc.setLightColor("#A0A0A0","#A0A0A0","#A0A0A0");
    // loading imported labels and associating maplabel ids with directory ids
    ambiarc.loadRemoteMapLabels('map/geodata.json')
        .then(function(mapLabels){
            mapLabels.forEach(function(element, i){
                var mapLabelInfo = element.properties;
                var directoryId = element.user_properties.directoryId;
                directories[directoryId] = {};
                directories[directoryId] = mapLabelInfo.mapLabelId;
                ambiarc.poiList[mapLabelInfo.mapLabelId] = mapLabelInfo;
            });
        });
    setTimeout(function () {
    }, 500);
    ambiarc.setMapTheme(ambiarc.mapTheme.light);
    setInterval(PeriodicUpdate, DEFAULT_INTERVAL_MILLISECONDS);

    ambiarc.hideLoadingScreen();
  }

var cameraCompletedHandler = function (event) {
    if (currentFloorId == null) {
        $('#bldg-floor-select').val('Exterior');
    }
    else {
        $('#bldg-floor-select').val(currentBuildingId + '::' + currentFloorId);
    }

    // 1000 is id for exterior
    if (event.detail == 1000) {
        console.log("REGISTERED 1000, CALLING EXTERIOR!!!")
        ambiarc.focusOnFloor(mainBldgID, null);
        currentFloorId = null;
        $('#bldg-floor-select').val('Exterior');
        isFloorSelectorEnabled = false;
    }
};

// closes the floor menu when a floor was selected
var onFloorSelected = function (event) {
    var floorInfo = event.detail;
    currentFloorId = floorInfo.floorId;
    previousFloor = floorInfo.floorId;

    if (currentFloorId == null) {
        $('#select2-bldg-floor-select-container').html('Exterior');
    }
    else {
        $('#select2-bldg-floor-select-container').html(config.floorsNameHolders[currentBuildingId + '::' + currentFloorId]);
        $('#bldg-floor-select').select2('close')
    }

    if (currentFloorId !== null) {
        $('#bldg-floor-select').val(currentBuildingId + '::' + currentFloorId);
    }
    else $('#bldg-floor-select').val('Exterior');
    if (isFloorSelectorEnabled) {
        $("#levels-dropdown").removeClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', false);
        isFloorSelectorEnabled = false;
    }
    console.log("Ambiarc received a FloorSelected event with a buildingId of " + floorInfo.buildingId + " and a floorId of " + floorInfo.floorId);
};

var onEnteredFloorSelector = function(){
    isFloorSelectorEnabled = true;
};

$('document').ready(function () {

    //initializing selec2 selector
    $('#bldg-floor-select').select2();

    $('body').on('change', '#bldg-floor-select', function () {
        $('#select2-bldg-floor-select-container').html($(this).val());
        if ($(this).val() == 'Exterior') {
            ambiarc.focusOnFloor(mainBldgID, null);
            currentBuildingId = mainBldgID;
            currentFloorId = null;
            return;
        }
        var parsedValue = $(this).val().split('::');
        currentBuildingId = parsedValue[0];
        currentFloorId = parsedValue[1];
        ambiarc.focusOnFloor(currentBuildingId, currentFloorId);
    });

    $('.floor_select_btn').find('.select2').on('click', function () {
        if ($('.select2-container--open').is(':visible') == false) {
            // return to previous floor
            if (currentBuildingId != undefined) {
                // focus to exterior
                if (currentFloorId == null) { ambiarc.focusOnFloor(currentBuildingId, null); }
                // focus to normal floor
                else { ambiarc.focusOnFloor(currentBuildingId, previousFloor); }
            }
            else {ambiarc.focusOnFloor(mainBldgID, null);}
            isFloorSelectorEnabled = false;
        }
        else {
            // call selector mode
            if (isFloorSelectorEnabled) return;
            else {
                ambiarc.viewFloorSelector(mainBldgID);
                isFloorSelectorEnabled = true;
            }
        }
    });
});
