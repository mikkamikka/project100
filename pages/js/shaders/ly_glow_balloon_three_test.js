/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {
		'Inflate': { type: 'f', value: null }

	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"void main() {",

			"gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

		"}"

	].join("\n")

};


				'uniform mat4 modelMatrix;',
				'uniform mat4 modelViewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 viewMatrix;',
				'uniform mat3 normalMatrix;',

				'uniform vec3 cameraPosition;',

				'attribute vec3 position;',
				'attribute vec3 normal;',
				'attribute vec2 uv;',
				'attribute vec2 uv2;',
