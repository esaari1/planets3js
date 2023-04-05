varying vec2 vUv;
varying vec3 vPosition; // Vector from position on disc to center of sphere (0, 0, 0)

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vPosition = vec3(modelMatrix * vec4(-position, 1.0));
}
