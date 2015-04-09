// Settings

var Global = function(){

  this.ObjScale = 1.0;
  this.DistanceScale = 0.01;

}

var global = new Global();


var initialCameraDistance = 45000;// * global.DistanceScale,
    minCameraDistance = 30000;// * global.DistanceScale,
    maxCameraDistance = 9.460731e12 * 100,
    initialCameraFOV = 45;

var zoomSpeed = 1000, fastZoomSpeed = zoomSpeed * 100,
    wheelZoomStep = 30, fastWheelZoomStep = wheelZoomStep * 20;
    fastZoom = false;

var cameraZoomDamp = 0.099;

var allowCameraLookAround = false;

var drawSkyBox = true;

var ambientLightIntensity = 0.2;

var debug = true;
