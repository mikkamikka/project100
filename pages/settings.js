// Settings

var Global = function(){

  this.ObjScale = 1.0;
  this.DistanceScale = 0.01;
  this.starsDistanceScale = 0.001;

}

var global = new Global();

var initialCameraDistance = 4.5e6 * global.DistanceScale,
    minCameraDistance = 3e6 * global.DistanceScale,
    maxCameraDistance = LY * 100 * global.DistanceScale * global.starsDistanceScale,    // 100 light years in km
    initialCameraFOV = 60;

var zoomSpeed = 5250, fastZoomSpeed = zoomSpeed * 20,
    wheelZoomStep = 300, fastWheelZoomStep = wheelZoomStep * 20;
    fastZoom = false;

var cameraZoomDamp = 0.099;

var allowCameraLookAround = false;

var drawSkyBox = true;

var ambientLightIntensity = 0.15;

var debug = true;

var zoomSteps = [
  { id: 0, border: 0,             zoom_factor: 0 },
  { id: 1, border: 778e6,         zoom_factor: 1 },          // from Earth to Jupiter /  in km
  { id: 2, border: 6e9 + 4e9,           zoom_factor: 3 },          // from Jupiter to Pluto   / in km
  { id: 3, border: lyToKM(1.0) * global.starsDistanceScale,   zoom_factor: 15 },         // from Pluto to 1 ly   / in scaled km
  { id: 4, border: lyToKM(4.22) * global.starsDistanceScale,  zoom_factor: 30 },         // from 1 ly to first star (Proxima Centauri)  / in scaled km
  { id: 5, border: lyToKM(99.71) * global.starsDistanceScale, zoom_factor: 30 }          // from first star to last star (Beta Reticuli) / in scaled km

];
