
var asteroid;
var roid; // temporal storage for asteroid object
//var asteroid_cloud = [];

var asteroidsCloud1, asteroidsCloud2, asteroidsCloud3,
		dustCloud1, dustCloud2, dustCloud3;
var KuiperBelt;

//var asteroidDistanceScale = global.DistanceScale * LY /10;
var maxAsteroidRange = global.DistanceScale * 100e6;
var maxAsteroidRadius = 2000;

var cloudFog = new THREE.Fog( 0x4584b4, - 100, 3000 );

// shader modified from clouds shader by mr.doob (http://mrdoob.com/lab/javascript/webgl/clouds/)
var cloudShader = {
			uniforms: {
				'texture': { type: 't', value: null },
				'fogColor' : { type: "c", value: cloudFog.color },
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
	this.distFromCamera =	0;
	this.isInCameraRange = false;
	this.rotationSpeed = new THREE.Vector3();
	this.isInView = false;

}

function asteroidsCloud(type){
	this.numAsteroids = 0;
	this.centerPos = new THREE.Vector3();
	this.asteroid_cloud = [];
	this.distribution = 0;
	this.distribution3Droids = 0;
	this.pointClouds = [];
	this.isInView = false;
	this.distFromCamera = 0;
	this.dustCloud;
	this.pointCloudPatriclesAmount = 0;
	this.pointCloudMaxSize = 0;
	this.dustCloudTexturesAmount = 100;
	this.dustCloudMaxSize = 5e5;
	this.type = type;

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
		this.asteroid_cloud[i].mesh.visible = false;

		scene.add( this.asteroid_cloud[i].mesh );	 // !!

	}


	this.pointClouds = createPointClouds (this.centerPos, this.distribution, this.pointCloudPatriclesAmount, this.pointCloudMaxSize); // added and removed dynamically
	this.dustCloud = createDustCloud (this.centerPos, this.distribution, this.dustCloudTexturesAmount, this.dustCloudMaxSize, this.type);
	scene.add( this.dustCloud );

}


asteroidsCloud.prototype.update = function() {


	this.distFromCamera = camera.position.distanceTo( this.centerPos );			// cloud's center approximation to camera

	for ( var i = 0; i < this.asteroid_cloud.length ; i++ ) {

		//roid = this.asteroid_cloud[i];

	 	if (this.asteroid_cloud[i] !== undefined ){

			// add and remove asteroid
			this.asteroid_cloud[i].distFromCamera = camera.position.distanceTo( this.asteroid_cloud[i].mesh.position );
			var deltaZ = this.asteroid_cloud[i].mesh.position.z - camera.position.z;

			if ( this.asteroid_cloud[i].isInView ){																								// change opacity on getting far

				////roid.mesh.material.uniforms.opacity.value = ( maxAsteroidRange - roid.distFromCamera ) / maxAsteroidRange;
				//var depth = 1 - ( maxAsteroidRange - this.asteroid_cloud[i].distFromCamera ) / maxAsteroidRange;	 // from 0 to 1
				//this.asteroid_cloud[i].mesh.material.uniforms.opacity.value = 1 - smoothstep( maxAsteroidRange/2, maxAsteroidRange, this.asteroid_cloud[i].distFromCamera );
				//this.asteroid_cloud[i].mesh.material.needsUpdate = true;

				this.asteroid_cloud[i].mesh.rotation.x += this.asteroid_cloud[i].rotationSpeed.x;
				this.asteroid_cloud[i].mesh.rotation.y += this.asteroid_cloud[i].rotationSpeed.y;
				this.asteroid_cloud[i].mesh.rotation.z += this.asteroid_cloud[i].rotationSpeed.z;

			}

			if ( this.asteroid_cloud[i].distFromCamera < maxAsteroidRange ){	// is within approximation range
				if ( !this.asteroid_cloud[i].isInView && deltaZ < 1000 ) {

					//scene.add( roid.mesh );
					this.asteroid_cloud[i].mesh.visible = true;
					this.asteroid_cloud[i].isInView = true;
					if (debug) console.log("Asteroid added");
				}
			}
			else {
				if ( this.asteroid_cloud[i].isInView ) {

					//scene.remove( roid.mesh );
					this.asteroid_cloud[i].mesh.visible = false;
					this.asteroid_cloud[i].isInView = false;
					if (debug) console.log("Asteroid removed");
				}
			}

		}

	}

	// add and remove point clouds
	if ( this.distFromCamera < maxAsteroidRange * 5 ){	// is within approximation range

		if ( !this.isInView ){
			for (var i=0; i < this.pointClouds.length; i++){
				scene.add( this.pointClouds[i] );
			}

			this.isInView = true;
			if (debug) console.log("point cloud added " + i);
		}
		else{

			for (var i=0; i < this.pointClouds.length; i++){

				var opacity = 1 - smoothstep( maxAsteroidRange*4, maxAsteroidRange*5, this.distFromCamera );
				//this.pointClouds[i].material.opacity = ( maxAsteroidRange*5 - this.distFromCamera ) / maxAsteroidRange*5;
				this.pointClouds[i].material.opacity = opacity;
				this.pointClouds[i].material.needsUpdate = true;

			}

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

	// add and remove dust clouds
	if ( this.distFromCamera < maxAsteroidRange * 20 ){	// is within approximation range

		if ( !this.dustCloud.visible ){

			this.dustCloud.visible = true;
			//scene.add( this.dustCloud );

			if (debug) console.log("dust cloud added ");
		}

	}
	else{
		if ( this.dustCloud.visible ){

			this.dustCloud.visible = false;
			//scene.remove( this.dustCloud );

			if (debug) console.log("dust cloud removed ");
		}

	}

}

function createAsteroid ( x, y, z , scale, variation, deform_scale ){

	var radius = maxAsteroidRadius * scale;
	var details = Math.round( scale * 3 );

	//var geometryAsteroid = new THREE.SphereGeometry( radius, 10, 5 );
	var geometryAsteroid = new THREE.IcosahedronGeometry( radius, details );
	geometryAsteroid.computeTangents();

	//console.log(details);

	// var materialAsteroid = new THREE.MeshPhongMaterial( {
	//		map: textureAsteroid,
	//		bumpMap: bumpmapAsteroid,
	//		bumpScale: 20,
	//		color: 0xffffff,
	//		shininess: 10
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

	sprite[0] = THREE.ImageUtils.loadTexture( "textures/asteroids/stone1.png" );
	sprite[1] = THREE.ImageUtils.loadTexture( "textures/asteroids/stone2.png" );
	sprite[2] = THREE.ImageUtils.loadTexture( "textures/asteroids/stone3.png" );
	sprite[3] = THREE.ImageUtils.loadTexture( "textures/asteroids/stone4.png" );
	sprite[4] = THREE.ImageUtils.loadTexture( "textures/asteroids/stone5.png" );
	//	sprite[5] = THREE.ImageUtils.loadTexture( "textures/asteroids/stone4.png" );


	parameters = [ [ [1, 1, 0.1], sprite[0], maxSize * Math.random() ],
					 [ [1, 1, 0.2], sprite[1], maxSize * Math.random() ],
					 [ [1, 1, 0.1], sprite[2], maxSize * Math.random() ],
					 [ [1, 1, 0.2], sprite[3], maxSize * Math.random() ],
					 [ [1, 1, 0.2], sprite[4], maxSize * Math.random() ]
					 //					 [ [1, 1, 0.5], sprite[5], 2 * maxSize * Math.random() ],
					 ];

	var dist = new Random();

	for ( i = 0; i < parameters.length; i ++ ) {

		color	= parameters[i][0];
		sprite = parameters[i][1];
		size	 = parameters[i][2];

		geometries[i] = new THREE.Geometry();



		for ( j = 0; j < numParticles; j ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = distribution * dist.normal(0, 3) + centerPos.x;
			vertex.y = ( distribution * dist.normal(0, 0.6) + centerPos.y ) + vertex.x / 10;
			vertex.z = distribution * dist.normal(0, 2) + centerPos.z;

			geometries[i].vertices.push( vertex );
		}


		materials[i] = new THREE.PointCloudMaterial( {
															size: size,
															map: sprite,
															//blending: THREE.CustomBlending,
															//blending: THREE.AdditiveAlphaBlending,
															//depthWrite: false,
															//depthTest: false,
															//alphaTest : 0.8,
															transparent: true
														} );

														//materials[i] = new THREE.MeshBasicMaterial( { map: sprite[i] } );
														//material.transparent = true;

		//materials[i].blendSrc = THREE.SrcAlphaFactor;
		//materials[i].blendDst = THREE.SrcColorFactor;
		//materials[i].blendEquation = THREE.AddEquation;

		materials[i].color.setHex ( 0x444444 );

		var point_cloud = new THREE.PointCloud( geometries[i], materials[i] );
		//point_cloud.sortPoints = true;

		particles.push(point_cloud);

	}

	return particles;

}

function createDustCloud ( centerPos, distribution, numParticles, maxSize, type ){

	var cloud, geometry, material, i, j, h, color, sprite, size, uniforms, texture;

	var dist = new Random();

	if ( type == undefined ){
		type = 1;
	}

	uniforms = THREE.UniformsUtils.clone(cloudShader.uniforms);

	switch (type) {
		case 1:
			texture = THREE.ImageUtils.loadTexture("textures/asteroids/dust1.png")
			break
		case 2:
			texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud01.png");
			uniforms['fogFar'].value = 2e8;
			break
		case 3:
			texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud04.png");
			uniforms['fogFar'].value = 2e8;
			break
	}

	uniforms['texture'].value = texture;

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
		//plane.position.y = distribution * dist.normal(0, 0.5) + centerPos.y	+ plane.position.x / 10;
		plane.position.y = distribution * dist.normal(0, 0.5) + centerPos.y	+ plane.position.x / 10;
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
	asteroidsCloud1.numAsteroids = 100;
	asteroidsCloud1.centerPos = new THREE.Vector3( 0, 0, auToKM(1.8) * global.DistanceScale );
	asteroidsCloud1.asteroid_cloud = [];
	asteroidsCloud1.distribution = 30e6 * global.DistanceScale;
	asteroidsCloud1.distribution3Droids = 20e6 * global.DistanceScale;
	asteroidsCloud1.pointCloudPatriclesAmount = 300;
	asteroidsCloud1.pointCloudMaxSize = 5000;
	asteroidsCloud1.dustCloudTexturesAmount = 100;
	asteroidsCloud1.dustCloudMaxSize = 5e5;
	asteroidsCloud1.initAsteroidsCloud();

	KuiperBelt = new asteroidsCloud();
	KuiperBelt.numAsteroids = 100;
	KuiperBelt.centerPos = new THREE.Vector3( 0, 0, auToKM(40) * global.DistanceScale );
	KuiperBelt.asteroid_cloud = [];
	KuiperBelt.distribution = 60e6 * global.DistanceScale;
	KuiperBelt.distribution3Droids = 20e6 * global.DistanceScale;
	KuiperBelt.pointCloudPatriclesAmount = 500;
	KuiperBelt.pointCloudMaxSize = 5000;
	KuiperBelt.dustCloudTexturesAmount = 200;
	KuiperBelt.dustCloudMaxSize = 5e5;
	KuiperBelt.initAsteroidsCloud();

	// dustCloud1 = new asteroidsCloud(2);
	// dustCloud1.centerPos = new THREE.Vector3( 0, 0, lyToKM(0.009) * global.DistanceScale );
	// dustCloud1.distribution = 660e6 * global.DistanceScale;
	// dustCloud1.dustCloudTexturesAmount = 10;
	// dustCloud1.dustCloudMaxSize = 160e6;
	// dustCloud1.initAsteroidsCloud();
	//
	// dustCloud2 = new asteroidsCloud(3);
	// dustCloud2.centerPos = new THREE.Vector3( 0, 0, lyToKM(0.009 ) * global.DistanceScale );
	// dustCloud2.distribution = 360e6 * global.DistanceScale;
	// dustCloud2.dustCloudTexturesAmount = 10;
	// dustCloud2.dustCloudMaxSize = 80e6;
	// dustCloud2.initAsteroidsCloud();


	console.log("Init asteroids done");

}

function asteroidsUpdate(){

	asteroidsCloud1.update();
	KuiperBelt.update();

}
