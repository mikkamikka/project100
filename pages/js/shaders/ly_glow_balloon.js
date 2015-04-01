/*********** vertex shader ******/

uniform vec3 Position;
uniform vec4 Normal;

uniform float Inflate;

// transform object normals, tangents, & binormals to world-space:
uniform float4x4 WorldITXf; // our four standard "untweakable" xforms
// transform object vertices to world-space:
uniform float4x4 WorldXf;
// provide tranform from "view" or "eye" coords back to world-space:
uniform float4x4 ViewIXf;
//worldviewproj_matrix
uniform float4x4 WvpXf;

varying vec3 WorldNormal;
varying vec3 WorldView;

void main() {

    //gloVertOut OUT = (gloVertOut)0;
    WorldNormal = mul( WorldITXf, Normal ).xyz;
    vec4 Po = vec4( Position.xyz, 1.0 );
    Po += ( Inflate * normalize( vec4( Normal.xyz, 0.0 ) ) ); // the balloon effect
    vec4 Pw = mul( WorldXf, Po );
    WorldView = normalize( vec3( ViewIXf[0].w, ViewIXf[1].w, ViewIXf[2].w ) - Pw.xyz );
    gl_Position = mul( WvpXf, Po ); // old HPosition

}


/********* pixel shaders ********/

uniform vec3 GlowColor;
uniform float GlowExpon;

varying vec3 WorldNormal;
varying vec3 WorldView;

void main() {

  vec3 Nn = normalize( WorldNormal );
  vec3 Vn = normalize( WorldView );  ///cameraPosition

  float edge = 1.0 - dot( Nn, Vn );

  edge = pow( edge, GlowExpon );

  vec3 result = edge * GlowColor.rgb;

  gl_FragColor = vec4( result, edge);

}
'uniform mat4 modelMatrix;',
'uniform mat4 modelViewMatrix;',  // HLSL WORLDVIEW   GLSL gl_ModelViewMatrix
'uniform mat4 projectionMatrix;',
'uniform mat4 viewMatrix;',
'uniform mat3 normalMatrix;',

'uniform vec3 cameraPosition;',

'attribute vec3 position;',
'attribute vec3 normal;',
'attribute vec2 uv;',
'attribute vec2 uv2;',
