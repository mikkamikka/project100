
var starShader = {
      uniforms: {
        'texture': { type: 't', value: null },
				'fogColor' : { type: "c", value: fog.color },
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
					'//gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );',
					'//gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',


					'float alpha = ( fogFar - depth ) / ( fogFar - fogNear );',

					'//gl_FragColor = mix( gl_FragColor, vec4( gl_FragColor.xyz, gl_FragColor.w ), fogFactor );',

					'//if ( alpha > 0.5 ) alpha = 1.0 - alpha;',
					'alpha = smoothstep( 0.0, 0.5, alpha ) * ( 1.0 - smoothstep( 0.8, 1.0, alpha ));',

					'gl_FragColor.w = gl_FragColor.w * alpha;',
					'gl_FragColor = vec4( gl_FragColor.xyz, gl_FragColor.w );',
					'gl_FragColor = mix( vec4( fogColor, gl_FragColor.w ), gl_FragColor , fogFactor );',

        '}'
      ].join('\n')
}


function StarFX(){
	this.mesh = null;
	this.distFromCamera =  0;
	this.isInCameraRange = false;
	this.rotationSpeed = new THREE.Vector3();
	this.isInView = false;

}
