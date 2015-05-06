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

          //'vec4 diffuse = texture2D( texture, vUv );',

          //'float outer_intensity = pow(abs( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ) ), 12.0 );',
          'float intensity	= pow( 0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.9 );',

          'vec3 outer_fog = vec3( 0.0, 0.6, 0.88 ) * intensity;',

          //'float inner_intensity = abs(1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ) );',
          //'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( inner_intensity, 3.0 );',

          //Fade out atmosphere at edge
          "float viewDot = abs(dot( vNormal, vec3(viewPosition.xy, 1.0) ));",
          "viewDot = clamp( pow( viewDot + 0.9, 10.0 ), 0.0, 1.0);",

          'float depth = gl_FragCoord.z / gl_FragCoord.w;',
          'float alpha = ( 150000.0 - depth ) / 150000.0;',
          //'//alpha = ( 1.0 - smoothstep( 0.5, 1.0, alpha ));',
          'gl_FragColor.w = viewDot * alpha;',  // fix to fade out atmo at distance

          //'gl_FragColor.w = 1.0;',

          //'gl_FragColor = diffuse;',
          //'gl_FragColor = vec4( outer_fog , gl_FragColor.w );',
          'gl_FragColor.xyz = outer_fog;',

        '}'
      ].join('\n')
    }
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
	{name:"saturn", radius:60210, rotationSpeed:0.05, tilt:0.25, distanceFromSun:1427e6,
		distanceFromSunAU:9.54, period:10753},
	{name:"uranus", radius:25650, rotationSpeed:0.03, tilt:-0.41, distanceFromSun:2.86e9,
		distanceFromSunAU:19.2, period:30660},
	{name:"neptune", radius:24750, rotationSpeed:0.02, tilt:0.41, distanceFromSun:4.5e9,
		distanceFromSunAU:30.0, period:60225},
	{name:"pluto", radius:1000, rotationSpeed:0.02, tilt:0.41, distanceFromSun:6e9,
		distanceFromSunAU:42.0, period:80000},
];



//Settings
var drawOrbitCircles = false;
var drawLensFlare = true;

var radius = planets[2].radius;
var tilt = 0.41;
var rotationSpeed = 0.02;

var cloudsScale = 1.005;
var moonScale = 0.273;

var sunMesh, sunFX;
var geometryEarth, meshEarth, meshClouds, meshLights, meshMoon, atmosphere;
var sunPos, earthPos;

var dirLight, pointLight, ambientLight;

var cameraCube, sceneCube;


function initSolarSystem() {

  var shader, uniforms;

	//// Sun
	sunPos = new THREE.Vector3( planets[2].distanceFromSun * global.DistanceScale / 4,
                              planets[2].distanceFromSun * global.DistanceScale / 6,
                              - planets[2].distanceFromSun * global.DistanceScale
                            );
	//var sunGeometry = new THREE.SphereGeometry( Sun.radius, 100, 50 );
  // var sunMaterial = new THREE.MeshPhongMaterial( {
	// 	map: THREE.ImageUtils.loadTexture( "textures/planets/sun.jpg" ),
	// 	//specular: "rgb(255,255,255)",
  //       //color: "rgb(255,255,255)",
  //       emissive: "rgb(100,100,100)"
	// 	//shininess: 30
	// } );

	//sunMesh = new THREE.Mesh( sunGeometry, sunMaterial );
	//sunMesh.position.set(sunPos.x, sunPos.y, sunPos.z);

	//scene.add( sunMesh );
  if (drawLensFlare) initLensFlare();    // draw lensflares instead of mesh

  //initStarFX( sunPos, 0 );   // godrays fx for the Sun
  sunFX = new StarFX();
  sunFX.init( sunPos, 1.5e6, new THREE.Color( 1.0, 0.8, 0.6 ) );

  //// Earth

  earthPos = new THREE.Vector3(); // center of coords

	var materialNormalMap = new THREE.MeshPhongMaterial( {
		specular: 0x555555,
		shininess: 10,
		map: THREE.ImageUtils.loadTexture( "textures/planets/earth_color_4096.jpg" ),
		specularMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_specular_2048.jpg" ),
		normalMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_normal_2048.jpg" ),
		normalScale: new THREE.Vector2( 0.5, 0.5 )
    //blending: THREE.NormalBlending,

	} );

	geometryEarth = new THREE.SphereGeometry( planets[2].radius, 100, 50 );
	geometryEarth.computeTangents();

	meshEarth = new THREE.Mesh( geometryEarth, materialNormalMap );
	//meshEarth.position.set( 0, planets[2].distanceFromSun * global.DistanceScale, 0 );
	meshEarth.rotation.y = 0;
	meshEarth.rotation.z = tilt;
	scene.add( meshEarth );

  // atmosphere fog

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    //uniforms['texture'].value = THREE.ImageUtils.loadTexture("textures/planets/earth_clouds_2048_bright.jpg");

    var atmoMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite	: false

    });

     var geometryAtmo = new THREE.SphereGeometry( planets[2].radius*1.02, 100, 50 );
     var sphereAtmoMesh = new THREE.Mesh( geometryAtmo, atmoMaterial );
     //sphereAtmoMesh.scale.set( 1.0, 1.0, 1.0 );
     scene.add( sphereAtmoMesh );


     // night lights
     var materialLights = new THREE.MeshBasicMaterial( {
         map: THREE.ImageUtils.loadTexture( 'textures/planets/earth_lights_4096.jpg' ),
         color: 0xe2ba1a,
         blending: THREE.AdditiveBlending,
         transparent: true
         //depthTest: false
     } );
     meshLights = new THREE.Mesh( geometryEarth, materialLights );
     meshLights.rotation.z = tilt;
     scene.add( meshLights );


     // clouds
   	geometryClouds = new THREE.SphereGeometry( planets[2].radius*1.02, 100, 50 );
   	var materialClouds = new THREE.MeshPhongMaterial( {
        map: THREE.ImageUtils.loadTexture( "textures/planets/earth_clouds_2048_bright_comp.png" ),
        bumpMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_clouds_bump2_2048_comp.png" ),
        bumpScale: 20,
        color: 0xffffff,
        shininess: 10,
        //blending: THREE.AdditiveBlending,
        transparent: true
        //depthTest: false
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
  var moonDist = 384400;
	meshMoon = new THREE.Mesh( geometryEarth, materialMoon );
	meshMoon.position.set(  moonDist * global.DistanceScale*10,
                          0,
                          0 );
	meshMoon.position.applyAxisAngle( axis_y, -120 * Math.PI / 180 );
  meshMoon.position.applyAxisAngle( axis_z, -20 * Math.PI / 180 );
	meshMoon.scale.set( moonScale, moonScale, moonScale );
	scene.add( meshMoon );

	initPlanets();

	//camera.position.z = meshEarth.position.z + planets[2].radius*10;
	//camera.position.z = planets[2].radius * 10;
  //camera.position.x = planets[2].radius * 10;
	//camera.lookAt( sunMesh.position );
	//camera.lookAt( meshEarth.position );

	SetLight();

	console.log("Init solar system done");

};

function SetLight(){

	dirLight = new THREE.DirectionalLight( 0xffffff , 0.5, 0 );
	dirLight.position.set( sunPos.x, sunPos.y, sunPos.z );
  dirLight.castShadow = false;
	scene.add( dirLight );

	var pLight = new THREE.PointLight( 0xffffff , 1.1, 0);
	pLight.position.set( sunPos.x, sunPos.y, sunPos.z );
  pLight.castShadow = false;
	scene.add( pLight );

	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, ambientLightIntensity );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 10000, 0 );
	scene.add( hemiLight );

  //scene.add( new THREE.AmbientLight( 0x101010 ) );

  // makeup light
  makeupLight = new THREE.DirectionalLight( 0xffffff, 1 );
  makeupLight.position.set( 1, 0.25, -0.5 );
	scene.add( makeupLight );

}

function initLensFlare(){

  // lens flares

	var textureFlare_star1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare0_m1.png" ); // star

	var textureFlare_line1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare2.png" );  // line
  var textureFlare_line2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_blue_line_hor.png" );
  var textureFlare_line3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_yellow_line_hor2.png" );

	var textureFlare_ring1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare1.png" );  // ring
  var textureFlare_ring2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare3.png" );  // ring
  var textureFlare_ring3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare4.png" );  // ring
  var textureFlare_ring4 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare6.png" );  // ring

	var flareColor = new THREE.Color( 0xffffff );
  var flareColor2 = new THREE.Color( 0x888888 );

  // LensFlare(texture, size, distance, blending, color)
	//var lensFlare = new THREE.LensFlare( textureFlare_star1, 512, 0.0, THREE.AdditiveBlending, flareColor );
  var lensFlare = new THREE.LensFlare( textureFlare_line2, 256, 0.0, THREE.AdditiveBlending, flareColor2 );

   //lensFlare.add( textureFlare_line2, 256, 0.0, THREE.AdditiveBlending, flareColor2 );
   lensFlare.lensFlares[ 0 ].rotation = THREE.Math.degToRad( 0 );
   lensFlare.add( textureFlare_line3, 512, 0.0, THREE.AdditiveBlending, flareColor2 );
   lensFlare.lensFlares[ 1 ].rotation = THREE.Math.degToRad( 90 );

	lensFlare.add( textureFlare_ring2, 20, 0.8, THREE.AdditiveBlending, flareColor );
	lensFlare.add( textureFlare_ring2, 30, 0.85, THREE.AdditiveBlending, flareColor );
	lensFlare.add( textureFlare_ring2, 35, 0.9, THREE.AdditiveBlending, flareColor );
	lensFlare.add( textureFlare_ring3, 60, 1.0, THREE.AdditiveBlending, flareColor );

	lensFlare.customUpdateCallback = lensFlareUpdateCallback;

  lensFlare.position.set( sunPos.x, sunPos.y, sunPos.z );

	scene.add( lensFlare );

        // function addSpot( h, s, l, x, y, z ) {
        //
        //   // LensFlare(texture, size, distance, blending, color)
        //   var lensFlare = new THREE.LensFlare( textureFlare_star1, 1024, 0.0, THREE.AdditiveBlending, flareColor );
        //   lensFlare.add( textureFlare_line1, 512, 0.0, THREE.AdditiveBlending );
        //   lensFlare.add( textureFlare_line2, 512, 0.0, THREE.AdditiveBlending );
        //   lensFlare.add( textureFlare_line3, 512, 0.0, THREE.AdditiveBlending );
        //
        //   lensFlare.add( textureFlare_ring1, 60, 0.6, THREE.AdditiveBlending );
        //   lensFlare.add( textureFlare_ring2, 40, 0.7, THREE.AdditiveBlending );
        //   lensFlare.add( textureFlare_ring3, 120, 0.9, THREE.AdditiveBlending );
        //   lensFlare.add( textureFlare_ring4, 70, 1.0, THREE.AdditiveBlending );
        //
        //   lensFlare.customUpdateCallback = lensFlareUpdateCallbackSpot;
        //   lensFlare.position.copy( light.position );
        //
        //   scene.add( lensFlare );
        //
        // }
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

       //flare.scale = 1 / Math.sqrt(distance) * 300;
       flare.scale = 1 / Math.pow( distance, 1/3 ) * 100;
       //flare.scale = 0.0;
       //console.log(flare.scale);
	}

	//object.lensFlares[ 2 ].y += 0.025;
	//object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

}

function initPlanets(){

	for ( var i = 3; i < planets.length ; i ++ ) {

		var planet = planets[i];

		if ( i != 2 ) {		// skip Earth

      var texture = THREE.ImageUtils.loadTexture( "textures/planets/" + planet.name + ".jpg" );
      texture.minFilter = THREE.LinearFilter;
			var material = new THREE.MeshPhongMaterial( {
				//specular: 0x555555,
				//shininess: 30,
				map: texture
				//specularMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_specular_2048.jpg" ),
				//normalMap: THREE.ImageUtils.loadTexture( "textures/planets/earth_normal_2048.jpg" ),
				//normalScale: new THREE.Vector2( 0.5, 0.5 )
			} );

			var geometry = new THREE.SphereGeometry( planet.radius * global.ObjScale , 120, 60 );
			geometry.computeTangents();

      planet.mesh = new THREE.Mesh( geometry, material );

			var relativePos = new THREE.Vector3( 0, 0 , planet.distanceFromSun * global.DistanceScale );
			var posFromSun = sunPos.clone().add( relativePos );

      var deltaX = 0, deltaY = 0, slowDownRange = 0;
      switch (i) {
        case 0:   //mercury
          deltaX = + 20000; deltaY = 1000;
          break;
        case 1:   //venus
          deltaX = + 300000; deltaY = 200000;
          break;
        case 3:   //mars
          deltaX = 12000; deltaY = 4000; slowDownRange = 120000;
          break;
        case 4:   //jupiter
          deltaX = -80000; deltaY = -40000; slowDownRange = 250000;
          break;
        case 5:   //saturn
         deltaX = 90000; deltaY = -30000; slowDownRange = 200000;
          break;
        case 6:   //uranus
          deltaX = -80000; deltaY = -50000; slowDownRange = 200000;
          break;
        case 7:   //neptune
          deltaX = 90000; deltaY = 2000;  slowDownRange = 200000;
          break;
        case 8:   //pluto
          deltaX = -5000; deltaY = 1500; slowDownRange = 200000;
          break;

      }

      planet.mesh.position.set( deltaX, deltaY, posFromSun.z );

      planet.rotation_matrix = new THREE.Matrix4().makeRotationY( 0.001 );

      planet.mesh.rotation.set( planet.tilt, 0, planet.tilt / 2 ); // Set initial rotation
      planet.mesh.matrix.makeRotationFromEuler( planet.mesh.rotation ); // Apply rotation to the object's matrix

      planet.cameraSlowDownRange = slowDownRange;


      planets[i] = planet;

			scene.add( planets[i].mesh );

      if ( i == 5 ) {         // Saturn rings

        planet.mesh.rotation.set( 0, 0, planet.tilt );
        planet.mesh.matrix.makeRotationFromEuler( planet.mesh.rotation );

        var texture = THREE.ImageUtils.loadTexture( "textures/planets/saturn_rings.png" );
        texture.minFilter = THREE.LinearFilter;
        var material = new THREE.MeshPhongMaterial( {
  				map: texture,
          side: THREE.DoubleSide,
          //blending: THREE.AdditiveBlending,
          transparent: true,
          opacity		: 0.99

  			} );

  			var geometry = new THREE.PlaneBufferGeometry( 4.6 * planet.radius * global.ObjScale, 4.6 * planet.radius * global.ObjScale );

        var saturn_rings = new THREE.Mesh( geometry, material );

  			var ringsPos = planet.mesh.position.clone();
        saturn_rings.position.set( ringsPos.x, ringsPos.y, ringsPos.z );

        //var rotation_matrix = new THREE.Matrix4().makeRotationX(0);
        saturn_rings.rotation.set( PI_HALF, planet.tilt - planet.tilt/4 , 0 ); // Set initial rotation
        saturn_rings.matrix.makeRotationFromEuler( saturn_rings.rotation ); // Apply rotation to the object's matrix

        scene.add( saturn_rings );

      }

      if ( i == 6 ) {         // Uranus rings

        var uranus_rings = createUranusRing();
        uranus_rings.scale.multiplyScalar( planet.radius * 3 );
        var ringsPos = planet.mesh.position.clone();
        uranus_rings.position.set( ringsPos.x, ringsPos.y, ringsPos.z );

        var rotation_matrix = new THREE.Matrix4().makeRotationX(0);
        uranus_rings.rotation.set( PI + PI_HALF + planet.tilt/2,  -planet.tilt /2 , 0 ); // Set initial rotation
        uranus_rings.matrix.makeRotationFromEuler( uranus_rings.rotation ); // Apply rotation to the object's matrix

        scene.add( uranus_rings );

      }
		}

		if ( drawOrbitCircles ){
			OrbitCircle( planet.distanceFromSun * global.DistanceScale );
		}

	}

}

//=== modified from https://github.com/jeromeetienne/threex.planets/;
var createUranusRing	= function(){
	// create destination canvas
	var canvasResult	= document.createElement('canvas');
	canvasResult.width	= 1024;
	canvasResult.height	= 72;
	var contextResult	= canvasResult.getContext('2d');
  //var material;

	var imageMap	= new Image();
	imageMap.addEventListener("load", function() {

		// create dataMap ImageData
		var canvasMap	= document.createElement('canvas')
		canvasMap.width	= imageMap.width
		canvasMap.height= imageMap.height
		var contextMap	= canvasMap.getContext('2d')
		contextMap.drawImage(imageMap, 0, 0)
		var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

		// load maps
		var imageTrans	= new Image();
		imageTrans.addEventListener("load", function(){
			// create dataTrans ImageData for earthcloudmaptrans
			var canvasTrans		= document.createElement('canvas')
			canvasTrans.width	= imageTrans.width
			canvasTrans.height	= imageTrans.height
			var contextTrans	= canvasTrans.getContext('2d')
			contextTrans.drawImage(imageTrans, 0, 0)
			var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
			// merge dataMap + dataTrans into dataResult
			var dataResult		= contextMap.createImageData(canvasResult.width, canvasResult.height)
			for(var y = 0, offset = 0; y < imageMap.height; y++){
				for(var x = 0; x < imageMap.width; x++, offset += 4){
					dataResult.data[offset+0]	= dataMap.data[offset+0]
					dataResult.data[offset+1]	= dataMap.data[offset+1]
					dataResult.data[offset+2]	= dataMap.data[offset+2]
					dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]/2
				}
			}
			// update texture with result
			contextResult.putImageData(dataResult,0,0)
			material.map.needsUpdate = true;
		})
		imageTrans.src	= 'textures/planets/uranusringtrans.gif';
	}, false);
	imageMap.src	= 'textures/planets/uranusringcolour.jpg';

	var geometry	= new _RingGeometry(0.55, 0.75, 64);
  var texture = new THREE.Texture( canvasResult );
  texture.minFilter = THREE.LinearFilter;
	var material	= new THREE.MeshPhongMaterial({
		map		: texture,
		// map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/ash_uvgrid01.jpg'),
		side		: THREE.DoubleSide,
		transparent	: true,
		opacity		: 0.5
	});

  var mesh	= new THREE.Mesh( geometry, material );
	//mesh.lookAt( new THREE.Vector3(0.5,-4,1) );
	return mesh;
}

function _RingGeometry ( innerRadius, outerRadius, thetaSegments ) {

	THREE.Geometry.call( this );

	innerRadius	= innerRadius || 0;
	outerRadius	= outerRadius || 50;
	thetaSegments	= thetaSegments	|| 8;

	var normal	= new THREE.Vector3( 0, 0, 1 );

	for(var i = 0; i < thetaSegments; i++ ){
		var angleLo	= (i / thetaSegments) *Math.PI*2
		var angleHi	= ((i+1) / thetaSegments) *Math.PI*2

		var vertex1	= new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
		var vertex2	= new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
		var vertex3	= new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
		var vertex4	= new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

		this.vertices.push( vertex1 );
		this.vertices.push( vertex2 );
		this.vertices.push( vertex3 );
		this.vertices.push( vertex4 );

		var vertexIdx	= i * 4;

		// Create the first triangle
		var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
		var uvs = [];

		var uv = new THREE.Vector2(0, 0);
		uvs.push(uv);
		var uv = new THREE.Vector2(1, 0);
		uvs.push(uv);
		var uv = new THREE.Vector2(0, 1);
		uvs.push(uv);

		this.faces.push(face);
		this.faceVertexUvs[0].push(uvs);

		// Create the second triangle
		var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
		var uvs = [];

		var uv = new THREE.Vector2(0, 1);
		uvs.push(uv);
		var uv = new THREE.Vector2(1, 0);
		uvs.push(uv);
		var uv = new THREE.Vector2(1, 1);
		uvs.push(uv);

		this.faces.push(face);
		this.faceVertexUvs[0].push(uvs);
	}

	//this.computeCentroids();
	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), outerRadius );

};
_RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
//==============================================================================


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


function renderSolarSystem() {

	//camera.lookAt( meshEarth.position );

  // Earth update
	meshEarth.rotation.y += rotationSpeed * delta;
	meshClouds.rotation.y += 0.90 * rotationSpeed * delta;
  meshLights.rotation.y += rotationSpeed * delta;

  // Sun update
  sunFX.updateCustom( 6e9 * global.DistanceScale, 228e6 * global.DistanceScale );

  // planets update
  for ( var i = 3; i < planets.length ; i ++ ) {

    if (i != 2){		// skip Earth

      var deltaZ = planets[i].mesh.position.z - distance;    // planet's approximation to camera

      var maxSlowDownRange = planets[i].cameraSlowDownRange * curZoomStep.zoom_factor;

      if ( Math.abs(deltaZ) < maxSlowDownRange ) {  // is within approximation range

        //console.log(deltaZ);

        setCameraSlowDown( deltaZ, maxSlowDownRange,  0.3 );

        if ( deltaZ < 0 ){    // is in front of the camera
          //planets[i].mesh.position.x =  planets[i].mesh.position.x - 1.0;
        }
        else {                // is behind the camera

          //planets[i].mesh.position.x += ((camera.position.x - planets[i].radius) - planets[i].mesh.position.x) * 0.03;
          //planets[i].mesh.position.x = camera.position.x - planets[i].radius * 1.5; // - deltaZ;
          //planets[i].mesh.position.y = camera.position.y - planets[i].radius * 1;

        }

      }

      // move planet along its orbit
      //planets[i].mesh.position.x += (0 - planets[i].mesh.position.x) * 0.000005;

      //rotate planets around its poles axis
      //    planets[i].mesh.rotation.y += planets[i].rotationSpeed * delta /2;

      planets[i].mesh.matrix.multiply( planets[i].rotation_matrix );
      planets[i].mesh.rotation.setFromRotationMatrix( planets[i].mesh.matrix );

    }
  }

}

function solarSystemResize(){


}
