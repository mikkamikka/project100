var nebulaFog = new THREE.Fog( 0x4584b4, - 100, 3000 );
var maxNebulaRange = 10e9;
var Nebula1, Nebula2, Nebula3, Nebula4;

// shader modified from clouds shader by mr.doob (http://mrdoob.com/lab/javascript/webgl/clouds/)
var nebulaShader = {
      uniforms: {
        'texture': { type: 't', value: null },
				'fogColor' : { type: "c", value: nebulaFog.color },
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

					'float alpha = ( fogFar - depth ) / ( fogFar - fogNear );',

					'alpha = smoothstep( 0.0, 0.5, alpha ) * ( 1.0 - smoothstep( 0.8, 1.0, alpha ));',

					'gl_FragColor.w = gl_FragColor.w * alpha;',
					//'gl_FragColor = vec4( gl_FragColor.xyz, gl_FragColor.w );',
					//'gl_FragColor = mix( vec4( fogColor, gl_FragColor.w ), gl_FragColor , fogFactor );',
          'gl_FragColor.xyz = fogColor * gl_FragColor.xyz;',
          'gl_FragColor = vec4( fogColor, gl_FragColor.w );',

        '}'
      ].join('\n')
}

function NebulaCloud(type){

  this.centerPos = new THREE.Vector3();
	this.distribution = 0;
	this.isInView = false;
	this.distFromCamera = 0;
	this.dustCloud;
	this.dustCloudTexturesAmount = 0;
	this.dustCloudMaxSize = 0;
  this.type = type;
  this.staticImagesSrc = [];
  this.staticImages = [];
  this.color = new THREE.Color( 0x4584b4 );

}

NebulaCloud.prototype.init = function() {

	//var dist = new Random();

	this.dustCloud = createNebulaCloud (this.centerPos,
                                      this.distribution,
                                      this.dustCloudTexturesAmount,
                                      this.dustCloudMaxSize,
                                      this.type,
                                      this.color);
	//scene.add( this.dustCloud );

  if ( this.staticImagesSrc.length > 0 ){

    for (var i=0; i < this.staticImagesSrc.length; i++ ){

      var texture = THREE.ImageUtils.loadTexture( "textures/nebulas/" + this.staticImagesSrc[i] );

      var geometry = new THREE.PlaneBufferGeometry( this.dustCloudMaxSize, this.dustCloudMaxSize);
    	var material = new THREE.MeshBasicMaterial({
    			map: texture,
    			//color: color,
    			blending: THREE.AdditiveBlending,
    			depthWrite: false,
          depthTest: false,
    			transparent: true
    		}
    	)
      this.staticImages[i] = new THREE.Mesh( geometry, material );
      this.staticImages[i].position.copy( this.centerPos );
      this.staticImages[i].position.z += 1000;

    }

  }


}


NebulaCloud.prototype.update = function() {


	this.distFromCamera = camera.position.distanceTo( this.centerPos );			// cloud's center approximation to camera

	// add and remove nebula clouds
	if ( this.distFromCamera < maxNebulaRange ){  // is within approximation range

    for (var i=0; i < this.staticImages.length; i++){

			this.staticImages[i].material.opacity = ( maxNebulaRange - this.distFromCamera ) / maxNebulaRange;
			this.staticImages[i].material.needsUpdate = true;

		}

      if ( !this.isInView ){

        scene.add( this.dustCloud );

        for (var i=0; i < this.staticImages.length; i++){
          scene.add( this.staticImages[i] );
          if (debug) console.log("Nebula cloud added" );
        }

        this.isInView = true;


      }

  }
  else{

      if ( this.isInView ){

        scene.remove( this.dustCloud );

        for (var i=0; i < this.staticImages.length; i++){
          scene.remove( this.staticImages[i] );
          if (debug) console.log("Nebula cloud removed" );
        }

        this.isInView = false;


      }

  }

}



function createNebulaCloud ( centerPos, distribution, numPlanes, maxSize, type, color ){

	var mesh, geometry, material, uniforms, texture;

	var dist = new Random();

  if ( type == undefined ){
    type = 1;
  }

  uniforms = THREE.UniformsUtils.clone(nebulaShader.uniforms);

  switch (type) {
    case 1:
      texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud01.png");
      uniforms['fogFar'].value = 10e8;
      break
    case 2:
      texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud02.png");
      uniforms['fogFar'].value = 10e8;
      break
    case 3:
      texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud03.png");
      uniforms['fogFar'].value = 10e8;
      break
    case 4:
      texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud04.png");
      uniforms['fogFar'].value = 10e8;
      break
    case 5:
      texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud05.png");
      uniforms['fogFar'].value = 10e8;
      break
    case 6:
      texture = THREE.ImageUtils.loadTexture("textures/asteroids/cloud06.png");
      uniforms['fogFar'].value = 10e8;
      break
  }



	uniforms['texture'].value = texture;
  uniforms['fogColor'].value = color;

	material = new THREE.ShaderMaterial( {

						uniforms: uniforms,
						vertexShader: nebulaShader.vertexShader,
						fragmentShader: nebulaShader.fragmentShader,
						depthWrite: false,
						//depthTest: false,
						transparent: true

					} );

	geometry = new THREE.Geometry();

	for ( var i = 0; i < numPlanes; i++ ) {
		var plane = new THREE.Mesh( new THREE.PlaneGeometry( maxSize, maxSize ) );
		//var x = distribution * dist.normal(0, 3) + centerPos.x;
		//var y = distribution * dist.normal(0, 0.5) + centerPos.y ;
		//var z = distribution * dist.normal(0, 2) + centerPos.z;

		plane.position.x = distribution * dist.uniform(-3, 3) * dist.normal(0, 3) + centerPos.x;
		plane.position.y = distribution * dist.normal(0, 0.5) + centerPos.y;
		plane.position.z = distribution * dist.normal(0, 5) + centerPos.z;

		plane.rotation.z = Math.random() * 2 * PI;
		plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

		plane.updateMatrix();

		geometry.merge( plane.geometry, plane.matrix );

	}

	mesh = new THREE.Mesh( geometry, material );

	return mesh;

}


function initNebulaClouds(){

  //================ Nebula 1 =================
  var dist = lyToKM( 9.0 ) * global.DistanceScale * global.starsDistanceScale;

  Nebula1_layer1 = new NebulaCloud(1);
  Nebula1_layer1.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula1_layer1.distribution = 1600e6 * global.DistanceScale;
  Nebula1_layer1.dustCloudTexturesAmount = 10;
  Nebula1_layer1.dustCloudMaxSize = 300e6;
  Nebula1_layer1.color = new THREE.Color(0x5687a8);
  Nebula1_layer1.init();

  Nebula1_layer2 = new NebulaCloud(2);
  Nebula1_layer2.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula1_layer2.distribution = 1400e6 * global.DistanceScale;
  Nebula1_layer2.dustCloudTexturesAmount = 10;
  Nebula1_layer2.dustCloudMaxSize = 400e6;
  Nebula1_layer2.color = new THREE.Color(0x051c3b);
  Nebula1_layer2.init();

  Nebula1_layer3 = new NebulaCloud(3);
  Nebula1_layer3.centerPos = new THREE.Vector3( -4e5, 0, dist );
  Nebula1_layer3.distribution = 1000e6 * global.DistanceScale;
  Nebula1_layer3.dustCloudTexturesAmount = 5;
  Nebula1_layer3.dustCloudMaxSize = 200e6;
  Nebula1_layer3.color = new THREE.Color(0x04261d);
  Nebula1_layer3.init();

  Nebula1_layer4 = new NebulaCloud(5);
  Nebula1_layer4.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula1_layer4.distribution = 600e6 * global.DistanceScale;
  Nebula1_layer4.dustCloudTexturesAmount = 6;
  Nebula1_layer4.dustCloudMaxSize = 300e6;
  Nebula1_layer4.color = new THREE.Color(0x111111);
  Nebula1_layer4.init();


  //================ Nebula 2 =================
  dist = lyToKM( 55.0 ) * global.DistanceScale * global.starsDistanceScale;

  Nebula2_layer1 = new NebulaCloud(1);
  Nebula2_layer1.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula2_layer1.distribution = 1600e6 * global.DistanceScale;
  Nebula2_layer1.dustCloudTexturesAmount = 10;
  Nebula2_layer1.dustCloudMaxSize = 600e6;
  Nebula2_layer1.color = new THREE.Color(0x5687a8);
  Nebula2_layer1.init();

  Nebula2_layer2 = new NebulaCloud(2);
  Nebula2_layer2.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula2_layer2.distribution = 1400e6 * global.DistanceScale;
  Nebula2_layer2.dustCloudTexturesAmount = 10;
  Nebula2_layer2.dustCloudMaxSize = 400e6;
  Nebula2_layer2.color = new THREE.Color(0x051c3b);
  Nebula2_layer2.init();

  Nebula2_layer3 = new NebulaCloud(3);
  Nebula2_layer3.centerPos = new THREE.Vector3( -4e5, 0, dist );
  Nebula2_layer3.distribution = 1000e6 * global.DistanceScale;
  Nebula2_layer3.dustCloudTexturesAmount = 6;
  Nebula2_layer3.dustCloudMaxSize = 500e6;
  Nebula2_layer3.color = new THREE.Color(0x04261d);
  Nebula2_layer3.init();

  Nebula2_layer4 = new NebulaCloud(4);
  Nebula2_layer4.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula2_layer4.distribution = 1300e6 * global.DistanceScale;
  Nebula2_layer4.dustCloudTexturesAmount = 6;
  Nebula2_layer4.dustCloudMaxSize = 600e6;
  Nebula2_layer4.color = new THREE.Color(0x791d01);
  Nebula2_layer4.init();

  Nebula2_layer5 = new NebulaCloud(5);
  Nebula2_layer5.centerPos = new THREE.Vector3( 0, 0, dist );
  Nebula2_layer5.distribution = 900e6 * global.DistanceScale;
  Nebula2_layer5.dustCloudTexturesAmount = 4;
  Nebula2_layer5.dustCloudMaxSize = 300e6;
  Nebula2_layer5.color = new THREE.Color(0x111111);
  Nebula2_layer5.init();


  //================ photo Nebula 1 =================
  dist = lyToKM( 30 ) * global.DistanceScale * global.starsDistanceScale;
  Nebula_photo1 = new NebulaCloud(1);
  Nebula_photo1.centerPos = new THREE.Vector3( -2e9, 1e9, dist );
  Nebula_photo1.distribution = 600e6 * global.DistanceScale;
  Nebula_photo1.dustCloudTexturesAmount = 0;
  Nebula_photo1.dustCloudMaxSize = 100e7;
  Nebula_photo1.color = new THREE.Color(0x6a1212);
  Nebula_photo1.staticImagesSrc = [ "Boomerang_Nebula_1_1.jpg" ];
  Nebula_photo1.init();

	console.log("Init nebulas done");

}

function NebulaCloudsUpdate(){

  Nebula1_layer1.update();
  Nebula1_layer2.update();
  Nebula1_layer3.update();
  Nebula1_layer4.update();

  Nebula2_layer1.update();
  Nebula2_layer2.update();
  Nebula2_layer3.update();
  Nebula2_layer4.update();
  Nebula2_layer5.update();

  Nebula_photo1.update();

}
