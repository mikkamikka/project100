function kmToLY ( km ) {

  return km / 9.460731e12;

}

function lyToKM ( ly ) {

  return ly * 9.460731e12;

}

function auToKM ( au ) {

  return au * 149597870.700;

}

function kmToAU ( km ) {

  return km / 149597870.700;

}

function auToLY ( au ) {

  return au * 15.812507e-6;

}

function lyToAU ( ly ) {

  return ly / 15.812507e-6;

}

//// 100 light years is 6 323 911 AU (astronomical units)

var PI = Math.PI;
var PI_HALF = Math.PI / 2;

var LY = 9.460731e12;

var axis_x = new THREE.Vector3( 1, 0, 0 );
var axis_y = new THREE.Vector3( 0, 1, 0 );
var axis_z = new THREE.Vector3( 0, 0, 1 );

var camDebug = function(){
  this.position = new THREE.Vector3();
  this.x = 0;
  this.y = 0;
  this.z = 0;
}
