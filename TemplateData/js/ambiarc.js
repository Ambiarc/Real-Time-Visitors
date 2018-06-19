(function() {
  var setup = function Ambiarc() {
    this.messageQueue = [];
    this.eventLabel = {
      FloorSelectorEnabled: 'FloorSelectorEnabled',
      FloorSelectorDisabled: 'FloorSelectorDisabled',
      FloorSelected: 'FloorSelected',
      FloorSelectorFloorFocusChanged: 'FloorSelectorFloorFocusChanged',
      MapLabelSelected: 'MapLabelSelected',
      BuildingSelected: 'BuildingSelected',
      CameraMotionStarted: 'CameraMotionStarted',
      CameraMotionCompleted: 'CameraMotionCompleted',
      CameraRotateStarted: 'CameraRotateStarted',
      CameraRotateCompleted: 'CameraRotateCompleted',
      CameraZoomStarted: 'CameraZoomStarted',
      CameraZoomCompleted: 'CameraZoomCompleted',
      BuildingExitCompleted: 'BuildingExitCompleted',
      ActionIgnored: 'ActionIgnored',
      AmbiarcAppInitialized: 'AmbiarcAppInitialized',
      RightMouseDown: 'RightMouseDown',
      StartedLoadingMap: 'StartedLoadingMap',
      FinishedLoadingMap: 'FinishedLoadingMap'
    };
    this.mapLabel = {
      Icon: "Icon",
      Text: "Text",
      IconWithText: "IconWithText"
    }
    this.mapTheme = {
      dark: "dark",
      light: "light"
    }
    this.coordType = {
      gps: "gps",
      world: "world"
    }
    this.getMapPositionAtCursor = function(coordType, callback) {
      this.messageQueue.push(callback);
      gameInstance.SendMessage('Ambiarc', 'GetMapPositionAtCursor', coordType);
    };
    this.createMapLabel = function(mapLabelType, maplLabelInfo, idCallback) {

      this.messageQueue.push(idCallback);
      var json = JSON.stringify({
        mapLabelType: mapLabelType,
        mapLabelInfo: maplLabelInfo
      });
      gameInstance.SendMessage('Ambiarc', 'CreateMapLabel', json);
    };
    this.updateMapLabel = function(mapLabelId, mapLabelType, mapLabelInfo) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        mapLabelType: mapLabelType,
        mapLabelInfo: mapLabelInfo
      });
      gameInstance.SendMessage('Ambiarc', 'UpdateMapLabel', json);
    };
    this.SmoothUpdateMapLabelPosition = function(mapLabelId, latitude, longitude, duration) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        latitude: latitude,
        longitude: longitude,
        duration: duration
      });
      gameInstance.SendMessage('Ambiarc', 'SmoothUpdateMapLabelPosition', json);
    };

    this.StopTrackingMapLabel= function() {

      gameInstance.SendMessage('Ambiarc', 'StopTrackingMapLabel');
    };

     this.TrackMapLabel= function(mapLabelId, height, followSpeed) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        height: height,
        followSpeed: followSpeed
      });
      gameInstance.SendMessage('Ambiarc', 'StartTrackingMapLabel', json);
    };

    this.destroyMapLabel = function(mapLabelId) {
      gameInstance.SendMessage('Ambiarc', 'DestroyMapLabel', mapLabelId);
    };
    this.showMapLabel = function(mapLabelId, immediate) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        immediate: immediate
      });
      gameInstance.SendMessage('Ambiarc', 'ShowMapLabel', json);
    };
    this.hideMapLabel = function(mapLabelId, immediate) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        immediate: immediate
      });
      gameInstance.SendMessage('Ambiarc', 'HideMapLabel', json);
    };
    this.showMapCallout = function(mapCallout, idCallback) {
      this.messageQueue.push(idCallback);
      var json = JSON.stringify(mapCallout);
      gameInstance.SendMessage('Ambiarc', 'ShowMapCallout', mapCallout);
    };
    this.dismissMapCallout = function(mapLabelId) {
      gameInstance.SendMessage('Ambiarc', 'DismissMapCallout', mapLabelId);
    };
    this.focusOnMapLabel = function(mapLabelId, cameraMotionId) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        cameraMotionId: cameraMotionId
      });
      gameInstance.SendMessage('Ambiarc', 'FocusOnMapLabel', json);
    };
    this.focusOnFloor = function(buildingId, floorId, cameraMotionId, requireFloorFocus, instant) {
      var json = JSON.stringify({
        buildingId: buildingId,
        floorId: floorId,
        cameraMotionId: cameraMotionId,
        requireFloorFocus: requireFloorFocus,
        instant: instant
      });
      gameInstance.SendMessage('Ambiarc', 'FocusOnFloor', json);
    }
    this.viewFloorSelector = function(buildingId, cameraMotionId) {
      var json = JSON.stringify({
        buildingId: buildingId,
        cameraMotionId: cameraMotionId
      });
      gameInstance.SendMessage('Ambiarc', 'ViewFloorSelector', json);
    };
    this.getAllBuildings = function(cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage('Ambiarc', 'GetAllBuildings');
    };
    this.getAllFloors = function(buildingId, cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage('Ambiarc', 'GetAllFloors', buildingId);
    };
    this.getCurrentFloor = function(cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage('Ambiarc', 'GetCurrentFloor');
    };
    this.setColorByCategory = function(category, color) {
      var json = JSON.stringify({
        category: category,
        colorHex: color
      });
      gameInstance.SendMessage('Ambiarc', 'SetColorByCategory', json);
    };
    this.setLightColor = function(skyColor, equatorColor, groundColor) {
      var json = JSON.stringify({
        skyColor: skyColor,
        equatorColor: equatorColor,
        groundColor: groundColor
      });
      gameInstance.SendMessage('Ambiarc', 'SetLightColor', json);
    };
    this.setSkyColor = function(topColor, bottomColor) {
      var json = JSON.stringify({
        topColor: topColor,
        bottomColor: bottomColor
      });
      gameInstance.SendMessage('Ambiarc', 'SetSkyColor', json);
    };
    this.setMapTheme = function(theme) {
      var jsonColorTheme;
      if (theme === this.mapTheme.dark) {
        jsonColorTheme = JSON.stringify(window.AmbiarcThemes.darkTheme);
      } else if (theme === this.mapTheme.light) {
        jsonColorTheme = JSON.stringify(window.AmbiarcThemes.lightTheme);
      }
      gameInstance.SendMessage('Ambiarc', 'SetColorsByTheme', jsonColorTheme);
    };
    this.setGPSCoordinatesOrigin = function(latitude, longitude) {
      var json = JSON.stringify({
        latitude: latitude,
        longitude: longitude
      });
      gameInstance.SendMessage('Ambiarc', 'SetGPSCoordinatesOrigin', json);
    };
    this.createHeatmap = function(heatmapPoints) {
      var json = JSON.stringify(heatmapPoints);
       console.log(json);
      gameInstance.SendMessage('Ambiarc', 'CreateHeatmap', json);
    };
    this.updateHeatmap = function(heatmapPoints) {
      var json = JSON.stringify(heatmapPoints);
      console.log(json);
      gameInstance.SendMessage('Ambiarc', 'UpdateHeatmap', json);
    };
    this.destroyHeatmap = function() {
      gameInstance.SendMessage('Ambiarc', 'DestroyHeatmap');
    };
    this.rotateCamera = function(rotationAmountInDegrees, duration) {
      var json = JSON.stringify({
        degrees: rotationAmountInDegrees,
        duration: duration
      });
      gameInstance.SendMessage('Ambiarc', 'TweenRotateCamera', json);
    };
    this.zoomCamera = function(normalizedZoomIncrement, duration) {
      var json = JSON.stringify({
        zoomIncrement: normalizedZoomIncrement,
        duration: duration
      });
      gameInstance.SendMessage('Ambiarc', 'TweenZoomCamera', json);
    };
    this.exitBuilding = function() {
      gameInstance.SendMessage('Ambiarc', 'ExitBuilding');
    }
    this.registerForEvent = function(eventLabel, cb) {
      var validLabel = this.eventLabel.hasOwnProperty(eventLabel);
      if (validLabel === false) {
        throw 'Invalid label. Please use Ambiarc.eventLabel to choose the event to register to.';
      }
      document.addEventListener(eventLabel, cb);
    };
    this.unregisterEvent = function(eventLabel, cb) {
      document.removeEventListener(eventLabel, cb);
    };
    this.setMapAssetBundleURL = function(url) {
      gameInstance.SendMessage('Ambiarc', 'SetMapAssetBundleURL', url);
    }
    this.loadMap = function(map) {
      gameInstance.SendMessage('Ambiarc', 'LoadMap', map);
    };
    this.hideLoadingScreen = function() {
      gameInstance.SendMessage('Ambiarc', 'HideLoadingScreen');
    };
    this.loadEmbeddedPOIs = function() {
      gameInstance.SendMessage('Ambiarc', 'LoadEmbeddedPOIs');
    }

    this.loadRemoteMapLabels = function(url, options) {
      return fetch(url, options)
        .then(res => res.json())
        .then((out) => {
          return new Promise(function(resolve, reject) {
            out.features.forEach(function(element) {
              element.properties.latitude = element.geometry.coordinates[1];
              element.properties.longitude = element.geometry.coordinates[0];
              window.Ambiarc.createMapLabel(element.properties.type, element.properties, function(id) {
                 element.properties.mapLabelId = id;
              })
            });
           resolve(out.features)
          });
        })
        .catch(err => {
          throw err
        });
    };
  };
  window.Ambiarc = new setup();
})(window);

$(document).ready(function() {
  parent.iframeLoaded();
});
