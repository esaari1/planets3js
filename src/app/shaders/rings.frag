uniform sampler2D tDiffuse;
uniform vec3 lightDir;
uniform float radius2;  // radius of sphere squared

varying vec2 vUv;
varying vec3 vPosition; // Vector from position on disc to center of sphere (0, 0, 0)

float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

void main() {

    float adjacent = dot(normalize(lightDir), vPosition);
    float shadow = 1.0;

    if (adjacent >= 0.0) {
        float hypotenus = length(vPosition);
        float opposite = pow(hypotenus, 2.0) - pow(adjacent, 2.0);
        shadow = when_gt(opposite, radius2);
    }

    gl_FragColor = texture2D(tDiffuse, vUv) * shadow;
}
