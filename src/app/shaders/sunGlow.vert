varying vec3 viewVec;
varying vec3 tnorm;

void main() {
   tnorm = normalize(normalMatrix * normal);
   vec3 ecPosition = vec3(modelViewMatrix * vec4(position, 1.0));
   viewVec = normalize(-ecPosition);

   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
