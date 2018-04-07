DEFAULT_INTERVAL_MILLISECONDS = 3000;
DEFAULT_HOST = "http://localhost:8000";


var directories = {};
var directories_state = {}
var unique_devices = {};
var unique_devices_state = {}
var heatmapPoints = [];
var MapModes = Object.freeze({
  "office_availability": 1,
  "heatmap": 2,
  "unique_devices": 3
});
var current_map_mode = MapModes.office_availability;

/**
 * This will hide the list of labels
 * @param  {Object} labels A JS object that has key/values. the values must be the Label id
 */
var HideLabels = function(labels) {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  for (var key in labels) {
    if (labels.hasOwnProperty(key)) {
      ambiarc.hideMapLabel(labels[key], true);
    }
  }
}

/**
 * This will show the list of labels
 * @param  {Object} labels A JS object that has key/values. the values must be the Label id
 */
var ShowLabels = function(labels) {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  for (var key in labels) {
    if (labels.hasOwnProperty(key)) {
      ambiarc.showMapLabel(labels[key], true);
    }
  }
}

/**
 * Adds the heatmap
 */
var ShowHeatmap = function() {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  GenerateHeatmapPoints();
  ambiarc.createHeatmap(heatmapPoints)
}
/**
 * Removes the heatmap
 */
var HideHeatmap = function() {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  ambiarc.destroyHeatmap()
}
/**
 * Sets the app into "OFFICE AVAILABILITY" mode
 */
var SetDirectories = function() {
  if (current_map_mode == MapModes.office_availability) return;
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  var previous_current_map_mode = current_map_mode;
  current_map_mode = MapModes.office_availability;
  ShowLabels(directories);
  HideLabels(unique_devices);
  if (previous_current_map_mode == MapModes.heatmap) {
    HideHeatmap();
  }
}
/**
 * sets the application into HEATMAP mode
 */
var SetHeatmap = function() {
  if (current_map_mode == MapModes.heatmap) return;
  current_map_mode = MapModes.heatmap;
  HideLabels(directories);
  HideLabels(unique_devices);
  ShowHeatmap();
}

/**
 * Sets the application into ""UNIQUE DEVICES" mode
 */

var SetDevices = function() {
  if (current_map_mode == MapModes.unique_devices) return;
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  var previous_current_map_mode = current_map_mode;
  current_map_mode = MapModes.unique_devices;
  ShowLabels(unique_devices);
  HideLabels(directories);
  if (previous_current_map_mode == MapModes.heatmap) {
    HideHeatmap();
  }
}
/**
 * Update function "OFFICE AVAILABLITY" mode. Goes through directories and activates them if they have a deviceCount above 0.
 */
var UpdateDirectories = function() {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  var directoryArray = angular.element(document.getElementById('notmanCtrl')).scope().directories

  for (var dir in directoryArray) {
    var dirId = directoryArray[dir].id
    var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + '/img/dot_red.png'
    if (directoryArray[dir].deviceCount > 0) {
      img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +'/img/dot_green.png'
      if(directories_state[dirId]  && directories[dirId] != undefined) return;
      directories_state[dirId] = true;
    } else {
      if(!directories_state[dirId]  && directories[dirId] != undefined) return;
      directories_state[dirId] = false;
    }
    if (directories[dirId] != undefined && !directories_state[dirId]) {
      var device = directoryArray[dir].devices[Object.keys(directoryArray[dir].devices)[0]];
      var mapLabelInfo = {
        mapLabelId: directories[dirId],
        buildingId: 'B00001',
        floorId: 'L001',
        showTooltip: true,
        tooltipTitle: dirId,
        latitude: device.event.position[1],
        longitude: device.event.position[0],
        category: 'Label',
        location: 'URL',
        partialPath: img,
        label: dirId,
        fontSize: 22,
        showOnCreation: true
      };
      ambiarc.updateMapLabel(directories[dirId], ambiarc.mapLabel.IconWithText, mapLabelInfo);
    } else if (directories[dirId] == undefined && directoryArray[dir].deviceCount > 0) {
      var deviceKey = Object.keys(directoryArray[dir].devices)[0]
      var dirId = dirId;
      var mapLabelInfo = {
        buildingId: 'B00001',
        floorId: 'L001',
        showTooltip: true,
        tooltipTitle: dirId,
        latitude: directoryArray[dir].devices[deviceKey].event.position[1],
        longitude: directoryArray[dir].devices[deviceKey].event.position[0],
        category: 'Label',
        location: 'URL',
        label: dirId,
        fontSize: 22,
        partialPath: img,
        showOnCreation: true
      };
      ambiarc.createMapLabel(ambiarc.mapLabel.IconWithText, mapLabelInfo, (labelId) => {
        directories[dirId] = {}
        directories[dirId] = labelId;
      });
    }
  }
}
/**
 * Update method for the "UNIQUE DEVICES" mode of the application. will go through the devices and highlight directories where track devices are located
 */
var UpdateUniqueDevices = function() {

  console.log("updating unique devices");

  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  var deviceArray = angular.element(document.getElementById('notmanCtrl')).scope().devices;
  var directoryArray = angular.element(document.getElementById('notmanCtrl')).scope().directories

  var activeDirs = [];
  for (var device in deviceArray) {
    console.log(deviceArray[device].deviceId)
    if (TRANSMITTER_CONFIG[deviceArray[device].deviceId]) {
      activeDirs.push(deviceArray[device].receiverDirectory)
    }
  }

  for (var dir in directoryArray) {

    var dirId = directoryArray[dir].id
    var img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +'/img/dot_gray.png'
    if (activeDirs.includes(dirId)) {
      img = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + '/img/dot_green.png'
      if(unique_devices_state[dirId]  && unique_devices[dirId] != undefined) return;
      unique_devices_state[dirId] = true;
    } else {
      if(!unique_devices_state[dirId]  && unique_devices[dirId] != undefined) return;
      unique_devices_state[dirId] = false;
    }

    if (unique_devices[dirId] != undefined) {
      var device = directoryArray[dir].devices[Object.keys(directoryArray[dir].devices)[0]];

      var mapLabelInfo = {
        mapLabelId: unique_devices[dirId],
        buildingId: 'B00001',
        floorId: 'L001',
        latitude: device.event.position[1],
        longitude: device.event.position[0],
        category: 'Label',
        location: 'URL',
        partialPath: img,
        showOnCreation: true
      };
      ambiarc.updateMapLabel(unique_devices[dirId], ambiarc.mapLabel.Icon, mapLabelInfo);
    } else if (directoryArray[dir].deviceCount > 0) {
      var deviceKey = Object.keys(directoryArray[dir].devices)[0]
      var mapLabelInfo = {
        buildingId: 'B00001',
        floorId: 'L001',
        latitude: directoryArray[dir].devices[deviceKey].event.position[1],
        longitude: directoryArray[dir].devices[deviceKey].event.position[0],
        category: 'Label',
        location: 'URL',
        label: dirId,
        partialPath: img,
        showOnCreation: true
      };

      ambiarc.createMapLabel(ambiarc.mapLabel.Icon, mapLabelInfo, (labelId) => {
        unique_devices[dirId] = {}
        unique_devices[dirId] = labelId;
      });
    }
  }
}

/**
 * Updates or local cache of heatmap points.
 */
var GenerateHeatmapPoints = function() {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  var deviceArray = angular.element(document.getElementById('notmanCtrl')).scope().devices;
  heatmapPoints = [];

  for (var device in deviceArray) {
    var heatmapPoint = {
      latitude: deviceArray[device].event.position[1],
      longitude: deviceArray[device].event.position[0],
      intensity: .06,
      radius: 10
    }
    heatmapPoints.push(heatmapPoint)
  }
}

/**
 * Updates the heatmap
 */

var UpdateHeatmap = function() {
  var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
  GenerateHeatmapPoints()

  ambiarc.updateHeatmap(heatmapPoints)
}

/**
 * Periodic updater function, updates device count and the map depending ont the state of the UI
 */
var PeriodicUpdate = function() {

  // document.getElementById("device_count").innerHTML = angular.element(document.getElementById('notmanCtrl')).scope().devices.length;

  console.log("periodic update!");

  // if (current_map_mode == MapModes.office_availability) {
  //   UpdateDirectories();
  // }
  // if (current_map_mode == MapModes.heatmap) {
  //   UpdateHeatmap();
  // }

  if (current_map_mode == MapModes.unique_devices) {
    UpdateUniqueDevices()
  }

}

/**
 * Registers our initilization method once the iframe containing mabiarc has loaded.
 */
var iframeLoaded = function() {
  $("#ambiarcIframe")[0].contentWindow.document.addEventListener('AmbiarcAppInitialized', function() {
    onAmbiarcLoaded();
  });
}

/**
 * Starts the periodic updater method and enables the UI.
 */
var onAmbiarcLoaded = function() {

  $('#bootstrap').removeAttr('hidden');

  setTimeout(function() {}, 500);
  setInterval(PeriodicUpdate, DEFAULT_INTERVAL_MILLISECONDS);

}
