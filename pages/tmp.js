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
