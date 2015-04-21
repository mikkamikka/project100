
var asteroid;
//var asteroid_cloud = [];

var asteroidsCloud1, asteroidsCloud2, asteroidsCloud3;
var KuiperBelt;

//var asteroidDistanceScale = global.DistanceScale * LY /10;
var maxAsteroidRange = global.DistanceScale * 100e6;
var maxAsteroidRadius = 2000;

var fog = new THREE.Fog( 0x4584b4, - 100, 3000 );

// shader modified from clouds shader by mr.doob (http://mrdoob.com/lab/javascript/webgl/clouds/)
var cloudShader = {
      uniforms: {
        'texture': { type: 't', value: null },
				'fogColor' : { type: "c", value: fog.color },
				'fogNear' : { type: "f", value: 0 },
				'fogFar' : { type: "f", value: 2e7 },
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
					'alpha = smoothstep( 0.0, 0.5, alpha ) * ( 1.0 - smoothstep( 0.8, 1.0, alpha ));',

					'gl_FragColor.w = gl_FragColor.w * alpha;',
					'gl_FragColor = vec4( gl_FragColor.xyz, gl_FragColor.w );',
					'gl_FragColor = mix( vec4( fogColor, gl_FragColor.w ), gl_FragColor , fogFactor );',

        '}'
      ].join('\n')
}


function Asteroid(){
	this.mesh = null;
	this.distFromCamera =  0;
	this.isInCameraRange = false;
	this.rotationSpeed = new THREE.Vector3();
	this.isInView = false;

}

function asteroidsCloud(){
  this.numAsteroids = 0;
  this.centerPos = new THREE.Vector3();
  this.asteroid_cloud = [];
	this.distribution = 0;
	this.distribution3Droids = 0;
	this.pointClouds = [];
	this.isInView = false;
	this.distFromCamera = 0;
	this.dustCloud;
	this.pointCloudPatriclesAmount = 300;
	this.pointCloudMaxSize = 10000;
	this.dustCloudTexturesAmount = 100;
	this.dustCloudMaxSize = 5e5;

}

asteroidsCloud.prototype.initAsteroidsCloud = function() {

	var dist = new Random();

	for ( var i = 0; i <= this.numAsteroids; i ++ ) {															// added and removed dynamically

		var x = this.distribution3Droids * dist.normal(0, 0.5) + this.centerPos.x;
		var y = this.distribution3Droids * dist.normal(0, 0.3) + this.centerPos.y;
		var z = this.distribution3Droids * dist.normal(0, 1.0) + this.centerPos.z;

		var scale = Math.random();
		var variation = Math.round( 4 * Math.random() );
		var deform_scale = 0.2 + Math.random() * 1;

		var asteroid = new Asteroid();

		asteroid.mesh = createAsteroid ( x, y, z, scale, variation, deform_scale );

		asteroid.rotationSpeed.x = 0.02 * (0.5-Math.random());
		asteroid.rotationSpeed.y = 0.02 * (0.5-Math.random());
		asteroid.rotationSpeed.z = 0.02 * (0.5-Math.random());

		this.asteroid_cloud[i] = asteroid;

		//scene.add( this.asteroid_cloud[i].mesh );

	}


	this.pointClouds = createPointClouds (this.centerPos, this.distribution, this.pointCloudPatriclesAmount, this.pointCloudMaxSize); // added and removed dynamically
	this.dustCloud = createDustCloud (this.centerPos, this.distribution, this.dustCloudTexturesAmount, this.dustCloudMaxSize);
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

			if ( roid.isInView ){																								// change opacity on getting far

				//roid.mesh.material.uniforms.opacity.value = ( maxAsteroidRange - roid.distFromCamera ) / maxAsteroidRange;
				var depth = 1 - ( maxAsteroidRange - roid.distFromCamera ) / maxAsteroidRange;   // from 0 to 1
				roid.mesh.material.uniforms.opacity.value = 1 - smoothstep( 0.5, 1.0, depth );
				roid.mesh.material.needsUpdate = true;
			}

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

		for (var i=0; i < this.pointClouds.length; i++){

			this.pointClouds[i].material.opacity = ( maxAsteroidRange*5 - this.distFromCamera ) / maxAsteroidRange*5;
			this.pointClouds[i].material.needsUpdate = true;

		}

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

	uniforms[ "opacity" ].value = 1.0;

  var parameters = { 	fragmentShader: shader.fragmentShader,
											vertexShader: shader.vertexShader,
											uniforms: uniforms,
											//blending: THREE.AdditiveBlending,
											lights: true,
											fog: false,
											transparent: true
											};
  var materialDisplacement = new THREE.ShaderMaterial( parameters );

	//console.log(materialDisplacement);

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
	sprite[5] = THREE.ImageUtils.loadTexture( "textures/asteroids/_stone4.png" );


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
	uniforms['texture'].value = THREE.ImageUtils.loadTexture("textures/asteroids/dust2.png");

	material = new THREE.ShaderMaterial( {

						uniforms: uniforms,
						vertexShader: cloudShader.vertexShader,
						fragmentShader: cloudShader.fragmentShader,
						depthWrite: false,
						depthTest: true,
						transparent: true

					} );

	geometry = new THREE.Geometry();

	for ( var i = 0; i < numParticles; i++ ) {
		var plane = new THREE.Mesh( new THREE.PlaneGeometry( maxSize, maxSize ) );
		//var x = distribution * dist.normal(0, 3) + centerPos.x;
		//var y = distribution * dist.normal(0, 0.5) + centerPos.y ;
		//var z = distribution * dist.normal(0, 2) + centerPos.z;

		plane.position.x = distribution * dist.uniform(-3, 3) * dist.normal(0, 3) + centerPos.x;
		//plane.position.y = distribution * dist.normal(0, 0.5) + centerPos.y  + plane.position.x / 10;
		plane.position.y = distribution * dist.normal(0, 0.5) + centerPos.y  + plane.position.x / 10;
		plane.position.z = distribution * dist.normal(0, 3) + centerPos.z;

		plane.rotation.z = Math.random() * Math.PI;
		plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

		//matrix.makeTranslation( 100, 1000, 1000 );
		//plane.matrix.makeRotationZ( dist.normal(0, 3) );

		//plane.matrix.makeTranslation( plane.position.x, plane.position.y, plane.position.z );
		//matrix.makeRotationZ( dist.normal(0, 3) );

		plane.updateMatrix();

		geometry.merge( plane.geometry, plane.matrix );

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
	asteroidsCloud1.distribution3Droids = 20e6 * global.DistanceScale;
	asteroidsCloud1.pointCloudPatriclesAmount = 300;
	asteroidsCloud1.pointCloudMaxSize = 10000;
	asteroidsCloud1.dustCloudTexturesAmount = 100;
	asteroidsCloud1.dustCloudMaxSize = 5e5;
	asteroidsCloud1.initAsteroidsCloud();

	KuiperBelt = new asteroidsCloud();
	KuiperBelt.numAsteroids = 150;
	KuiperBelt.centerPos = new THREE.Vector3( 0, 0, auToKM(40) * global.DistanceScale );
	KuiperBelt.asteroid_cloud = [];
	KuiperBelt.distribution = 60e6 * global.DistanceScale;
	KuiperBelt.distribution3Droids = 20e6 * global.DistanceScale;
	KuiperBelt.pointCloudPatriclesAmount = 500;
	KuiperBelt.pointCloudMaxSize = 10000;
	KuiperBelt.dustCloudTexturesAmount = 200;
	KuiperBelt.dustCloudMaxSize = 5e5;
	KuiperBelt.initAsteroidsCloud();


	console.log("Init asteroids done");

}

function asteroidsUpdate(){

	asteroidsCloud1.update();
	KuiperBelt.update();

}
