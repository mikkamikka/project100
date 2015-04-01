// Sun
var Sun  = {name:"Sun", radius:6.96e3 , rotationSpeed:0.02, distanceFromSun:0};


// shader from https://github.com/dataarts/webgl-globe/blob/master/globe/globe.js
var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },

    'atmosphere' : {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        "varying vec3 vViewPosition;",
        'varying vec2 vUv;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        "varying vec3 vViewPosition;",
        'varying vec2 vUv;',
        'void main() {',

          "vec3 normal = normalize( -vNormal );",
          "vec3 viewPosition = normalize( vViewPosition );",

          'vec3 diffuse = texture2D( texture, vUv ).xyz;',

          'float outer_intensity = pow(abs( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ) ), 12.0 );',

          'vec3 outer_fog = vec3( 0.8, 0.8, 1.0 ) * outer_intensity;',

          'float inner_intensity = abs(1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( inner_intensity, 3.0 );',

          //Fade out atmosphere at edge
          "float viewDot = abs(dot( vNormal, vec3(viewPosition.xy, 1.0) ));",
          "viewDot = clamp( pow( viewDot + 0.9, 10.0 ), 0.0, 1.0);",

          //'gl_FragColor = vec4( diffuse , 1.0 );',
          'gl_FragColor = vec4( outer_fog , viewDot );',

        '}'
      ].join('\n')
    }
};

// shader from three.js examples///: webgl_shaders_tonemapping
var atmoShader = {
					side: THREE.BackSide,
					// blending: THREE.AdditiveBlending,
					transparent: true,
					lights: true,
					uniforms: THREE.UniformsUtils.merge( [

						THREE.UniformsLib[ "common" ],
						THREE.UniformsLib[ "lights" ],
					] ),
					vertexShader: [
						"varying vec3 vViewPosition;",
						"varying vec3 vNormal;",
						THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
						"void main() {",
					 		THREE.ShaderChunk[ "defaultnormal_vertex" ],

							"	vNormal = normalize( transformedNormal );",
							"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
							"vViewPosition = -mvPosition.xyz;",
							"gl_Position = projectionMatrix * mvPosition;",
						"}"

					].join("\n"),

					fragmentShader: [

						THREE.ShaderChunk[ "lights_phong_pars_fragment" ],

						"void main() {",
							"vec3 normal = normalize( -vNormal );",
							"vec3 viewPosition = normalize( vViewPosition );",
							"#if MAX_DIR_LIGHTS > 0",

								"vec3 dirDiffuse = vec3( 0.0 );",

								"for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",

									"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
									"vec3 dirVector = normalize( lDirection.xyz );",
									"float dotProduct = dot( viewPosition, dirVector );",
									"dotProduct = 1.0 * max( dotProduct, 0.0 ) + (1.0 - max( -dot( normal, dirVector ), 0.0 ));",
									"dotProduct *= dotProduct;",
									"dirDiffuse += max( 0.5 * dotProduct, 0.0 ) * directionalLightColor[ i ];",
								"}",
							"#endif",

							//Fade out atmosphere at edge
							"float viewDot = abs(dot( normal, viewPosition ));",
							"viewDot = clamp( pow( viewDot + 0.6, 10.0 ), 0.0, 1.0);",

							"vec3 colour = vec3( 0.05, 0.09, 0.13 ) * dirDiffuse;",
							"gl_FragColor = vec4( colour, viewDot );",

						"}"

					].join("\n"),
				};



// Planets
var planets = [
	{name:"mercury", radius:2435, rotationSpeed:0.02, tilt:0.0, distanceFromSun:58e6,
		distanceFromSunAU:0.387, period:88},
	{name:"venus", radius:6050, rotationSpeed:0.004, tilt:0.0, distanceFromSun:108e6,
		distanceFromSunAU:0.723, period:224.7},
	{name:"earth", radius:6371, rotationSpeed:0.02, tilt:0.41, distanceFromSun:149.5e6,
		distanceFromSunAU:1.0, period:365},
	{name:"mars", radius:3335, rotationSpeed:0.02, tilt:0.0, distanceFromSun:228e6,
		distanceFromSunAU:1.524, period:687},
	{name:"jupiter", radius:71880, rotationSpeed:0.05, tilt:0.2, distanceFromSun:778e6,
		distanceFromSunAU:5.203, period:4380},
	{name:"saturn", radius:60210, rotationSpeed:0.05, tilt:0.5, distanceFromSun:1427e6,
		distanceFromSunAU:9.54, period:10753},
	{name:"uranus", radius:25650, rotationSpeed:0.03, tilt:0.41, distanceFromSun:2.86e9,
		distanceFromSunAU:19.2, period:30660},
	{name:"neptune", radius:24750, rotationSpeed:0.02, tilt:0.41, distanceFromSun:4.5e9,
		distanceFromSunAU:30.0, period:60225},
	{name:"pluto", radius:1000, rotationSpeed:0.02, tilt:0.41, distanceFromSun:6e9,
		distanceFromSunAU:42.0, period:80000},
];

//Settings
var drawOrbitCircles = true;
var drawSkyBox = true;
var drawLensFlare = true;

var radius = planets[2].radius;
var tilt = 0.41;
var rotationSpeed = 0.02;

var cloudsScale = 1.005;
var moonScale = 0.23;

var sunMesh;
var geometryEarth, meshEarth, meshClouds, meshLights, meshMoon, atmosphere;
var sunPos, earthPos;

var dirLight, pointLight, ambientLight;
var d, dPlanet, dMoon, dMoonVec = new THREE.Vector3();

var cameraCube, sceneCube;

var earthPos = new THREE.Vector3(); // center of coords

var axis_x = new THREE.Vector3( 1, 0, 0 );
var axis_y = new THREE.Vector3( 0, 1, 0 );
var axis_z = new THREE.Vector3( 0, 0, 1 );

function initSolarSystem() {

  var shader, uniforms, material;

  //if (drawSkyBox) initSkyBox();

  initSkyBoxEquirec();

	//Sun
	sunPos = earthPos.clone().add(new THREE.Vector3(0, 0, - planets[2].distanceFromSun * globalDistanceScale));
	var sunGeometry = new THREE.SphereGeometry( Sun.radius, 100, 50 );
  var sunMaterial = new THREE.MeshPhongMaterial( {
		map: THREE.ImageUtils.loadTexture( "textures/planets/sun.jpg" ),
		//specular: "rgb(255,255,255)",
        //color: "rgb(255,255,255)",
        emissive: "rgb(100,100,100)"
		//shininess: 30
	} );
	sunMesh = new THREE.Mesh( sunGeometry, sunMaterial );
	sunMesh.position.set(sunPos.x, sunPos.y, sunPos.z);
	//scene.add( sunMesh );








	//Earth
///////////////////////////////////////////////////////////////



var earthMat = new THREE.MeshPhongMaterial( {
                                            	color: 0xffffff,
                                            	shininess: 1
                                            } );

var earthDiffuse = THREE.ImageUtils.loadTexture( 'textures/planets/earth_atmos_2048.jpg',
                                                  undefined,
                                                  function( tex ) {
                                                  	earthMat.map = tex;
                                                  	earthMat.needsUpdate = true;
                                                  } );
var earthSpecular = THREE.ImageUtils.loadTexture( 'textures/planets/earth_specular_2048.jpg',
                                                    undefined,
                                                    function( tex ) {
                                                    	earthMat.specularMap = tex;
                                                    	earthMat.needsUpdate = true;
                                                    } );

 var earthNormal = THREE.ImageUtils.loadTexture( 'textures/planets/earth_normal_2048.jpg',
                                                 undefined,
                                                 function( tex ) {
                                                 	//earthMat.normalMap = tex;
                                                 	//earthMat.needsUpdate = true;
                                                 } );

var earthLightsMat = new THREE.MeshBasicMaterial( {
                                                  	color: 0xffffff,
                                                  	blending: THREE.AdditiveBlending,
                                                  	transparent: true,
                                                  	depthTest: false
                                                  } );

var earthLights = THREE.ImageUtils.loadTexture( 'textures/planets/earth_lights_2048.png',
                                                undefined,
                                                function( tex ) {
                                                	earthLightsMat.map = tex;
                                                	earthLightsMat.needsUpdate = true;
                                                } );

var earthCloudsMat = new THREE.MeshLambertMaterial( {
                                                    	color: 0xffffff,
                                                    	blending: THREE.NormalBlending,
                                                    	transparent: true,
                                                    	depthTest: false
                                                    } );

var earthClouds = THREE.ImageUtils.loadTexture( 'textures/planets/earth_clouds_2048.png',
                                                undefined,
                                                function( tex ) {
                                                	earthCloudsMat.map = tex;
                                                	earthCloudsMat.needsUpdate = true;
                                                } );


        var earthGeo = new THREE.SphereGeometry( planets[2].radius, 100, 50 );
				var sphereMesh = new THREE.Mesh( earthGeo, earthMat );
				//scene.add( sphereMesh );

				var sphereLightsMesh = new THREE.Mesh( earthGeo, earthLightsMat );
				//scene.add( sphereLightsMesh );

				var sphereCloudsMesh = new THREE.Mesh( earthGeo, earthCloudsMat );
				//scene.add( sphereCloudsMesh );

				var sphereAtmoMesh = new THREE.Mesh( earthGeo, earthAtmoMat );
				sphereAtmoMesh.scale.set( 1.05, 1.05, 1.05 );

         var earthAtmoMat = new THREE.ShaderMaterial( atmoShader );
        // // var earthMat = new THREE.MeshPhongMaterial( {
        // //   color: 0xffffff,
        // //   shininess: 2000
        // // } );
         var geometryAtmo = new THREE.SphereGeometry( planets[2].radius*1.05, 100, 50 );
         var sphereAtmoMesh = new THREE.Mesh( geometryAtmo, earthAtmoMat );
         sphereAtmoMesh.scale.set( 1.105, 1.105, 1.105 );

         //scene.add( sphereAtmoMesh );




//////////////////////////////////////////////////////////////
	var materialNormalMap = new THREE.MeshPhongMaterial( {
		specular: 0x555555,
		shininess: 20,
		map: THREE.ImageUtils.loadTexture( "textures/planets/earth_color_4096.jpg" ),
		specularMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_specular_2048.jpg" ),
		normalMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_normal_2048.jpg" ),
		normalScale: new THREE.Vector2( 0.5, 0.5 ),
    blending: THREE.AdditiveBlending,
    transparent: false
	} );

	geometryEarth = new THREE.SphereGeometry( planets[2].radius, 100, 50 );
	geometryEarth.computeTangents();

	meshEarth = new THREE.Mesh( geometryEarth, materialNormalMap );
	//meshEarth.position.set( 0, planets[2].distanceFromSun * globalDistanceScale, 0 );
	meshEarth.rotation.y = 0;
	meshEarth.rotation.z = tilt;
	scene.add( meshEarth );

////////////////////////////////////////////////////////////////////////////////




  // atmosphere fog

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture("textures/planets/earth_clouds_2048.png");

    material = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true

    });

     var geometryAtmo = new THREE.SphereGeometry( planets[2].radius*1.04, 100, 50 );
     var sphereAtmoMesh = new THREE.Mesh( geometryAtmo, material );
     //sphereAtmoMesh.scale.set( 1.0, 1.0, 1.0 );
     scene.add( sphereAtmoMesh );


     // night lights
     var materialLights = new THREE.MeshBasicMaterial( {
         map: THREE.ImageUtils.loadTexture( 'textures/planets/earth_lights_4096.jpg' ),
         color: 'rgba(146, 85, 5, 0.1)',
         blending: THREE.AdditiveBlending,
         transparent: true,
         depthTest: false
     } );
     meshLights = new THREE.Mesh( geometryEarth, materialLights );
     meshLights.rotation.z = tilt;
     scene.add( meshLights );


     // clouds
   	geometryClouds = new THREE.SphereGeometry( planets[2].radius*1.02, 100, 50 );
   	var materialClouds = new THREE.MeshPhongMaterial( {
        map: THREE.ImageUtils.loadTexture( "textures/planets/earth_clouds_2048.png" ),
        bumpMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_clouds_bump2_2048.png" ),
        bumpScale: 10,
        color: 0xffffff,
        //blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false
   	} );

   	meshClouds = new THREE.Mesh( geometryClouds, materialClouds );
   	meshClouds.scale.set( cloudsScale, cloudsScale, cloudsScale );
   	//meshClouds.position.set( meshEarth.position );
   	meshClouds.rotation.z = tilt;
   	scene.add( meshClouds );






	// moon
	var materialMoon = new THREE.MeshPhongMaterial( {
		map: THREE.ImageUtils.loadTexture( "textures/planets/moon_1024.jpg" )
	} );

	meshMoon = new THREE.Mesh( geometryEarth, materialMoon );
	meshMoon.position.set( 384400 * globalDistanceScale *10, 0 , 0 );
	//meshMoon.position.applyAxisAngle( axis_y, -90 * Math.PI / 180 );
	meshMoon.scale.set( moonScale, moonScale, moonScale );
	scene.add( meshMoon );

	initPlanets();

	//camera.position.z = meshEarth.position.z + planets[2].radius*10;
	//camera.position.z = planets[2].radius * 10;
  //camera.position.x = planets[2].radius * 10;
	//camera.lookAt( sunMesh.position );
	//camera.lookAt( meshEarth.position );

	SetLight();

  if (drawLensFlare) initLensFlare();



	console.log("Init solar system done");

};

function SetLight(){

	dirLight = new THREE.DirectionalLight( 0xffffff , 0.5, 0);
	dirLight.position.set( sunPos.x, sunPos.y, sunPos.z );
	scene.add( dirLight );

	var pLight = new THREE.PointLight( 0xffffff , 1.1, 0);
	pLight.position.set( sunPos.x, sunPos.y, sunPos.z );
	scene.add( pLight );

	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 5000, 0 );
//	scene.add( hemiLight );

  scene.add( new THREE.AmbientLight( 0x101010 ) );

}

function initLensFlare(){

        // lens flares

				var textureFlare_star1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare0_m1.png" ); // star

				var textureFlare_line1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare2.png" );  // line
        var textureFlare_line2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_blue_line_hor.png" );
        var textureFlare_line3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_yellow_line_hor.png" );

				var textureFlare_ring1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare3.png" );  // ring
        var textureFlare_ring2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare4.png" );  // ring
        var textureFlare_ring3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare5.png" );  // ring
        var textureFlare_ring4 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare6.png" );  // ring

        var pos = sunPos.clone();

				addLight( 0.55, 0.9, 0.5, pos.x, pos.y, pos.z + 60000  );
				//addLight( 0.08, 0.8, 0.5,    pos.x, pos.y, pos.z + 60000);
				//addLight( 0.995, 0.5, 0.9, pos.x, pos.y, pos.z + 60000 );

				function addLight( h, s, l, x, y, z ) {

					//var light = new THREE.PointLight( 0xffffff, 1.0, 4500 );
					//light.color.setHSL( h, s, l );
					//light.position.set( x, y, z );
					//scene.add( light );

					var flareColor = new THREE.Color( 0xffffff );
					flareColor.setHSL( h, s, l + 0.5 );


          // LensFlare(texture, size, distance, blending, color)
					var lensFlare = new THREE.LensFlare( textureFlare_star1, 1024, 0.0, THREE.AdditiveBlending, flareColor );
					//lensFlare.add( textureFlare_line1, 512, 0.0, THREE.AdditiveBlending );
          lensFlare.add( textureFlare_line2, 1024, 0.0, THREE.AdditiveBlending );
          lensFlare.lensFlares[ 1 ].rotation = THREE.Math.degToRad( 0 );
          lensFlare.add( textureFlare_line3, 1024, 0.0, THREE.AdditiveBlending );
          lensFlare.lensFlares[ 2 ].rotation = THREE.Math.degToRad( 90 );

					lensFlare.add( textureFlare_ring1, 60, 0.6, THREE.AdditiveBlending );
					lensFlare.add( textureFlare_ring2, 40, 0.7, THREE.AdditiveBlending );
					lensFlare.add( textureFlare_ring3, 120, 0.9, THREE.AdditiveBlending );
					lensFlare.add( textureFlare_ring4, 70, 1.0, THREE.AdditiveBlending );

					lensFlare.customUpdateCallback = lensFlareUpdateCallback;
					//lensFlare.position.copy( light.position );
          lensFlare.position.set( x, y, z );

					scene.add( lensFlare );

				}

        function addSpot( h, s, l, x, y, z ) {

          // LensFlare(texture, size, distance, blending, color)
          var lensFlare = new THREE.LensFlare( textureFlare_star1, 1024, 0.0, THREE.AdditiveBlending, flareColor );
          lensFlare.add( textureFlare_line1, 512, 0.0, THREE.AdditiveBlending );
          lensFlare.add( textureFlare_line2, 512, 0.0, THREE.AdditiveBlending );
          lensFlare.add( textureFlare_line3, 512, 0.0, THREE.AdditiveBlending );

          lensFlare.add( textureFlare_ring1, 60, 0.6, THREE.AdditiveBlending );
          lensFlare.add( textureFlare_ring2, 40, 0.7, THREE.AdditiveBlending );
          lensFlare.add( textureFlare_ring3, 120, 0.9, THREE.AdditiveBlending );
          lensFlare.add( textureFlare_ring4, 70, 1.0, THREE.AdditiveBlending );

          lensFlare.customUpdateCallback = lensFlareUpdateCallback;
          lensFlare.position.copy( light.position );

          scene.add( lensFlare );

        }
}
function lensFlareUpdateCallback( object ) {

				var f, fl = object.lensFlares.length;
				var flare;
				var vecX = -object.positionScreen.x * 2;
				var vecY = -object.positionScreen.y * 2;

        var camDistance = camera.position.length();


				for( f = 0; f < fl; f++ ) {

					   flare = object.lensFlares[ f ];

					   flare.x = object.positionScreen.x + vecX * flare.distance;
					   flare.y = object.positionScreen.y + vecY * flare.distance;

					   //flare.rotation = 0;

             //flare.wantedRotation = flare.x * Math.PI * 0.25;
             //flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

             //flare.scale = 1 / camDistance * 65000;

				}

				//object.lensFlares[ 2 ].y += 0.025;
				//object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

			}



function initPlanets(){

	for ( var i = 0; i < planets.length ; i ++ ) {

		var planet = planets[i];

		if (i != 2){		// skip Earth

			var material = new THREE.MeshPhongMaterial( {
				//specular: 0x555555,
				//shininess: 30,
				map: THREE.ImageUtils.loadTexture( "textures/planets/" + planet.name + ".jpg" )
				//specularMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_specular_2048.jpg" ),
				//normalMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_normal_2048.jpg" ),
				//normalScale: new THREE.Vector2( 0.5, 0.5 )
			} );

			var geometry = new THREE.SphereGeometry( planet.radius * globalObjScale , 60, 30 );
			//geometry.computeTangents();

			var meshPlanet = new THREE.Mesh( geometry, material);

			var relativePos = new THREE.Vector3( 0, 0 , planet.distanceFromSun * globalDistanceScale );
			var posFromSun = sunMesh.position.clone().add(relativePos);
			meshPlanet.position.set(posFromSun.x, posFromSun.y, posFromSun.z);

			//meshMoon.position.applyAxisAngle( axis_y, -90 * Math.PI / 180 );
			//meshMoon.scale.set( moonScale, moonScale, moonScale );

			//meshPlanet.rotation.y = 0;
			meshPlanet.rotation.z = planet.tilt;
			scene.add( meshPlanet );

		}

		if (drawOrbitCircles){
			OrbitCircle( planet.distanceFromSun * globalDistanceScale );
		}

	}

}

function OrbitCircle(radius){

	var curve1 = new THREE.EllipseCurve(
		0, 0,    // ax, aY
		radius, radius,           					// xRadius, yRadius
		0,  2 * Math.PI,  							// aStartAngle, aEndAngle
		true             							// aClockwise
	);

	var curve2 = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( sunMesh.position.x, sunMesh.position.y, sunMesh.position.z + radius ),
		new THREE.Vector3( sunMesh.position.x + radius, sunMesh.position.y, sunMesh.position.z ),
		new THREE.Vector3( sunMesh.position.x, sunMesh.position.y, sunMesh.position.z - radius )
		//new THREE.Vector3( sunMesh.position.x - radius, 0, 0 )

	 );

	var circleRadius = radius;
	var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, circleRadius );
	circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
	circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
	circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
	circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius );

	var points = circleShape.createPointsGeometry();

	//var path = new THREE.Path( curve1.getPoints( 50 ) );
	var geometry = new THREE.Geometry();
	geometry.vertices = curve1.getPoints(100);
	var material = new THREE.LineBasicMaterial( { color : 0x5797a0, opacity: 1.0, linewidth: 0.2 } );

	//var line = new THREE.Line( points, material );
	//line.position.set( sunPos.x, sunPos.y, sunPos.z );
	//line.rotation.set( 90 * Math.PI/180, 0, 0 );
	//line.scale.set( 1, 1, 1 );

	// Create the final Object3d to add to the scene
	ellipse = new THREE.Line( geometry, material );
	ellipse.position.set( sunPos.x, sunPos.y, sunPos.z );
	ellipse.rotation.set( 90 * Math.PI/180, 0, 0 );
	//console.log(ellipse.position);
	scene.add( ellipse );

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
  	//depthWrite: false,
  	side: THREE.BackSide
  } );

  mesh = new THREE.Mesh( new THREE.BoxGeometry( 1e12, 1e12, 1e12 ), equirectMaterial );
  //mesh.rotation.set( 0, 0, 0.3 );
//  mesh.rotation.z = 0.0;
  mesh.position.applyAxisAngle( axis_z, -45 * Math.PI / 180 );
  sceneCube.add( mesh );


  var skyboxPass = new THREE.RenderPass( sceneCube, cameraCube );
  composer.addPass( skyboxPass );

}



function renderSolarSystem() {

	//camera.lookAt( meshEarth.position );

	meshEarth.rotation.y += rotationSpeed * delta;
	meshClouds.rotation.y += 0.90 * rotationSpeed * delta;
  meshLights.rotation.y += rotationSpeed * delta;


  if (drawSkyBox) cameraCube.rotation.copy( camera.rotation );

	//renderer.render( sceneCube, cameraCube );

	//console.log(meshPlanet.rotation.y);

	// slow down as we approach the surface

/* 	dPlanet = camera.position.length();

	dMoonVec.subVectors( camera.position, meshMoon.position );
	dMoon = dMoonVec.length();

	if ( dMoon < dPlanet ) {

		d = ( dMoon - radius * moonScale * 1.01 );

	} else {

		d = ( dPlanet - radius * 1.01 );

	} */

}


function solarSystemResize(){

  cameraCube.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  cameraCube.updateProjectionMatrix();

}
