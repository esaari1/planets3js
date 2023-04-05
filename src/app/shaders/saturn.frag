uniform sampler2D tDiffuse;
uniform sampler2D ringsTexture;
uniform vec2 ringsRadius;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vLightDir; // Light dir in view space.
varying vec3 vPosition; // Position in view space.
varying vec3 vRingsNormal;

void main() {
    vec3 n = normalize(vNormal);
    vec3 light = normalize(vLightDir);
    float NdotL = max(dot(n, light), 0.0);
    vec3 rn = normalize(vRingsNormal);

    float alpha = 1.0;

    if (NdotL > 0.0) {
        float denom = dot(rn, light);
        if (denom > 0.0) {
            vec3 p0l0 = vec3(0.0, 0.0, 0.0) - vPosition;
            float t = dot(p0l0, rn) / denom;
            if (t >= 0.0) {
                vec3 p = vPosition + light * t;
                vec3 v = p - vec3(0.0, 0.0, 0.0);
                float d2 = length(v);
                if (d2 < ringsRadius.y && d2 > ringsRadius.x) {
                    float s = (d2 - ringsRadius.x) / (ringsRadius.y - ringsRadius.x);
                    alpha = texture2D(ringsTexture, vec2(s, 0.0)).a;
                }
            }
        }
    }

    gl_FragColor = texture2D(tDiffuse, vUv) * NdotL;
    gl_FragColor.a = alpha;
}
