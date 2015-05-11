/* -------------------------------------------------------------------------
//	Cube map shader
------------------------------------------------------------------------- */

var equirect_starfield = {

	uniforms: {
		"tEquirect": { type: "t", value: null },
		"tFlip": { type: "f", value: 1 },
		"resolution": { type: "v2", value: new THREE.Vector2() }
	},

	vertexShader: [

		"varying vec3 vWorldPosition;",
		'varying vec2 vUv;',

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

		"void main() {",

		"	vWorldPosition = transformDirection( position, modelMatrix );",

		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			THREE.ShaderChunk[ "logdepthbuf_vertex" ],

		"}"

	].join("\n"),

	fragmentShader: [
		'varying vec2 vUv;',
		"uniform sampler2D tEquirect;",
		"uniform float tFlip;",

		'uniform vec2 resolution;',

		"varying vec3 vWorldPosition;",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		"void main() {",

			// "	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
			"vec3 direction = normalize( vWorldPosition );",
			"vec2 sampleUV;",
			"sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );",
			"sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;",
			//"gl_FragColor = texture2D( tEquirect, sampleUV );",


			'vec4 v0 = texture2D( tEquirect, sampleUV );',
			'float aspect = resolution.x / resolution.y;',
    	'float dx = 0.5 / resolution.x;',
		  'float dy = dx * aspect;',

    	'vec4 v1 = texture2D( tEquirect, sampleUV + vec2( 0.0, dy ) );',
		  'vec4 v2 = texture2D( tEquirect, sampleUV + vec2( dx, 0.0 ) );',
		  'vec4 v3 = texture2D( tEquirect, sampleUV + vec2( 0.0, -dy ) );',
		  'vec4 v4 = texture2D( tEquirect, sampleUV + vec2( -dx, 0.0 ) );',
		  'vec4 v5 = texture2D( tEquirect, sampleUV + vec2( dx, dy ) );',
		  'vec4 v6 = texture2D( tEquirect, sampleUV + vec2( -dx, -dy ) );',
		  'vec4 v7 = texture2D( tEquirect, sampleUV + vec2( dx, -dy ) );',
		  'vec4 v8 = texture2D( tEquirect, sampleUV + vec2( -dx, dy ) );',

			'dx *= 2.0;',
			'dy *= 2.0;',
			'vec4 v11 = texture2D( tEquirect, sampleUV + vec2( 0.0, dy ) );',
		  'vec4 v12 = texture2D( tEquirect, sampleUV + vec2( dx, 0.0 ) );',
		  'vec4 v13 = texture2D( tEquirect, sampleUV + vec2( 0.0, -dy ) );',
		  'vec4 v14 = texture2D( tEquirect, sampleUV + vec2( -dx, 0.0 ) );',
		  'vec4 v15 = texture2D( tEquirect, sampleUV + vec2( dx, dy ) );',
		  'vec4 v16 = texture2D( tEquirect, sampleUV + vec2( -dx, -dy ) );',
		  'vec4 v17 = texture2D( tEquirect, sampleUV + vec2( dx, -dy ) );',
		  'vec4 v18 = texture2D( tEquirect, sampleUV + vec2( -dx, dy ) );',

			'v0 *= 0.5;',
			'v1 *= 0.15;',
			'v2 *= 0.15;',
			'v3 *= 0.15;',
			'v4 *= 0.15;',
			'v5 *= 0.1;',
			'v6 *= 0.1;',
			'v7 *= 0.1;',
			'v8 *= 0.1;',

			'v11 *= 0.25;',
			'v12 *= 0.25;',
			'v13 *= 0.25;',
			'v14 *= 0.25;',
			'v15 *= 0.1;',
			'v16 *= 0.1;',
			'v17 *= 0.1;',
			'v18 *= 0.1;',

    	'vec4 surround = v0 + v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8;',
			'vec4 blur = v11 + v12 + v13 + v14 ;',

			'float threshold = 0.25;',

			// 'if (v0.x < threshold) {',
			// 	'surround.x -= threshold * 0.8;',
			// 	'surround.y -= threshold * 0.8;',
			// 	'surround.z -= threshold * 0.8;',
			// '}',

			"gl_FragColor = surround + blur;",

			THREE.ShaderChunk[ "logdepthbuf_fragment" ],

		"}"

	].join("\n")

}



var cameraCubeFOV = 45;
var cameraCubeActive = false;
var simple_skybox_mesh,
		layered_skybox_mesh = [];
var rotation_matrix;


function initSkyBoxLayered( texture_src ){

  var _texture;
	var geometry = new THREE.SphereGeometry( 1.01e10, 60, 40 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationY( -PI/2 ) );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( - 55 * PI / 180 ) );


	// layer 0
	if ( texture_src == null || texture_src == undefined ){

		_texture = THREE.ImageUtils.loadTexture( 'textures/space/stars_layer_1.jpg' );
		_texture.minFilter = THREE.LinearFilter;

	}
	else{

		_texture = THREE.ImageUtils.loadTexture( texture_src );
		_texture.minFilter = THREE.LinearFilter;

	}

	var material = new THREE.MeshBasicMaterial( {
													map: _texture,
													//color: color,
								    			blending: THREE.AdditiveBlending,
								    			//depthWrite: false,
								          //depthTest: false,
								    			transparent: true
													} );

	layered_skybox_mesh[0] = new THREE.Mesh( geometry, material );
	scene.add( layered_skybox_mesh[0] );


	// layer 1
	_texture = THREE.ImageUtils.loadTexture( 'textures/space/stars_layer_2.jpg' );
	_texture.minFilter = THREE.LinearFilter;

	material = new THREE.MeshBasicMaterial( {
													map: _texture,
													//color: new THREE.Color( 0x848484 ),
								    			transparent: true
													} );

	layered_skybox_mesh[1] = new THREE.Mesh( geometry, material );
	scene.add( layered_skybox_mesh[1] );

	// layer 2
	//_texture = THREE.ImageUtils.loadTexture( 'textures/space/stars_layer_3.jpg' );
	//_texture.minFilter = THREE.LinearFilter;

	// material = new THREE.MeshBasicMaterial( {
	// 												map: _texture,
	// 												//color: new THREE.Color( 0x848484 ),
	// 							    			transparent: true
	// 												} );

	//layered_skybox_mesh[2] = new THREE.Mesh( geometry, material );
	//scene.add( layered_skybox_mesh[2] );


}


function initSkyBoxSimple( texture_src ){

  var _texture;
	var geometry = new THREE.SphereGeometry( 1e10, 60, 40 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

	if ( texture_src == null || texture_src == undefined ){

		//_texture = THREE.ImageUtils.loadTexture( 'textures/space/stars_skybox_4096.jpg' );
		_texture = THREE.ImageUtils.loadTexture( 'textures/space/stars_texture13.jpg' );
		_texture.minFilter = THREE.LinearFilter;

	}
	else{

		_texture = THREE.ImageUtils.loadTexture( texture_src );
		_texture.minFilter = THREE.LinearFilter;

	}

	var material = new THREE.MeshBasicMaterial( {
			//map: THREE.ImageUtils.loadTexture( 'textures/space/stars_skybox_4096.jpg' )
			map: _texture

	} );

	simple_skybox_mesh = new THREE.Mesh( geometry, material );
	scene.add( simple_skybox_mesh );

}

function initSkyBoxCube(){

	cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1e9 );
	sceneCube = new THREE.Scene();

    var path = "textures/cube/MilkyWay/";
  	var urls = [ path + "dark-s_px.jpg", path + "dark-s_nx.jpg",
                path + "dark-s_py.jpg", path + "dark-s_ny.jpg",
                path + "dark-s_pz.jpg", path + "dark-s_nz.jpg" ];

  	var textureCube = THREE.ImageUtils.loadTextureCube( urls );
  	textureCube.format = THREE.RGBFormat;
  	var skyboxShader = THREE.ShaderLib[ "cube" ];
  	skyboxShader.uniforms[ "tCube" ].value = textureCube;

  	var skyboxMaterial = new THREE.ShaderMaterial( {

  		fragmentShader: skyboxShader.fragmentShader,
  		vertexShader: skyboxShader.vertexShader,
  		uniforms: skyboxShader.uniforms,
  		depthWrite: false,
  		side: THREE.BackSide

  	} ),

  	mesh = new THREE.Mesh( new THREE.BoxGeometry( 1e5, 1e5, 1e5 ), skyboxMaterial );
  	sceneCube.add( mesh );

    var skyboxPass = new THREE.RenderPass( sceneCube, cameraCube );
    composer.addPass( skyboxPass );

}

function initSkyBoxEquirec(){

	cameraCubeActive = true;
  //var loader = new THREE.DDSLoader();
  //var textureEquirec = loader.load( 'textures/space/milkyway_eso0932argb.dds' );
  //var textureEquirec = loader.load( 'textures/space/milkyway_eso0932argb_8bDXT5.dds' );
  //textureEquirec.anisotropy = 4;

  cameraCube = new THREE.PerspectiveCamera( cameraCubeFOV, window.innerWidth / window.innerHeight, 1, 1e9 );
	//cameraCube.position.set (0,0, 0 );
	console.log(cameraCube.position);
  sceneCube = new THREE.Scene();

  // jpg texture
  var textureEquirec = THREE.ImageUtils.loadTexture( "textures/space/stars_skybox_8192.png" );

  textureEquirec.format = THREE.RGBFormat;
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  textureEquirec.magFilter = THREE.LinearFilter;
  textureEquirec.minFilter = THREE.LinearFilter;

  //var reflect_material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureEquirec } );

  //var equirectShader = THREE.ShaderLib[ "equirect" ];
	var equirectShader = equirect_starfield;
  equirectShader.uniforms[ "tEquirect" ].value = textureEquirec;
	equirectShader.uniforms[ "resolution" ].value = new THREE.Vector2( SCREEN_WIDTH, SCREEN_HEIGHT );

  var equirectMaterial = new THREE.ShaderMaterial( {
  	fragmentShader: equirectShader.fragmentShader,
  	vertexShader: equirectShader.vertexShader,
  	uniforms: equirectShader.uniforms,
    //blending: THREE.AdditiveBlending,
    //transparent: true,
    //color: 0x797979,
  	depthWrite: false,
  	side: THREE.BackSide
  } );

  mesh = new THREE.Mesh( new THREE.BoxGeometry( 1e10, 1e10, 1e10 ), equirectMaterial );
  //mesh.rotation.set( 0, 0, 2.3, "XYZ" );
  //mesh.rotation.z = 0.0;
  //mesh.position.applyAxisAngle( axis_z, -45 * Math.PI / 180 );
  sceneCube.add( mesh );

  var skyboxPass = new THREE.RenderPass( sceneCube, cameraCube );
  composer.addPass( skyboxPass );

}

// procedural skybox with custom point cloud

var sb_material, sb_geometry, sb_pointcloud;
var pSize = [];
var pOpacity = [];
var skyboxShader = {

  uniforms: {
    //'texture': { type: 't', value: null }
		//'size':  { type: "f", value: 1.0 },
		//'scale':  { type: "f", value: 1.0 },

    //'texture_color': { type: 't', value: null },
    //'noise_texture': { type: 't', value: null },
    //'time': { type: "f", value: 1.0 },
    //'resolution': { type: "v2", value: new THREE.Vector2() },

		//'fogColor' : { type: "c", value: null },
		//'fogNear' : { type: "f", value: 0 },
		//'fogFar' : { type: "f", value: 2e7 },
  },
  vertexShader: [

		//'attribute vec3 color;',
		//'attribute float pSize;',
		'attribute float pOpacity;',

		//'uniform float size;',
		//'uniform float scale;',

		//'varying vec3 vColor;',
		'varying float vOpacity;',

    'varying vec2 vUv;',
    'void main() {',

			//'vColor = color;',
			'vOpacity = pOpacity;',
			'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
			//'gl_PointSize = 2.0 * pSize * size * ( scale / length( mvPosition.xyz ) );',
			'gl_PointSize = 2000.0;',

      'gl_Position = projectionMatrix * mvPosition;',
      'vUv = uv;',
    '}'
  ].join('\n'),
  fragmentShader: [
    //'uniform sampler2D texture;',
		'uniform vec3 color;',
		//'varying vec3 vColor;',
		'varying float vOpacity;',

    //'uniform sampler2D texture_color;',
    //'uniform sampler2D noise_texture;',
    //'uniform float time;',
    //'uniform vec2 resolution;',

		//'uniform vec3 fogColor;',
		//'uniform float fogNear;',
		//'uniform float fogFar;',
    //'varying vec2 vUv;',

    'void main() {',

      'gl_FragColor = vec4( color, vOpacity );',

    '}'
  ].join('\n')
}

function initSkyBoxProcedural(){

	var dist = new Random();

	//sb_geometry = new THREE.BufferGeometry();

	var z_plane = 0;

	//for ( var i=0; i < 100; i++ ){
		// for (var j=0; j < 100; j++ ){
		//
		// 	var vertex = new THREE.Vector3();
		// 	vertex.x = SCREEN_WIDTH * dist.normal(0, 3) * 100;
		// 	vertex.y = SCREEN_HEIGHT * dist.normal(0, 2) * 100;
		// 	vertex.z = z_plane;
		//
		// 	sb_geometry.vertices.push( vertex );
		//
		// 	//sb_geometry.colors.push( new THREE.Color( dist.normal(128, 64), dist.normal(128, 64), dist.normal(128, 64) ) );
		// 	//sb_geometry.colors.push( new THREE.Color( 0xffffff ) );
		//
		// 	pSize.push( Math.random() );
		// 	pOpacity.push( Math.random() / 4 + 0.5 );
		//
		// }
	//	}
	var attributes =  {
		//'color': { type: 'c', value: new THREE.Color(0xffffff) },
		//pSize: { type: 'f', value: pSize },
		pOpacity: { type: 'f', value: pOpacity },

	};
	var uniforms = {

		color: { type: "c", value: new THREE.Color( 0x00ff00 ) },

	};

	// attributes.pSize.value = pSize;
	// attributes.pOpacity.value = pOpacity;

	sb_material = new THREE.ShaderMaterial({

		attributes: attributes,
    uniforms: uniforms,
    vertexShader: skyboxShader.vertexShader,
    fragmentShader: skyboxShader.fragmentShader,
		//vertexColors: THREE.VertexColors,
    //side: THREE.FrontSide,
    //blending: THREE.AdditiveBlending,
    transparent: true
    //depthWrite	: false

  });

	console.log(sb_material);

	//sb_pointcloud = new THREE.PointCloud( sb_geometry, sb_material );
	//attributes.pSize.needsUpdate = true;
	//attributes.pOpacity.needsUpdate = true;

	// point cloud geometry
	var geometry = new THREE.SphereGeometry( 100, 16, 8 );

	// point cloud
	cloud = new THREE.PointCloud( geometry, sb_material );

	for( var i = 0; i < cloud.geometry.vertices.length; i ++ ) {

			// set alpha randomly
			//attributes.pSize.value[ i ] = Math.random();
			attributes.pOpacity.value[ i ] = Math.random();
	}
	//attributes.pSize.needsUpdate = true;
	//attributes.pOpacity.needsUpdate = true;
	scene.add( cloud );
	//scene.add( sb_pointcloud );

}

function renderSkybox() {

	//cameraCube.lookAt( new THREE.Vector3( meshEarth.position.x, meshEarth.position.y + distance/10, meshEarth.position.z ) );
	if (cameraCubeActive){
	  cameraCube.rotation.copy( new THREE.Euler(camera.rotation.x,
	                                            camera.rotation.y + 1.5*PI,
	                                            camera.rotation.z + 0.35
	                                            )
	                          );

	  cameraCube.fov = cameraCubeFOV + (distance - initialCameraDistance)/3e8;

	  cameraCube.position.z = distance /120;
	  cameraCube.updateProjectionMatrix();
	}

	// layers crossfading
	// var transition_1 = smoothstep( 0, 35, distLY );  // 0 -> 1
	// layered_skybox_mesh[0].material.opacity = 1 - transition_1;  // 1 -> 0
	//
	// var transition_2 = smoothstep( 0, 35, distLY ) * ( 1 - smoothstep( 50, 87, distLY ) ); // 0 -> 1 and 1 -> 0
	// layered_skybox_mesh[1].material.opacity = transition_2;

	//ar transition_3 = smoothstep( 50, 87, distLY );  // 0 -> 1
	//layered_skybox_mesh[2].material.opacity = transition_3;


	var transition_1 = smoothstep( 0, 35, distLY );  // 0 -> 1
	transition_1 = scale( transition_1, 0, 1, 0.2, 1 );
	layered_skybox_mesh[0].material.opacity = transition_1 * ( 1 - smoothstep( 45, 70, distLY ) );

	var transition_2 = smoothstep( 45, 70, distLY ); // 0 -> 1
	layered_skybox_mesh[1].material.opacity = transition_2;


	//layers rotation
	for ( var i=0; i < layered_skybox_mesh.length; i++ ) {

		layered_skybox_mesh[i].material.needsUpdate = true;

		layered_skybox_mesh[i].matrix = ( new THREE.Matrix4().makeRotationZ( distance / lyToKM(0.001) ) );
		layered_skybox_mesh[i].rotation.setFromRotationMatrix( layered_skybox_mesh[i].matrix );

	}

}

function skyboxResize(){
	if (cameraCubeActive){
	  cameraCube.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	  cameraCube.updateProjectionMatrix();
	}

}
