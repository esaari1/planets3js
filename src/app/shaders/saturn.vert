uniform vec3 lightDir;
uniform vec3 ringsNormal;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vLightDir; // Light dir in view space.
varying vec3 vPosition; // Position in view space.
varying vec3 vRingsNormal;

void main() {
    vNormal = normalize(normal);
    vUv = uv;

    float rnDotL = dot(ringsNormal, lightDir);
    vRingsNormal = ringsNormal * sign(rnDotL);

    vec3 v = vec3(vec4(lightDir, 0.0));
    vLightDir = normalize(v);
    vPosition = vec3( vec4(position, 1.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
