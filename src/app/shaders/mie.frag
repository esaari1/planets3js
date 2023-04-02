// Atmospheric scattering fragment shader
// Author: Sean O'Neil
// Copyright (c) 2004 Sean O'Neil
// Ported for use with three.js/WebGL by James Baicoianu

uniform sampler2D tDiffuse;
uniform sampler2D tNormalMap;
uniform vec3 v3LightPosition;

varying vec3 c0;
varying vec3 c1;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vTangent;

void main (void) {
    vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;

    vec3 normalTex = texture2D( tNormalMap, vUv ).xyz;
    normalTex = normalTex * 2.0 - 1.0;
    normalTex = normalize(normalTex);
    normalTex = normalTex * vec3(3.0, -3.0, 1.0);

    vec3 binormal = normalize(cross(vNormal, vTangent));
    mat3 TBN = transpose(mat3(vTangent, normalize(binormal), normalize(vNormal)));

    vec3 day = diffuseTex * c0;

    vec3 LightDir = TBN * v3LightPosition;
    vec3 litColor = day * max(dot(normalTex, normalize(LightDir)), 0.0);

    gl_FragColor = vec4(c1, 1.0) + vec4(litColor, 1.0);
}
