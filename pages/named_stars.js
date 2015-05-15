
// Stars data from https://github.com/jaycrossler/StarDatabase
var stars = [];
var show_amount = 716;
var isHideDwarfs = true;
var DistanceScale = global.DistanceScale * LY * global.starsDistanceScale;
var maxFlareRange = global.DistanceScale * LY * global.starsDistanceScale * 2 * 6;
//var maxFlareRange = DistanceScale;
var maxFlareRangeLY = kmToLY(maxFlareRange);

if (debug) console.log('stars maxFlareRange, light years: ' + maxFlareRangeLY);
//var maxFlareRange = 400000000;

var textureFlare_star1 = THREE.ImageUtils.loadTexture( "textures/lensflare/star5_alpha.png" ); // star
var textureFlare_star2 = THREE.ImageUtils.loadTexture( "textures/lensflare/star5_alpha.png" ); // star
//var textureFlare_star3 = THREE.ImageUtils.loadTexture( "textures/lensflare/star2_alpha.png" ); // star

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
	this.size = 1.5e7;
	this.position = new THREE.Vector3();
	this.distance = 0;
	this.color;
	this.body = null; //= new THREE.LensFlare();
	this.body2 = null;
	this.distFromCamera =  0;
	this.isInCameraRange = false;
	this.starFX = null;
}

Star.prototype.update = function(){

	//this.distFromCamera = camera.position.distanceTo( this.position );
	this.distFromCamera = camera.position.z - this.position.z;

	//if ( this.distFromCamera > maxFlareRange ){
	if ( this.distFromCamera > 0 && this.distFromCamera < maxFlareRange ){

		if (this.body == null) {

			initStarBody(this);
			this.body.scale.set( 0.1, 0.1, 0.1 );
			this.body2.scale.set( 0.1, 0.1, 0.1 );
			scene.add(this.body);
			scene.add(this.body2);
			this.isInCameraRange = true;
			if (debug) console.log("Star body added");
		}
		else{

			//var distFromCamera = camera.position.distanceTo( this.body.position );
			//var descending = ( maxFlareRange - this.distFromCamera ) / maxFlareRange;		// 1 -> 0
			//var scale = smoothstep( 0.0, 1.0, descending );  // 0 -> 1
			var scale = 1 - smoothstep( 3 * maxFlareRange / 4, maxFlareRange, this.distFromCamera);  // 1 -> 0
			this.body.scale.set( scale,	scale, 1.0);
			this.body2.scale.set( scale,	scale, 1.0);

			//var relocateRange = maxFlareRange/3;
			//var relocateRange = 0;
			//if ( this.distFromCamera > relocateRange ){

				//var outOfRelocateRangeDist = Math.sqrt( (this.distFromCamera - relocateRange) ) ;
				//var outOfRelocateRangeDist = this.distFromCamera - relocateRange;

				//	var outOfRelocateRangeDistNormalized = smoothstep( 0, maxFlareRange , outOfRelocateRangeDist );  // 0 -> 1

				//var linearCorrection = (maxFlareRange*3 - this.distFromCamera ) / maxFlareRange*3;  // 0 -> 1
				//cam.x = linearCorrection * 100;

				//var deltaX = outOfRelocateRangeDistNormalized * this.position.x * 10;
				//var deltaY = outOfRelocateRangeDistNormalized * this.position.y * 10;
				//var deltaX = linearCorrection * this.position.x * 10;
				//var deltaY = linearCorrection * this.position.y * 10;

				var deltaX = this.distFromCamera * this.position.x /5e7;
				var deltaY = this.distFromCamera * this.position.y /5e7;

				this.body.position.x = this.position.x + deltaX;
				this.body.position.y = this.position.y + deltaY;

				this.body2.position.x = this.position.x + deltaX;
				this.body2.position.y = this.position.y + deltaY;

				if ( this.starFX != null ){

					this.starFX.mesh.position.copy( this.body.position );

				}

			//}

		}

	}
	else {
		if (this.body != null) {
			scene.remove(this.body);
			this.body = null;
			scene.remove(this.body2);
			this.body2 = null;
			this.isInCameraRange = false;
			if (debug) console.log("Star body removed");
		}
	}

	if ( this.starFX != null ){

		this.starFX.update();

	}


}

function initStarBody(star){

	var color = new THREE.Color( star.color );

	//var hsl = color.getHSL();
	//color.setHSL( hsl.h, hsl.s, 0.8);
	//console.log(color.getHSL());

//unused
	// star.body = new THREE.LensFlare();
	// star.body.add( textureFlare_star1, 512, 0.0, THREE.AdditiveBlending, color.offsetHSL( 0, 0, -0.1 ) );
	// star.body.lensFlares[0].rotation = THREE.Math.degToRad( 0 );
	// //star.body.add( textureFlare_star1, 96, 0.0, THREE.AdditiveBlending, color.offsetHSL( 0, 0, 0 ) );
	// //star.body.lensFlares[1].rotation = THREE.Math.degToRad( 0 );
	//
	// // star.body.add( textureFlare_ring1, 20, 0.75, THREE.AdditiveBlending, color );
	// // //star.body.add( textureFlare_ring2, 40, 0.8, THREE.AdditiveBlending, color );
	// // star.body.add( textureFlare_ring3, 30, 0.9, THREE.AdditiveBlending, color );
	// // //star.body.add( textureFlare_ring4, 70, 1.0, THREE.AdditiveBlending, color );
	//
	// star.body.customUpdateCallback = lensFlareUpdateCallbackStars;
	// star.body.position.copy( star.position );

	var geometry = new THREE.PlaneBufferGeometry( star.size * 0.4, star.size * 0.4 );
	var material = new THREE.MeshBasicMaterial({
			map: textureFlare_star1,
			color: color.offsetHSL( 0, 0, -0.2 ),
			//color: color,
			//blending: THREE.AdditiveBlending,
			depthWrite: false,
			//depthTest: false,
			transparent: true
		});
	star.body = new THREE.Mesh( geometry, material );
	star.body.position.copy( star.position );

	geometry = new THREE.PlaneBufferGeometry( star.size * 0.3, star.size * 0.3 );
	material = new THREE.MeshBasicMaterial({
			map: textureFlare_star2,
			//color: color.offsetHSL( 0, 0, -0.2 ),
			//color: color,
			//blending: THREE.AdditiveBlending,
			depthWrite: false,
			//depthTest: false,
			transparent: true
		});
	star.body2 = new THREE.Mesh( geometry, material );
	star.body2.position.copy( star.position );

	if (star.starFX == null){

		star.starFX = new StarFX();
		star.starFX.init( new THREE.Vector3().copy( star.position ), star.size, new THREE.Color(1.0,1.0,1.0) );

	}

}

function initNamedStars() {

	//init_object_points(100, false, true);

	for ( var i = 1; i < show_amount && i < star_init_list.length; i ++ ) {

		//if (isHideDwarfs && (star_init_list[i].starName.charAt(0) == "M")) continue; //Hide M-type stars

		var source = star_init_list[i];
		if ( source.dist > 110 ) continue;		// filter out stars far then 100 ly

		stars[i] = new Star();
		stars[i].name = source.starName;
		stars[i].id = source.id;
		stars[i].distance = source.dist;

		var x = source.galX,
				y = source.galY;

		if ( stars[i].distance > 60 ){

			if (40 < x && x < 50)  x /= Math.floor( x / 10 );
			if (50 < x && x < 60)  x /= Math.floor( x / 10 );
			if (60 < x && x < 80)	 x /= Math.floor( x / 10 );
			if (80 < x && x < 160) x /= Math.floor( x / 10 );

			if (40 < y && y < 50)  y /= Math.floor( y / 10 );
			if (50 < y && y < 60)  y /= Math.floor( y / 10 );
			if (60 < y && y < 80)	 y /= Math.floor( y / 10 );
			if (80 < y && y < 160) y /= Math.floor( y / 10 );
		}

		var X = x * 5e6 / 3.0;
		var Y = y * 5e6 / 3.0;

		stars[i].position.set(
			X, Y,	Math.abs( stars[i].distance * DistanceScale )
			);

		// if ( stars[i-1] != undefined )			// trick to show double stars with gap
		// 	if ( stars[i-1].distance == stars[i].distance ){
		//
		// 		//if (debug) console.log(stars[i].name + " double star");
		// 		stars[i].position.set( stars[i].position.x + 2e6, stars[i].position.y + 1e6, stars[i].position.z + 1e6 );
		//
		// 	}

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

	//initStarsPointCloud();

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
			//'float alpha = ( fogFar - depth ) / ( fogFar - fogNear );',
			 var descending = ( maxFlareRange - distFromCamera ) / maxFlareRange;
			 flare.scale = 1 *	smoothstep( 0.0, 1.0, descending );
	}

}


function starsUpdate(){

	var i;
	for (i = 0; i < stars.length ; i++) {
  	if (stars[i] != undefined )
			stars[i].update();
	}

	//starsPointCloudUpdate();

}


var vertex, sprite, material, geometry, particles;

function initStarsPointCloud() {

	geometry = new THREE.Geometry();

		for ( var i = 0; i < stars.length; i++ ) {
			if (stars[i] == undefined) continue;
			vertex = stars[i].position.clone();
			geometry.vertices.push( new THREE.Vector3( vertex.x, vertex.y, vertex.z - 1e2 ) );
			geometry.colors.push( new THREE.Color( stars[i].color ) );

		}

		sprite = THREE.ImageUtils.loadTexture( "textures/lensflare/star2_alpha.png" );
		material = new THREE.PointCloudMaterial( {
      size: 1e7,
      sizeAttenuation: true,
      map: sprite,
      transparent: true,
      //blending: THREE.AdditiveBlending,
			depthWrite: false,
			//depthTest: true,
      vertexColors: true
    } );

		particles = new THREE.PointCloud( geometry, material );
		particles.geometry.colorsNeedUpdate = true;
		scene.add( particles );
}

function starsPointCloudUpdate(){

	var scale = distance / ( lyToKM(4.22) * global.DistanceScale * global.starsDistanceScale );
	particles.scale.set( scale, scale, 1 );
	cam.x = particles.scale.x * 100;


}

function init_renderer() {

}

function onWindowResize( event ) {
	//When rotated, resize the window and rendering space
	//var width = window.innerWidth, height = window.innerHeight;

	//camera.aspect = width / height;
	//camera.updateProjectionMatrix();

}
