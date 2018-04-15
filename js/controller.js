DEFAULT_INTERVAL_MILLISECONDS = 1000;
DEFAULT_HOST = "http://localhost:8000";

var ambiarc;
var directories = {};
var directories_state = {};
var currentBuildingId, currentFloorId;
var previousFloor = null;

// global state indicating if the map is is Floor Selector mode
var isFloorSelectorEnabled = false;

var updateDevicesNumbers = function () {
    //all devices
    var devices = angular.element(document.getElementById('notmanCtrl')).scope().devices;

    //devices on selected floor
    var devicesOnFLoor = 0;
    $.each(devices, function (i, device) {
        if (config.recieverFloors[device.event.receiverDirectory] == currentFloorId) {
            devicesOnFLoor++;
        }
    });
    $('#tot_num_devices').html(devices.length);
    $('#floor_num_devices').html(devicesOnFLoor);
};

var updateReceiverState = function () {
    var directoriesArray = angular.element(document.getElementById('notmanCtrl')).scope().directories;

    $.each(directoriesArray, function (i, directory) {
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

        $.each(buildings, function (id, bldgValue) {
            var floorList = document.createElement('select');
                floorList.className = 'poi-floor-id poi-details-input form-control';
                floorList.setAttribute('data-bldgId', bldgValue);

            $.each(config.floorsNameHolders, function (key, value) {
                var listItem = document.createElement('option');
                    listItem.clasName = 'bldg-floor-item';
                    listItem.value = key;
                    listItem.textContent = value;
                $('#bldg-floor-select').append(listItem);
            });
        });
    });
}


// temporary not in use - waiting for possible map update
var fillBuildingsList = function () {

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

        $.each(buildings, function (id, bldgValue) {

            var floorList = document.createElement('select');
                floorList.className = 'poi-floor-id poi-details-input form-control';
                floorList.setAttribute('data-bldgId', bldgValue);

            ambiarc.getAllFloors(bldgValue, function (floors) {
                $.each(floors, function (i, floorValue) {

                    //poi details panel floor dropdown
                    var floorItem = document.createElement('option');
                    floorItem.clasName = 'floor-item';
                    floorItem.value = floorValue.id;
                    floorItem.textContent = floorValue.id;
                    $(floorList).append(floorItem);

                    // main building-floor dropdown
                    var listItem = document.createElement('option');
                    listItem.clasName = 'bldg-floor-item';
                    listItem.value = bldgValue + '::' + floorValue.id;
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
    ambiarc.poiList = {};
    ambiarc.registerForEvent(ambiarc.eventLabel.CameraMotionCompleted, cameraCompletedHandler);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected, onFloorSelected);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelectorEnabled, onEnteredFloorSelector);

    $('#bootstrap').removeAttr('hidden');
    $('#controls-section').fadeIn();
    fillBuildingsListHardcoded();

    // loading imported labels and associating maplabel ids with directory ids
    ambiarc.loadRemoteMapLabels('map/geodata.json')
        .then((mapLabels) => {
            mapLabels.forEach((element, i) => {
                var mapLabelInfo = element.properties;
                var directoryId = element.user_properties.directoryId;
                directories[directoryId] = {};
                directories[directoryId] = mapLabelInfo.id;
                ambiarc.poiList[mapLabelInfo.id] = mapLabelInfo;
            });
        });
    setTimeout(function () {
    }, 500);
    setInterval(PeriodicUpdate, DEFAULT_INTERVAL_MILLISECONDS);
};

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

var onEnteredFloorSelector = function (event) {
    var buildingId = event.detail;
    currentFloorId = null;
    if (!isFloorSelectorEnabled) {
        isFloorSelectorEnabled = true;
        $("#levels-dropdown").addClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', true);
    }
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
        var currentBuildingId = parsedValue[0];
        var currentFloorId = parsedValue[1];
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