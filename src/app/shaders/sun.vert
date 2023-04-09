varying vec3 viewVec;
varying vec3 tnorm;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
   tnorm = normalize(normalMatrix * normal);
   vNormal = normal;
   vec3 ecPosition = vec3(modelViewMatrix * vec4(position, 1.0));
   viewVec = normalize(-ecPosition);
   vPosition = position;

   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
