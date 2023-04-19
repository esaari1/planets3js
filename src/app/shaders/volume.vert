varying vec3 vDir;

void main() {
    vDir = normalize(position - cameraPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
