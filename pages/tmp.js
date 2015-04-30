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


var starShader = {
      uniforms: {
        'texture': { type: 't', value: null },
        'texture_color': { type: 't', value: null },
        'noise_texture': { type: 't', value: null },
        'time': { type: "f", value: 1.0 },
        'resolution': { type: "v2", value: new THREE.Vector2() },
        'color_shift' : { type: "c", value: new THREE.Color(1.0) },


        //'fogColor' : { type: "c", value: null },
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
        'uniform sampler2D texture_color;',
        'uniform sampler2D noise_texture;',
        'uniform float time;',
        'uniform vec2 resolution;',
        'uniform vec3 color_shift;',

        //'uniform vec3 fogColor;',
        'uniform float fogNear;',
        'uniform float fogFar;',
        'varying vec2 vUv;',

        //'mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}',
        //'float noise( in vec2 x ){ return texture2D( noise_texture, x * 0.01 ).x; }',
        //'float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }',

        // 'float fbm(in vec2 p) {',
        // 	'float z=2.;',
        // 	'float rz = 0.;',
        // 	'vec2 bp = p;',
        // 	'for (float i= 1.;i < 6.;i++)	{',
        // 		'rz+= abs((noise(p)-0.5)*2.)/z;',
        // 		'z = z*2.;',
        // 		'p = p*2.;  	}',
        // 	'return rz;   }',
        //
        // 'float dualfbm(in vec2 p)  {',
        //     //get two rotated fbm calls and displace the domain
        // 	'vec2 p2 = p*.7;',
        // 	'vec2 basis = vec2(fbm(p2-time*1.6),fbm(p2+time*1.7));',
        // 	'basis = (basis-.5)*.2;',
        // 	'p += basis;',
        // 	//coloring
        // 	'return fbm(p*makem2(time*0.2));   }',

        'void main() {',

          //'float depth = gl_FragCoord.z / gl_FragCoord.w;',
          //'float fogFactor = smoothstep( fogNear, fogFar, depth );',
          //'gl_FragColor = texture2D( texture, vUv );',



          //'float ray = sin(rand( vUv* makem2(time)*2.0 ));',
          //'float ray = noise ( time ) ;',

          //'vec2 p = vUv;',
          //'p.x *= resolution.x/resolution.y;',
          //'p *= 4.0;',
          //'vec3 shift = vec3( 0.9, 0.9, 0.9 ) / dualfbm( p );',

          'float depth = gl_FragCoord.z / gl_FragCoord.w;',
					//'float fogFactor = smoothstep( fogNear, fogFar, depth );',
          'float alpha = ( fogFar - depth ) / ( fogFar - fogNear );',


          //'if (alpha < 0.5) { const int Samples = 0; }',

          'const int Samples = 42;',
          'float Intensity = 0.12;',
          'float Decay = 0.860;',
          'vec2 TexCoord = vUv;',
          'vec2 Direction = vec2(0.5) - TexCoord;',
          'Direction /= vec2( Samples, Samples );',
          'vec3 Color = texture2D( texture, TexCoord ).rgb;',


          // radial shift from https://www.shadertoy.com/view/llfGD4 - sketch by @pheeelicks

          'vec2 d = vUv  - vec2(0.5)  ;',

          'vec4 f1 = texture2D( noise_texture, vec2( atan( d.x, d.y ) / 15.0, 0.3 ) + 0.002 * time );',
          'vec4 f2 = texture2D( noise_texture, vec2( atan( d.y, d.x ) / 10.0, 0.3 ) + 0.002 * time );',

          //'vec4 color_tex = texture2D( texture_color, TexCoord );',

          'for ( int Sample = 0; Sample < Samples; Sample++ )',
          '{',

            'Color += texture2D( texture, TexCoord ).rgb * (f1.rgb + f2.rgb) * Intensity;',
            //'Color.r += texture2D( texture, TexCoord ).r * Intensity * noise( vUv* makem2(time)*2.0 );',
            //'Color.g += texture2D( texture, TexCoord ).g * Intensity * noise( vUv* makem2(time)*2.0 );',
            //'Color.b += texture2D( texture, TexCoord ).b * Intensity * noise( vUv* makem2(time)*2.0 );',
            'Intensity *= Decay ;',
            'TexCoord += Direction;',
          '}',

          //'gl_FragColor = vec4( Color  * color_shift, 1.0 );',
          'gl_FragColor = vec4( Color  * vec3( 1.0, 0.9, 0.8 ), 1.0 );',
          //vec3( 1.0, 0.8, 0.6 )
        '}'
      ].join('\n')
};
