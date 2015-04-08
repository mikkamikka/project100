
var asteroid;
var asteroid_cloud = [];

var asteroidDistanceScale = global.DistanceScale * LY /10;
var maxAsteroidRange = global.DistanceScale * 149.5e6 * 3000;  //30AU, Pluto orbit distance

function Asteroid(){

	//this.id = 0;
	//this.position = new THREE.Vector3();
  //this.scale = 1.0;
	//this.distance = 0;
	//this.color = 0x000000;
	this.mesh = null;
	this.distFromCamera =  0;
	this.isInCameraRange = false;
	this.rotationSpeed = new THREE.Vector3();

}

// function asteroidCloud(){
//
//   this.numAsteroids = 0;
//   this.centerPos = new THREE.Vector3();
//   this.bodies = [];
//
// }


function createAsteroid ( x, y, z , scale, variation, deform_scale ){

	var radius = 1000 * scale;
	var details = Math.round( scale * 3 );

  //var geometryAsteroid = new THREE.SphereGeometry( radius, 10, 5 );
  var geometryAsteroid = new THREE.IcosahedronGeometry( radius, details );
  geometryAsteroid.computeTangents();

  // var materialAsteroid = new THREE.MeshPhongMaterial( {
  //    map: textureAsteroid,
  //    bumpMap: bumpmapAsteroid,
  //    bumpScale: 20,
  //    color: 0xffffff,
  //    shininess: 10
  // } );

  // displacement mapping

  var diffuse = 0x999990, specular = 0x111111, shininess = 1;

  // normal map shader

  var shader = THREE.NormalDisplacementShader;
  var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  uniforms[ "enableAO" ].value = false;
  uniforms[ "enableDiffuse" ].value = false;
  uniforms[ "enableSpecular" ].value = false;
  uniforms[ "enableReflection" ].value = false;
  uniforms[ "enableDisplacement" ].value = true;

	//uniforms[ "tDiffuse" ].value = THREE.ImageUtils.loadTexture( "textures/asteroids/roid_displ1.jpg" );

  uniforms[ "tNormal" ].value = THREE.ImageUtils.loadTexture( "textures/asteroids/noise_normal.jpg" );

  //uniforms[ "tAO" ].value = THREE.ImageUtils.loadTexture( "textures/asteroids/noise_ao.jpg" );

  uniforms[ "tDisplacement" ].value = THREE.ImageUtils.loadTexture( "textures/asteroids/roid_displ" + variation + ".jpg" );
  uniforms[ "uDisplacementBias" ].value =  0.428408;
  uniforms[ "uDisplacementScale" ].value = radius * deform_scale;

  uniforms[ "uNormalScale" ].value.y = 0.1;

  uniforms[ "diffuse" ].value.setHex( diffuse );
  //uniforms[ "specular" ].value.setHex( specular );

  uniforms[ "shininess" ].value = shininess;

  //uniforms[ "tCube" ].value = null; //reflectionCube;
  //uniforms[ "reflectivity" ].value = 0.1;

  uniforms[ "diffuse" ].value.convertGammaToLinear();
  uniforms[ "specular" ].value.convertGammaToLinear();


  var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: false };
  var materialDisplacement = new THREE.ShaderMaterial( parameters );

  var meshAsteroid = new THREE.Mesh( geometryAsteroid, materialDisplacement );
  //meshAsteroid.scale.set( scale, scale, scale );
  meshAsteroid.position.set( x, y, z );

	return meshAsteroid;

}



function initAsteroids(){

	var cloud_pos = new THREE.Vector3(0, 0, 30000);
	var distribution = 50000;

	for ( var i = 0; i <= 100; i ++ ) {

		var x = distribution * (0.5-Math.random()) + cloud_pos.x;
		var y = distribution * (0.5-Math.random()) + cloud_pos.y;
		var z = distribution * (0.5-Math.random()) + cloud_pos.z;

		var scale = Math.random();
		var variation = Math.round( 4 * Math.random() );
		var deform_scale = 0.5 + Math.random() * 2;

		var asteroid = new Asteroid();

		asteroid.mesh = createAsteroid (x, y, z, scale, variation, deform_scale);

		asteroid.rotationSpeed.x = 0.02 * (0.5-Math.random());
		asteroid.rotationSpeed.y = 0.02 * (0.5-Math.random());
		asteroid.rotationSpeed.z = 0.02 * (0.5-Math.random());

		asteroid_cloud[i] = asteroid;

		scene.add( asteroid_cloud[i].mesh );

	}

  console.log("Init asteroids done");

}

function asteroidsUpdate(){


	for ( var i = 0; i < asteroid_cloud.length ; i++ ) {

		var roid = asteroid_cloud[i];

   	if (roid != undefined ){

			roid.mesh.rotation.x += roid.rotationSpeed.x;
			roid.mesh.rotation.y += roid.rotationSpeed.y;
			roid.mesh.rotation.z += roid.rotationSpeed.z;

		}
				//asteroid_cloud[i].update();

	}


}



Asteroid.prototype.update = function(){

	// this.distFromCamera = camera.position.distanceTo( this.position );
  //
	// if (this.distFromCamera < maxFlareRange){
	// 	if (this.body == null) {
	// 		initStarBody(this);
	// 		scene.add(this.body);
	// 		this.isInCameraRange = true;
	// 		console.log("Star body added");
	// 	}
	// }
	// else {
	// 	if (this.body != null) {
	// 		scene.remove(this.body);
	// 		this.body = null;
	// 		this.isInCameraRange = false;
	// 		console.log("Star body removed");
	// 	}
	// }

}
