
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

function init_object_points(show_amount, isRedder, isHideDwarfs) {

	if (!show_amount) show_amount = star_init_list.length;

	geometry = new THREE.Geometry();


		for ( var i = 0; i <= show_amount; i ++ ) {

			if (i >= star_init_list.length) break;

			var obj = star_init_list[i];

			if (isHideDwarfs && (obj.starName.charAt(0) == "M")) continue; //Hide M-type stars

			vector = new THREE.Vector3(
        obj.galX * DistanceScale,
        obj.galY * DistanceScale,
        obj.galZ * DistanceScale
        );
			//vector.name = obj.starName;
			//vector.starid = i;
			vector.color = (obj.color );

			geometry.vertices.push( vector );
			geometry.colors.push( new THREE.Color( obj.color ) );
		}

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

		scene.add( particles );





}







			function init_renderer() {

			}

			function onWindowResize( event ) {
				//When rotated, resize the window and rendering space
				//var width = window.innerWidth, height = window.innerHeight;

				//camera.aspect = width / height;
				//camera.updateProjectionMatrix();

			}
