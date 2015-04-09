
var asteroid;
//var asteroid_cloud = [];

var asteroidsCloud1, asteroidsCloud2, asteroidsCloud3;

var asteroidDistanceScale = global.DistanceScale * LY /10;
var maxAsteroidRange = global.DistanceScale * 149.5e6;

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
	this.isInView = false;
	this.distFromCamera = 0;

}

function asteroidsCloud(){

  this.numAsteroids = 0;
  this.centerPos = new THREE.Vector3();
  this.asteroid_cloud = [];
	this.distribution = 0;
	this.pointCloud;
	this.isInView = false;
	this.distFromCamera = 0;

}

asteroidsCloud.prototype.initAsteroidsCloud = function() {

	for ( var i = 0; i <= this.numAsteroids; i ++ ) {

		var x = 10 * this.distribution * (0.5-Math.random()) + this.centerPos.x;
		var y = this.distribution * (0.5-Math.random()) + this.centerPos.y;
		var z = 6 * this.distribution * (0.5-Math.random()) + this.centerPos.z;

		var scale = Math.random();
		var variation = Math.round( 4 * Math.random() );
		var deform_scale = 0.5 + Math.random() * 2;

		var asteroid = new Asteroid();

		asteroid.mesh = createAsteroid ( x, y, z, scale, variation, deform_scale );

		asteroid.rotationSpeed.x = 0.02 * (0.5-Math.random());
		asteroid.rotationSpeed.y = 0.02 * (0.5-Math.random());
		asteroid.rotationSpeed.z = 0.02 * (0.5-Math.random());

		this.asteroid_cloud[i] = asteroid;

		//scene.add( this.asteroid_cloud[i].mesh );

	}


	this.pointCloud = createPointCloud (this.centerPos, this.distribution, 1000, 50000);


}


asteroidsCloud.prototype.update = function() {

	var deltaZ = this.centerPos.z - camera.position.z;    // cloud's center approximation to camera
	this.distFromCamera = camera.position.distanceTo( this.centerPos );

	for ( var i = 0; i < this.asteroid_cloud.length ; i++ ) {

		var roid = this.asteroid_cloud[i];

   	if (roid != undefined ){

			roid.mesh.rotation.x += roid.rotationSpeed.x;
			roid.mesh.rotation.y += roid.rotationSpeed.y;
			roid.mesh.rotation.z += roid.rotationSpeed.z;



			// add and remove asteroid
			roid.distFromCamera = camera.position.distanceTo( roid.mesh.position );

			if ( roid.distFromCamera < maxAsteroidRange & deltaZ > ){  // is within approximation range
				if ( !roid.isInView ) {

					scene.add( roid.mesh );
					roid.isInView = true;
					console.log("Asteroid added");
				}
			}
			else {
				if ( roid.isInView ) {

					scene.remove( roid.mesh );
					roid.isInView = false;
					console.log("Asteroid removed");
				}
			}

		}

	}


	// add and remove point cloud
	if ( this.distFromCamera < maxAsteroidRange * 2 ){  // is within approximation range
		if ( !this.pointCloud.isInView ){

			scene.add( this.pointCloud );
			this.pointCloud.isInView = true;
			console.log("pc added");
		}

	}
	else{
		if ( this.pointCloud.isInView ){

			scene.remove( this.pointCloud );
			this.pointCloud.isInView = false;
			console.log("pc removed");
		}

	}


}


function createAsteroid ( x, y, z , scale, variation, deform_scale ){

	var radius = 3000 * scale;
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
  uniforms[ "uDisplacementBias" ].value = 0; // 0.428408;
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


function createPointCloud( centerPos, distribution, numParticles, maxSize ){

	var particles, geometry, materials = [], parameters, i, h, color, sprite, size;

	var geometry = new THREE.Geometry();

	sprite1 = THREE.ImageUtils.loadTexture( "textures/asteroids/stone1.png" );
	sprite2 = THREE.ImageUtils.loadTexture( "textures/asteroids/stone1.png" );
	sprite3 = THREE.ImageUtils.loadTexture( "textures/asteroids/stone1.png" );
	sprite4 = THREE.ImageUtils.loadTexture( "textures/asteroids/stone1.png" );
	sprite5 = THREE.ImageUtils.loadTexture( "textures/asteroids/stone1.png" );

	for ( i = 0; i < numParticles; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = 10 * distribution * (0.5-Math.random()) + centerPos.x;
		vertex.y = 1 * distribution * (0.5-Math.random()) + centerPos.y;
		vertex.z = 6 * distribution * (0.5-Math.random()) + centerPos.z;

		geometry.vertices.push( vertex );

	}

	parameters = [ [ [1, 0, 0.1], sprite2, maxSize * Math.random() ],
				   [ [1, 0, 0.2], sprite3, maxSize * Math.random() ],
				   [ [1, 0, 0.1], sprite1, maxSize * Math.random() ],
				   [ [1, 0, 0.2], sprite5, maxSize * Math.random() ],
				   [ [1, 0, 0.2], sprite4, maxSize * Math.random() ],
				   ];

	for ( i = 0; i < parameters.length; i ++ ) {

		color  = parameters[i][0];
		sprite = parameters[i][1];
		size   = parameters[i][2];

		materials[i] = new THREE.PointCloudMaterial( {
															size: size,
															map: sprite,
															//blending: THREE.AdditiveBlending,
															//depthTest: false,
															transparent : true
														} );
		//materials[i].color.setHSL( color[0], color[1], color[2] );

		materials[i].color.setHex ( 0x999999 );


		particles = new THREE.PointCloud( geometry, materials[i] );

		// particles.rotation.x = Math.random() * 6;
		// particles.rotation.y = Math.random() * 6;
		// particles.rotation.z = Math.random() * 6;

		return particles;

	}


}








function initAsteroids(){

	asteroidsCloud1 = new asteroidsCloud();
	asteroidsCloud1.numAsteroids = 1000;
	asteroidsCloud1.centerPos = new THREE.Vector3( 0, 0, auToKM(1.8) * global.DistanceScale );
	asteroidsCloud1.asteroid_cloud = [];
	asteroidsCloud1.distribution = 40000000 * global.DistanceScale;

	asteroidsCloud1.initAsteroidsCloud();

	console.log("Init asteroids done");

}

function asteroidsUpdate(){

	asteroidsCloud1.update();

}
