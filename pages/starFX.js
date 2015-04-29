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


var maxStarFXRange = global.DistanceScale * LY * global.starsDistanceScale * 2;

starShader.uniforms['texture'].value = THREE.ImageUtils.loadTexture("textures/lensflare/star2.png");
//starShader.uniforms['texture_color'].value = THREE.ImageUtils.loadTexture("textures/lensflare/lensflare0.png");
//starShader.uniforms['color_shift'].value = color_shift;

var noise_tex = THREE.ImageUtils.loadTexture("textures/asteroids/noise_displacement.jpg");
noise_tex.wrapS = THREE.RepeatWrapping;
noise_tex.wrapT = THREE.RepeatWrapping;
starShader.uniforms['noise_texture'].value = noise_tex;
starShader.uniforms.resolution.value.x = window.innerWidth;
starShader.uniforms.resolution.value.y = window.innerHeight;

var starFXmaterial = new THREE.ShaderMaterial({

  uniforms: starShader.uniforms,
  vertexShader: starShader.vertexShader,
  fragmentShader: starShader.fragmentShader,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite	: false

});


function StarFX(){
	this.mesh = null;
	this.distFromCamera =  0;
	this.isInCameraRange = false;
	this.rotationSpeed = 0;
	this.isInView = false;

}

StarFX.prototype.init = function( pos,  size, color_shift ){

   var geometry = new THREE.PlaneBufferGeometry( size, size );
   this.mesh = new THREE.Mesh( geometry, starFXmaterial );
   this.mesh.scale.set( 1.0, 1.0, 1.0 );
   this.mesh.position.set( pos.x, pos.y, pos.z );
   //scene.add( this.mesh );
}

StarFX.prototype.update = function(){

  //this.distFromCamera = camera.position.distanceTo( this.position );
	this.distFromCamera = camera.position.z - this.mesh.position.z;

	//if ( this.distFromCamera > maxFlareRange ){
	if ( this.distFromCamera > 0 && this.distFromCamera < maxStarFXRange ){
		if ( this.isInView == false ) {

			scene.add( this.mesh );
			this.isInView = true;
			//if (debug) console.log("StarFX added");
		}
	}
	else {
		if ( this.isInView == true ) {
			scene.remove( this.mesh );

			this.isInView = false;
			//if (debug) console.log("StarFX removed");
		}
	}


  if ( this.isInView ){

    starShader.uniforms.time.value = clock.getElapsedTime();

    //var distFromCamera = camera.position.distanceTo( object.position );
    //this.mesh.scale = 1 / Math.pow( distance, 1/3 ) * 10;
    var descending = ( maxStarFXRange - this.distFromCamera ) / maxStarFXRange;
    this.mesh.scale.set( 1 *	smoothstep( 0.0, 1.0, descending ), 1 *	smoothstep( 0.0, 1.0, descending ), 1.0 );
    //console.log(this.mesh.scale);

  }


}



// function starFXupdate( delta ){
//
//   var newTime = Date.now();
//   starShader.uniforms.time.value = clock.getElapsedTime();
//
//   //var distFromCamera = camera.position.distanceTo( object.position );
//   FXmesh.scale.set = 1 / Math.pow( distance, 1/3 ) * 10;
//
// }
