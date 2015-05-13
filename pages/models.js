var maxModelRange = global.DistanceScale * 40e6;

var loader = new THREE.STLLoader();

// var material = new THREE.MeshBasicMaterial( {
//   color: 0xffffff,
//   specular: 0x666666
//   //shininess: 200
//   } );

var material = new THREE.MeshNormalMaterial( {
  //color: 0xffffff,
  //specular: 0x666666
  //shininess: 200
  } );

var voyager, eva_pod;
var voyagerInitialPos = new THREE.Vector3( -10000, 0.2, 8534500000 * global.DistanceScale );   // real is 19534500000 km
var voyagerIsInView, prevVoyagerIsInView;

var eva_podInitialPos = new THREE.Vector3( -35000, 7000, (778e6 - 149.5e6 + 30e6) * global.DistanceScale );   // real is 19534500000 km


function loadVoyager(){

  loader.load( 'models/Voyager_17.stl', function ( geometry ) {

					var meshMaterial = material;
					if (geometry.hasColors) {
						meshMaterial = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
            console.log("hasColors");
					}

					voyager = new THREE.Mesh( geometry, meshMaterial );

          voyager.position.set( 0.5, 0.2, 3.5e6 * global.DistanceScale );
          //voyager.rotation.set( - Math.PI / 2, Math.PI / 2, 0 );
          voyager.scale.set( 600.0, 600.0, 600.0 );

          //voyager.castShadow = true;
          //voyager.receiveShadow = true;

					scene.add( voyager );

				} );

}

function loadVoyagerPLY(){
  var loader = new THREE.PLYLoader();
	loader.addEventListener( 'load', function ( event ) {

  	var geometry = event.content;
  	var material = new THREE.MeshPhongMaterial( { color: 0x0055ff, specular: 0x111111, shininess: 200 } );
  	var mesh = new THREE.Mesh( geometry, material );

  	mesh.position.set( 0, - 0.25, 0 );
  	mesh.rotation.set( 0, - Math.PI / 2, 0 );
  	mesh.scale.set( 600, 600, 600 );

  	//mesh.castShadow = true;
  	//mesh.receiveShadow = true;

  	scene.add( mesh );

	} );
	loader.load( 'models/Voyager_17.ply' );

}


function loadVoyagerOBJ(){

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};

				var texture = new THREE.Texture();
        var texture2 = new THREE.Texture();

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};


				var loader = new THREE.ImageLoader( manager );
				loader.load( 'models/texture/Voyager_tex_01.jpg', function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );

				// model

				var loader = new THREE.OBJLoader( manager );
				loader.load( 'models/Voyager_17.obj', function ( object ) {

          object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh && child.name != "tex_02_AO_BODY.000") {

							child.material.map = texture;

						}

					} );

          object.position.set( voyagerInitialPos.x, voyagerInitialPos.y, voyagerInitialPos.z );
          object.rotation.set( -PI/2, PI/4, 0 );
          object.scale.set( 1200, 1200, 1200);
          voyager = object;
					scene.add( voyager );

				}, onProgress, onError );


}

function loadEVA2001OBJ(){

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};

				var texture = new THREE.Texture();
        //var texture2 = new THREE.Texture();

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};


				var loader = new THREE.ImageLoader( manager );
				loader.load( 'models/texture/Voyager_tex_01.jpg', function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );

				// model

        var loader = new THREE.OBJMTLLoader();
				loader.load( 'models/eva_pod.obj', 'models/eva_pod.mtl', function ( object ) {

          object.position.set( eva_podInitialPos.x, eva_podInitialPos.y, eva_podInitialPos.z );
          object.rotation.set( -PI/2, 0, 0 );
          object.scale.set( 1200, 1200, 1200);
          eva_pod = object;
          scene.add( eva_pod );

				}, onProgress, onError );


}




function initModels(){

  loadVoyagerOBJ();
  loadEVA2001OBJ();

}


function updateModels(){

  if ( voyager != undefined )  {
    voyager.rotation.y += 0.005;

    var camDistance = voyager.position.z - distance;

    //setCameraSlowDown( camDistance, maxModelRange,  0.02 );

    var range = maxModelRange * 3;
    if ( Math.abs( camDistance ) < range ) {

      voyagerIsInView = true;

      voyager.position.z += 100.0;

      var a = smoothstep( - range, 0, camDistance );    // in front of the camera
      var b = 1 - smoothstep( 0, range - range/4, camDistance );        // behind the camera
      var d = 1.0 - a * b;

      slowDown = scale( d, 0.0, 1.0, 0.02, 1.0 );

    }
    else{

      voyagerIsInView = false;
      slowDown = 1.0;

    }

    if ( !voyagerIsInView && prevVoyagerIsInView ){
      voyager.position.z = voyagerInitialPos.z;
    }

    prevVoyagerIsInView = voyagerIsInView;

  }

  if ( eva_pod != undefined )  {

    eva_pod.rotation.z -= 0.005;

  }

}
