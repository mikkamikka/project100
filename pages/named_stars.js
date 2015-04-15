
// Stars data from https://github.com/jaycrossler/StarDatabase
var stars = [];
var show_amount = 716;
var isHideDwarfs = true;
var DistanceScale = global.DistanceScale * LY ;
var maxFlareRange = global.DistanceScale * LY * 1;
var maxFlareRangeLY = kmToLY(maxFlareRange);

if (debug) console.log('stars maxFlareRange, light years: ' + maxFlareRangeLY);
//var maxFlareRange = 400000000;

var textureFlare_star1 = THREE.ImageUtils.loadTexture( "textures/lensflare/star1.png" ); // star

//var textureFlare_line1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare2.png" );  // line
//var textureFlare_line2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_blue_line_hor.png" );
//var textureFlare_line3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_yellow_line_hor.png" );

//var textureFlare_ring1 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare3.png" );  // ring
//var textureFlare_ring2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare4.png" );  // ring
//var textureFlare_ring3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare5.png" );  // ring
//var textureFlare_ring4 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare6.png" );  // ring

function Star(){
	this.name = '';
	this.id = 0;
	this.position = new THREE.Vector3();
	this.distance = 0;
	this.color;
	this.body = null; //= new THREE.LensFlare();
	this.distFromCamera =  0;
	this.isInCameraRange = false;
}

Star.prototype.update = function(){

	//this.distFromCamera = camera.position.distanceTo( this.position );
	this.distFromCamera = camera.position.z - this.position.z;

	//if ( this.distFromCamera > maxFlareRange ){
	if ( this.distFromCamera > 0 && this.distFromCamera < maxFlareRange ){
		if (this.body == null) {
			initStarBody(this);
			scene.add(this.body);
			this.isInCameraRange = true;
			if (debug) console.log("Star body added");
		}
	}
	else {
		if (this.body != null) {
			scene.remove(this.body);
			this.body = null;
			this.isInCameraRange = false;
			if (debug) console.log("Star body removed");
		}
	}

}

function initStarBody(star){

	var color = new THREE.Color( star.color );

	var hsl = color.getHSL();
	//color.setHSL( hsl.h, hsl.s, 0.8);
	//console.log(color.getHSL());

	star.body = new THREE.LensFlare();
	star.body.add( textureFlare_star1, 256, 0.0, THREE.AdditiveBlending, color.offsetHSL( 0, 0, -0.1 ) );
	star.body.lensFlares[0].rotation = THREE.Math.degToRad( 0 );
	star.body.add( textureFlare_star1, 96, 0.0, THREE.AdditiveBlending, color.offsetHSL( 0, 0, 0 ) );
	star.body.lensFlares[1].rotation = THREE.Math.degToRad( 0 );

	// star.body.add( textureFlare_ring1, 20, 0.75, THREE.AdditiveBlending, color );
	// //star.body.add( textureFlare_ring2, 40, 0.8, THREE.AdditiveBlending, color );
	// star.body.add( textureFlare_ring3, 30, 0.9, THREE.AdditiveBlending, color );
	// //star.body.add( textureFlare_ring4, 70, 1.0, THREE.AdditiveBlending, color );

	star.body.customUpdateCallback = lensFlareUpdateCallbackStars;
	star.body.position.copy( star.position );

}

function initNamedStars() {

	//init_object_points(100, false, true);

	for ( var i = 1; i < show_amount && i < star_init_list.length; i ++ ) {

		//if (isHideDwarfs && (star_init_list[i].starName.charAt(0) == "M")) continue; //Hide M-type stars

		var source = star_init_list[i];
		if ( source.dist > 100 ) continue;		// filter out stars far then 100 ly

		stars[i] = new Star();
		stars[i].name = source.starName;
		stars[i].id = source.id;
		stars[i].distance = source.dist;

		stars[i].position.set(
			source.galX * 1e9,
			source.galY * 1e9,
			Math.abs( stars[i].distance * DistanceScale )
			);

		if ( stars[i-1] != undefined )
			if ( stars[i-1].distance == stars[i].distance ){

				//if (debug) console.log(stars[i].name + " double star");
				stars[i].position.set( stars[i].position.x + 2e9, stars[i].position.y + 1e9, stars[i].position.z + 1e9 );

			}

		// stars[i].position.set(
		// 	(0.5-Math.random()) * 1e10,
		// 	(0.5-Math.random()) * 1e10,
		// 	Math.abs( stars[i].distance * DistanceScale )
		// 	);

		//stars[i].position.setLength(stars[i].distance * DistanceScale);
		stars[i].color = source.color;

		//stars[i].body.position.set( x, y, z );
		//scene.add( stars[i].body );

	}

	initStarsPointCloud();

	console.log("Init stars done " + stars.length);
}

function lensFlareUpdateCallbackStars( object ) {

	var f, fl = object.lensFlares.length;
	var flare;
	var vecX = -object.positionScreen.x * 2;
	var vecY = -object.positionScreen.y * 2;

	//var camDistance = camera.position.length();
	var distFromCamera = camera.position.distanceTo( object.position );
	//console.log(object.position);

	for( f = 0; f < fl; f++ ) {

		   flare = object.lensFlares[ f ];

		   flare.x = object.positionScreen.x + vecX * flare.distance;
		   flare.y = object.positionScreen.y + vecY * flare.distance;

		   //flare.rotation = 0;

	     flare.wantedRotation = flare.x * Math.PI * 0.25;
	     flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

	     //flare.scale = 1 / Math.pow( kmToLY( distFromCamera / global.DistanceScale ), 1 / 4 );
			 //flare.scale = 1 / kmToLY( maxFlareRange - distFromCamera / global.DistanceScale ) * 0.3;
			 flare.scale = 3 * ( maxFlareRange - distFromCamera ) / maxFlareRange;
	}

}


function starsUpdate(){

	var i;
	for (i = 0; i < stars.length ; i++) {
  	if (stars[i] != undefined )
			stars[i].update();
	}

}


var vertex, sprite, material, geometry, particles;

function initStarsPointCloud() {

	geometry = new THREE.Geometry();

		for ( var i = 0; i < stars.length; i++ ) {
			if (stars[i] == undefined) continue;
			vertex = stars[i].position.clone();
			geometry.vertices.push( vertex );
			geometry.colors.push( new THREE.Color( stars[i].color ) );
		}

		sprite = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare_star1.png" );
		material = new THREE.PointCloudMaterial( {
      size: 10e9,
      sizeAttenuation: true,
      map: sprite,
      transparent: true,
      blending: THREE.AdditiveBlending,
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
