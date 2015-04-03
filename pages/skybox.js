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

  //var loader = new THREE.DDSLoader();
  //var textureEquirec = loader.load( 'textures/space/milkyway_eso0932argb.dds' );
  //var textureEquirec = loader.load( 'textures/space/milkyway_eso0932argb_8bDXT5.dds' );
  //textureEquirec.anisotropy = 4;

  cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1e12 );
  sceneCube = new THREE.Scene();

  // jpg texture
  var textureEquirec = THREE.ImageUtils.loadTexture( "textures/space/milkyway_eso0932a.jpg" );

  //textureEquirec.format = THREE.RGBAFormat;
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  //textureEquirec.magFilter = THREE.LinearFilter;
  //textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

  //var reflect_material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureEquirec } );

  var equirectShader = THREE.ShaderLib[ "equirect" ];
  equirectShader.uniforms[ "tEquirect" ].value = textureEquirec;

  var equirectMaterial = new THREE.ShaderMaterial( {
  	fragmentShader: equirectShader.fragmentShader,
  	vertexShader: equirectShader.vertexShader,
  	uniforms: equirectShader.uniforms,
    blending: THREE.AdditiveBlending,
    transparent: true,
    //color: 0x797979,
  	//depthWrite: false,
  	side: THREE.BackSide
  } );

  mesh = new THREE.Mesh( new THREE.BoxGeometry( 1e12, 1e12, 1e12 ), equirectMaterial );
  mesh.rotation.set( 0, 0, 2.3, "XYZ" );
  //mesh.rotation.z = 0.0;
  //mesh.position.applyAxisAngle( axis_z, -45 * Math.PI / 180 );
  sceneCube.add( mesh );

  var skyboxPass = new THREE.RenderPass( sceneCube, cameraCube );
  composer.addPass( skyboxPass );


}

function renderSkybox() {

	//cameraCube.lookAt( meshEarth.position );

  cameraCube.rotation.copy( new THREE.Euler(camera.rotation.x, camera.rotation.y + 1.5*PI, camera.rotation.z + 0.35 ));
  //cameraCube.position.z += distance /1200;


}

function skyboxResize(){

  cameraCube.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  cameraCube.updateProjectionMatrix();

}
