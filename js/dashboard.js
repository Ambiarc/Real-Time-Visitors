/**
 * Copyright reelyActive 2016-2017
 * We believe in an open Internet of Things
 */


// Constant definitions

    console.log("loaded config:");
    console.log(config);

var PARETO_TOKEN = config.paretoToken;
var PARETO_URL = config.paretoURL;

API_ROOT = config.apiRoot;
DEFAULT_SOCKET_URL = API_ROOT;
DEFAULT_DIRECTORY_ID = config.defaultDirectoryId;
DEFAULT_UPDATE_MILLISECONDS = config.defaultUpdateMiliseconds;
DEFAULT_BEAVER_OPTIONS = config.defaultBeaverOptions;

angular.module('notman', ['reelyactive.beaver'])


.controller('notmanCtrl', function($scope, $interval, beaver) {

  // Variables accessible in the HTML scope
  $scope.elapsedSeconds = 0;
  $scope.devices = [];
  $scope.directories = [];

  $scope.rssi = {};
  $scope.stories = [];

  // Variables accessible in the local scope
  var socket = io.connect(DEFAULT_SOCKET_URL, { query: { token: PARETO_TOKEN } });
  var updateSeconds = DEFAULT_UPDATE_MILLISECONDS / 1000;
  var devices = beaver.getDevices();
  var directories = beaver.getDirectories();

  // beaver.js listens on the websocket for events
  beaver.listen(socket, DEFAULT_BEAVER_OPTIONS);


  // Sample the current state of all detected devices
  function sampleDevices() {
    var devicesArray = [];
    for(id in devices) {
      var device = devices[id];
      devicesArray.push(device);
    }
    $scope.devices = devicesArray;
  }

  // Sample the current state of the directories
  function sampleDirectories() {
    var directoryArray = [];

    for(id in directories) {
      var directory = directories[id];
      if(id !== 'null') {
        directory.id = id;
      }
      else {
        directory.id = DEFAULT_DIRECTORY_ID;
      }
      directory.receiverCount = Object.keys(directory.receivers).length;
      directory.deviceCount = Object.keys(directory.devices).length;
      directoryArray.push(directory);
    }

    $scope.directories = directoryArray;
  }



  // Periodic update of display variables
  function periodicUpdate() {
    $scope.elapsedSeconds += updateSeconds;
    sampleDevices();
    sampleDirectories();

  }

  // Update the update period
  $scope.updatePeriod = function(period) {
    if(period) {
      updateSeconds = period / 1000;
      $scope.updateMessage = "Updating every " + updateSeconds + "s";
      $interval.cancel($scope.updatePromise);
      $scope.updatePromise = $interval(periodicUpdate, period);
      periodicUpdate();
    }
    else {
      $scope.updateMessage = "Updates paused";
      $interval.cancel($scope.updatePromise);
    }
  };

  $scope.updatePeriod(DEFAULT_UPDATE_MILLISECONDS);
});
