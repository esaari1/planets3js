// Atmospheric scattering fragment shader
// Author: Sean O'Neil
// Copyright (c) 2004 Sean O'Neil
// Ported for use with three.js/WebGL by James Baicoianu

uniform float fNightScale;
uniform sampler2D tDiffuse;
uniform sampler2D tDiffuseNight;
uniform sampler2D tClouds;
uniform sampler2D tNormalMap;
uniform sampler2D tSpecularMap;
uniform vec3 v3LightPosition;

varying vec3 c0;
varying vec3 c1;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vTangent;
varying float specular;

void main (void) {
    vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
    vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;
    vec4 cloudsTex = texture2D( tClouds, vUv );
    float specularTex = texture2D( tSpecularMap, vUv ).x;

    vec3 normalTex = texture2D( tNormalMap, vUv ).xyz;
    normalTex = normalTex * 2.0 - 1.0;
    normalTex = normalize(normalTex);
    normalTex = normalTex * vec3(3.0, -3.0, 1.0);

    vec3 binormal = normalize(cross(vNormal, vTangent));
    mat3 TBN = transpose(mat3(vTangent, normalize(binormal), normalize(vNormal)));

    float highlight = specularTex * specular;

    vec3 day = ((diffuseTex + highlight) * c0 * cloudsTex.a) * (1.0 - cloudsTex.r) + cloudsTex.r * c0;
    vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);

    vec3 LightDir = TBN * v3LightPosition;
    vec3 litColor = day * max(dot(normalTex, normalize(LightDir)), 0.0);

    gl_FragColor = vec4(c1, 1.0) + vec4(litColor + night, 1.0);
}
