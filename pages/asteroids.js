
var asteroid;
//var asteroid_cloud = [];

var asteroidsCloud1, asteroidsCloud2, asteroidsCloud3;

//var asteroidDistanceScale = global.DistanceScale * LY /10;
var maxAsteroidRange = global.DistanceScale * 100e6;
var maxAsteroidRadius = 2000;

var fog = new THREE.Fog( 0x4584b4, - 100, 3000 );

var cloudShader = {
      uniforms: {
        'texture': { type: 't', value: null },
				'fogColor' : { type: "c", value: fog.color },
				'fogNear' : { type: "f", value: 0 },
				'fogFar' : { type: "f", value: 3e7 },
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
				'uniform vec3 fogColor;',
				'uniform float fogNear;',
				'uniform float fogFar;',
        'varying vec2 vUv;',
        'void main() {',

					'float depth = gl_FragCoord.z / gl_FragCoord.w;',
					'float fogFactor = smoothstep( fogNear, fogFar, depth );',

					'gl_FragColor = texture2D( texture, vUv );',
					'//gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );',
					'//gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',


					'float alpha = ( fogFar - depth ) / ( fogFar - fogNear );',

					'//gl_FragColor = mix( gl_FragColor, vec4( gl_FragColor.xyz, gl_FragColor.w ), fogFactor );',

					'//if ( alpha > 0.5 ) alpha = 1.0 - alpha;',
					'alpha = smoothstep( 0.0, 0.05, alpha ) * ( 1.0 - smoothstep( 0.8, 1.0, alpha ));',

					'gl_FragColor.w = gl_FragColor.w * alpha;',
					'gl_FragColor = vec4( gl_FragColor.xyz, gl_FragColor.w );',

        '}'
      ].join('\n')
}


function Asteroid(){
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
	this.pointClouds = [];
	this.isInView = false;
	this.distFromCamera = 0;
	this.dustCloud;
}

asteroidsCloud.prototype.initAsteroidsCloud = function() {

	var dist = new Random();

	for ( var i = 0; i <= this.numAsteroids; i ++ ) {

		//var gaussian = require('gaussian');


		//console.log( dist.normal(0, 1) );

		var x = this.distribution * dist.normal(0, 0.5) + this.centerPos.x;
		var y = this.distribution * dist.normal(0, 0.3) + this.centerPos.y;
		var z = this.distribution * dist.normal(0, 0.5) + this.centerPos.z;

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


	this.pointClouds = createPointClouds (this.centerPos, this.distribution, 300, 10000);
	this.dustCloud = createDustCloud (this.centerPos, this.distribution, 30, 1e6);
	scene.add( this.dustCloud );

}


asteroidsCloud.prototype.update = function() {


	this.distFromCamera = camera.position.distanceTo( this.centerPos );			// cloud's center approximation to camera

	for ( var i = 0; i < this.asteroid_cloud.length ; i++ ) {

		var roid = this.asteroid_cloud[i];

   	if (roid != undefined ){

			roid.mesh.rotation.x += roid.rotationSpeed.x;
			roid.mesh.rotation.y += roid.rotationSpeed.y;
			roid.mesh.rotation.z += roid.rotationSpeed.z;



			// add and remove asteroid
			roid.distFromCamera = camera.position.distanceTo( roid.mesh.position );
			var deltaZ = roid.mesh.position.z - camera.position.z;

			if ( roid.distFromCamera < maxAsteroidRange ){  // is within approximation range
				if ( !roid.isInView && deltaZ < 100) {

					scene.add( roid.mesh );
					roid.isInView = true;
					if (debug) console.log("Asteroid added");
				}
			}
			else {
				if ( roid.isInView ) {

					scene.remove( roid.mesh );
					roid.isInView = false;
					if (debug) console.log("Asteroid removed");
				}
			}

		}

	}


	// add and remove point clouds
	if ( this.distFromCamera < maxAsteroidRange * 10 ){  // is within approximation range


		if ( !this.isInView ){
			for (var i=0; i < this.pointClouds.length; i++){
				scene.add( this.pointClouds[i] );
			}
			this.isInView = true;
			if (debug) console.log("point cloud added " + i);
		}

	}
	else{
		if ( this.isInView ){
			for (var i=0; i < this.pointClouds.length; i++){
				scene.remove( this.pointClouds[i] );
			}
			this.isInView = false;
			if (debug) console.log("point cloud removed " + i);
		}

	}

}

function createAsteroid ( x, y, z , scale, variation, deform_scale ){

	var radius = maxAsteroidRadius * scale;
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

function createPointClouds ( centerPos, distribution, numParticles, maxSize ){

	var particles = [], geometries = [], materials = [], parameters, i, j, h, color, sprite = [], size;

	sprite[0] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone1.png" );
	sprite[1] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone2.png" );
	sprite[2] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone3.png" );
	sprite[3] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone4.png" );
	sprite[4] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone5.png" );
	sprite[5] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone6.png" );


	parameters = [ [ [1, 1, 0.1], sprite[0], maxSize * Math.random() ],
				   [ [1, 1, 0.2], sprite[1], maxSize * Math.random() ],
				   [ [1, 1, 0.1], sprite[2], maxSize * Math.random() ],
				   [ [1, 1, 0.2], sprite[3], maxSize * Math.random() ],
				   [ [1, 1, 0.2], sprite[4], maxSize * Math.random() ],
				   [ [1, 1, 0.5], sprite[5], 2 * maxSize * Math.random() ],
				   ];

	for ( i = 0; i < parameters.length; i ++ ) {

		color  = parameters[i][0];
		//sprite = parameters[i][1];
		size   = parameters[i][2];

		geometries[i] = new THREE.Geometry();

		var dist = new Random();

		for ( j = 0; j < numParticles; j ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = distribution * dist.normal(0, 3) + centerPos.x;
			vertex.y = ( distribution * dist.normal(0, 0.5) + centerPos.y ) + vertex.x / 10;
			vertex.z = distribution * dist.normal(0, 2) + centerPos.z;


			geometries[i].vertices.push( vertex );

		}

		materials[i] = new THREE.PointCloudMaterial( {
															size: size,
															map: sprite[i],
															blending: THREE.NormalBlending,
															depthWrite: false,
															depthTest: true,
															transparent: true
														} );

		materials[i].color.setHex ( 0x888888 );

		var point_cloud = new THREE.PointCloud( geometries[i], materials[i] );

		particles.push(point_cloud);

	}

	return particles;

}

function createDustCloud ( centerPos, distribution, numParticles, maxSize ){

	var cloud, geometry, material, i, j, h, color, sprite, size, uniforms;

	var dist = new Random();

	uniforms = THREE.UniformsUtils.clone(cloudShader.uniforms);
	uniforms['texture'].value = THREE.ImageUtils.loadTexture("textures/asteroids/dust1.png");

	material = new THREE.ShaderMaterial( {

						uniforms: uniforms,
						vertexShader: cloudShader.vertexShader,
						fragmentShader: cloudShader.fragmentShader,
						depthWrite: false,
						depthTest: true,
						transparent: true

					} );


//new THREE.PlaneBufferGeometry( width, height, widthSegments, heightSegments )
//-=====================
//geometry = new THREE.BufferGeometry();

// // create a simple square shape. We duplicate the top left and bottom right
// // vertices because each vertex needs to appear once per triangle.
// var vertexPositions = [
// 	[-1.0, -1.0,  1.0],
// 	[ 1.0, -1.0,  1.0],
// 	[ 1.0,  1.0,  1.0],
//
// 	[ 1.0,  1.0,  1.0],
// 	[-1.0,  1.0,  1.0],
// 	[-1.0, -1.0,  1.0]
// ];
// var vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex
//
// // components of the position vector for each vertex are stored
// // contiguously in the buffer.
// for ( var i = 0; i < vertexPositions.length; i++ )
// {
// 	vertices[ i*3 + 0 ] = vertexPositions[i][0];
// 	vertices[ i*3 + 1 ] = vertexPositions[i][1];
// 	vertices[ i*3 + 2 ] = vertexPositions[i][2];
// }
//
// // itemSize = 3 because there are 3 values (components) per vertex
// geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
//
// //===================================
//var plane = new THREE.Mesh( geometry );

geometry = new THREE.Geometry();

	for ( var i = 0; i < 30; i++ ) {
		var plane = new THREE.Mesh( new THREE.PlaneGeometry( 6e5, 6e5 ) );
		var x = distribution * dist.normal(0, 3) + centerPos.x;
		var y = distribution * dist.normal(0, 0.5) + centerPos.y ;
		var z = distribution * dist.normal(0, 2) + centerPos.z;
		//plane.rotation.z = Math.random() * Math.PI;
		//plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

		var matrix = new THREE.Matrix4();

		matrix.makeTranslation( x, y, z );
		//matrix.makeRotationZ( Math.random() * PI );

		geometry.merge( plane.geometry, matrix );

	}

	mesh = new THREE.Mesh( geometry, material );

	return mesh;

}


function initAsteroids(){

	asteroidsCloud1 = new asteroidsCloud();
	asteroidsCloud1.numAsteroids = 150;
	asteroidsCloud1.centerPos = new THREE.Vector3( 0, 0, auToKM(1.8) * global.DistanceScale );
	asteroidsCloud1.asteroid_cloud = [];
	asteroidsCloud1.distribution = 30e6 * global.DistanceScale;

	asteroidsCloud1.initAsteroidsCloud();

	console.log("Init asteroids done");

}

function asteroidsUpdate(){

	asteroidsCloud1.update();

}
