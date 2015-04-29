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

var LY = 9.460731e12;   // 1 light year in km

var PI = Math.PI;
var PI_HALF = Math.PI / 2;

var axis_x = new THREE.Vector3( 1, 0, 0 );
var axis_y = new THREE.Vector3( 0, 1, 0 );
var axis_z = new THREE.Vector3( 0, 0, 1 );

var camDebug = function(){
  this.position = new THREE.Vector3();
  this.x = 0;
  this.y = 0;
  this.z = 0;
}
var debug_curZoomStep = function() { this.zoom_factor = 0; }

var clamp = function ( x, min, max ) {
    return Math.min( max, Math.max( min, x ) );};

var smoothstep = function ( edge0, edge1, x ) {
    var t = clamp( ( x - edge0 ) / ( edge1 - edge0 ), 0.0, 1.0 );
    return t * t * ( 3.0 - 2.0 * t );
};
