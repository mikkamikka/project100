// Settings

var Global = function(){

  this.ObjScale = 1.0;
  this.DistanceScale = 0.01;

}

var global = new Global();


var initialCameraDistance = 35000;// * global.DistanceScale,
    minCameraDistance = 30000;// * global.DistanceScale,
    maxCameraDistance = 9.460731e12 * 100 * global.DistanceScale;

var zoomSpeed = 1000, fastZoomSpeed = 100000, wheelZoomStep = 30,
    fastZoom = false;

var drawSkyBox = true;

var debug = true;
