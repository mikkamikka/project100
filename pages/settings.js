// Settings

var Global = function(){

  this.ObjScale = 1.0;
  this.DistanceScale = 0.01;

}

var global = new Global();

var LY = 9.460731e12;

var initialCameraDistance = 4.5e6 * global.DistanceScale,
    minCameraDistance = 3e6 * global.DistanceScale,
    maxCameraDistance = LY * 100 * global.DistanceScale,    // 100 light years in km
    initialCameraFOV = 45;

var zoomSpeed = 1000, fastZoomSpeed = zoomSpeed * 50000,
    wheelZoomStep = 30, fastWheelZoomStep = wheelZoomStep * 20;
    fastZoom = false;

var cameraZoomDamp = 0.099;

var allowCameraLookAround = false;

var drawSkyBox = true;

var ambientLightIntensity = 0.2;

var debug = true;
