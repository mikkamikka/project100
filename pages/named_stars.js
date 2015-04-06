
// Stars data from https://github.com/jaycrossler/StarDatabase
var stars = [];
var show_amount = 716;
var isHideDwarfs = true;
var DistanceScale = global.DistanceScale * LY /10;
var maxFlareRange = global.DistanceScale * 149.5e6 * 3000;  //30AU, Pluto orbit distance
var maxFlareRangeLY = kmToLY(maxFlareRange);
if (debug) console.log('maxFlareRange, light years: ' + maxFlareRangeLY);
//var maxFlareRange = 400000000;

var textureFlare_star1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_star1.png" ); // star

var textureFlare_line1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare2.png" );  // line
var textureFlare_line2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_blue_line_hor.png" );
var textureFlare_line3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_yellow_line_hor.png" );

var textureFlare_ring1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare3.png" );  // ring
var textureFlare_ring2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare4.png" );  // ring
var textureFlare_ring3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare5.png" );  // ring
var textureFlare_ring4 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare6.png" );  // ring

function Star(){
	this.name = '';
	this.id = 0;
	this.position = new THREE.Vector3();
	this.distance = 0;
	this.color = 0x000000;
	this.body = null; //= new THREE.LensFlare();
	this.distFromCamera =  0;
	this.isInCameraRange = false;

}

Star.prototype.update = function(){

	this.distFromCamera = camera.position.distanceTo( this.position );

	if (this.distFromCamera < maxFlareRange){
		if (this.body == null) {
			initStarBody(this);
			scene.add(this.body);
			this.isInCameraRange = true;
			console.log("Star body added");
		}
	}
	else {
		if (this.body != null) {
			scene.remove(this.body);
			this.body = null;
			this.isInCameraRange = false;
			console.log("Star body removed");
		}
	}

}

function initStarBody(star){

	var color = new THREE.Color( this.color );
	//color.setAlpha(0.1);

	star.body = new THREE.LensFlare();
	star.body.add( textureFlare_star1, 256, 0.0, THREE.AdditiveBlending, color );
	star.body.lensFlares[0].rotation = THREE.Math.degToRad( 0 );
	star.body.add( textureFlare_ring1, 60, 0.75, THREE.AdditiveBlending, color );
	star.body.add( textureFlare_ring2, 40, 0.8, THREE.AdditiveBlending, color );
	star.body.add( textureFlare_ring3, 120, 0.9, THREE.AdditiveBlending, color );
	star.body.add( textureFlare_ring4, 70, 1.0, THREE.AdditiveBlending, color );

	star.body.customUpdateCallback = lensFlareUpdateCallbackStars;
	star.body.position.copy( star.position );

}

function initNamedStars() {

	//init_object_points(100, false, true);

	for ( var i = 1; i < show_amount; i ++ ) {

		if (i >= star_init_list.length) break;
		if (isHideDwarfs && (star_init_list[i].starName.charAt(0) == "M")) continue; //Hide M-type stars

		var source = star_init_list[i];

		stars[i] = new Star();
		stars[i].name = source.starName;
		stars[i].id = source.id;
		stars[i].distance = source.dist;
		stars[i].position.set(source.galX, source.galY, source.galZ);
		stars[i].position.setLength(stars[i].distance * DistanceScale);
		stars[i].color = source.color;


		//stars[i].body.position.set( x, y, z );
		//scene.add( stars[i].body );

	}

	console.log("Init stars done");
}

function lensFlareUpdateCallbackStars( object ) {

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


function starsUpdate(){

	var i;
	for (i = 0; i < stars.length ; i++) {
  	if (stars[i] != undefined )
			stars[i].update();
	}

}










			var particles = [];
      var geometry;



			var lastClicked = null, lastColor = null, highlightLine = null;

			var PI2 = Math.PI * 2;

			// var program = function ( context, color ) {
			// 	context.fillStyle = color.__styleString;
			// 	context.beginPath();
			// 	context.arc( 0, 0, 1, 0, PI2, true );
			// 	context.closePath();
			// 	context.fill();
			// }





			function init_object_points(show_amount, isRedder, isHideDwarfs) {

				if (!show_amount) show_amount = star_init_list.length;
				var color_offset = (isRedder) ? 0x006050 : 0x000000;

				geometry = new THREE.Geometry();

					//Stars
					for ( var i = 0; i <= show_amount; i ++ ) {

						if (i >= star_init_list.length) break;

						var obj = star_init_list[i];

						if (isHideDwarfs && (obj.starName.charAt(0) == "M")) continue; //Hide M-type stars

						vector = new THREE.Vector3(
              obj.galX * DistanceScale,
              obj.galY * DistanceScale,
              obj.galZ * DistanceScale
              );
						vector.name = obj.starName;
						vector.starid = i;
						vector.color = (obj.color - color_offset);

						geometry.vertices.push( vector );
						geometry.colors.push( new THREE.Color( obj.color - color_offset ) );
					}

					//TODO: Scale based on size
					var sprite = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare0_alpha.png" );
					var material = new THREE.PointCloudMaterial( {
            size: (10000 + Math.random()*10),
            //sizeAttenuation: true,
            map: sprite,
            //alphaTest: 0.5,
            transparent: true,
            //blending: THREE.AdditiveBlending,
            vertexColors: true
          } );

					particles = new THREE.PointCloud( geometry, material );
					//particles.sortParticles = true;
					//particles.isClickable = true;
					//particles.updateMatrix();
					scene.add( particles );





			}


			function objectWasClicked(intersectClicked) {
				var starscopy = [];
				var objectClicked = intersectClicked.object;

				div_info.innerHTML=objectClicked.name;
				if (option_RenderEngine == "webgl") {
					if (lastClicked) {
						intersectClicked.particleSystem.geometry.colors[lastClicked] = new THREE.Color( lastColor );
						scene.removeObject(highlightLine);
					}
					lastClicked = intersectClicked.particleNumber;
					lastColor = intersectClicked.particleSystem.geometry.colors[intersectClicked.particleNumber].hex;
					intersectClicked.particleSystem.geometry.colors[intersectClicked.particleNumber].setHex( 0xff0000 );

					starscopy = intersectClicked.particleSystem.geometry.vertices.concat([]); //copy the sorted array

				} else { // Canvas or SVG

					if (lastClicked) {
						lastClicked.materials[0] = new THREE.ParticleBasicMaterial( { map: new THREE.Texture( generateSunTexture(lastColor,1) ), blending: THREE.AdditiveBlending } );
//						lastClicked.scale.x = lastClicked.scale.y = .1;
						scene.removeObject(highlightLine);
					}
					lastClicked = objectClicked;
					lastColor = objectClicked.materials[0].color.hex;
					objectClicked.materials[0] = new THREE.ParticleBasicMaterial( { map: new THREE.Texture( generateSunTexture(0xff0000,1,true) ), blending: THREE.AdditiveBlending } );
//					objectClicked.scale.x = objectClicked.scale.y = .3;

					for (var j = 0, k = scene.objects.length; j<k; j++) {
						var scobj = scene.objects[j];
						if (scobj.isClickable && scobj instanceof THREE.Particle)
							starscopy = starscopy.concat(scobj);
					}

				}

				var closest_sorted = starscopy.sort( function ( a, b ) { return objectClicked.position.distanceTo (a.position)-objectClicked.position.distanceTo (b.position); } );

				var stars_to_show = 4;
				var closest = [];
				for (var i = 0; i < (stars_to_show*3); i++) {
					//remove duplicate stars
					var star = closest_sorted[i];
					if (star.name != closest_sorted[i+1].name) {
						closest.push(closest_sorted[i]);
					}
					if (closest.length > stars_to_show) break;
				}

				document.getElementById("infolefttitle").innerHTML = "Neighbors:";

				var geometry = new THREE.Geometry();  //TODO: Not count system binaries
				//For the 4 nearest stars
				for (var i = 1; i <= stars_to_show; i++) {
					geometry.vertices.push( new THREE.Vertex( closest[0].position ) );
					geometry.vertices.push( new THREE.Vertex( closest[i].position ) );
					var star = star_init_list[closest[i].starid];

					var doctab = document.getElementById("infotab"+i);

					var colorstar = new THREE.Color( star.color );
					doctab.style.backgroundColor = colorstar.rgbaString;

 					doctab.innerHTML = "<nobr>"+i+": "+star.starName+"</nobr><br/>"
					doctab.innerHTML+= star.starType+ " "+
						parseInt(closest[0].position.distanceTo(closest[i].position))+ "[" + parseInt(star.dist) + "] LY away";
//					doctab.appendChild(generateSunTexture(star.color,.8));

				}
				var material = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 0.6 } );
				highlightLine = new THREE.Line( geometry, material );
				scene.addObject( highlightLine );

			}



			function queryString(q) {
				hu = window.location.search.substring(1);
				gy = hu.split("&");
				var result = null;
				for (i=0;i<gy.length;i++) {
					ft = gy[i].split("=");
					if (ft[0] == q) {
						result = ft[1]; break;
					}
				}
				return result;
			}

			function init_renderer() {

			}

			function onWindowResize( event ) {
				//When rotated, resize the window and rendering space
				//var width = window.innerWidth, height = window.innerHeight;

				//camera.aspect = width / height;
				//camera.updateProjectionMatrix();

			}
