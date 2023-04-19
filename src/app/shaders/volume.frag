uniform vec3 bgColor;
uniform vec3 scatter;
uniform float sigma_a;
uniform float sigma_s;
uniform float density;
uniform float radius2;
uniform vec3 lightDir;
uniform float pi;

varying vec3 vDir;

float phase(float g, float cos_theta) {
    float denom = 1.0 + g * g - 2.0 * g * cos_theta;
    return 1.0 / (4.0 * pi) * (1.0 - g * g) / (denom * sqrt(denom));
}

void main() {
    vec3 L = -cameraPosition; // center - origin
    float tca = dot(L, vDir);

    float d2 = dot(L, L) - tca * tca;
    if(d2 > radius2) {
        gl_FragColor = vec4(bgColor, 1.0);
        return;
    }

    float thc = sqrt(radius2 - d2);
    float t0 = tca - thc;
    float t1 = tca + thc;

    float stepSize = 0.2;
    float numSteps = ceil((t1 - t0) / stepSize);
    stepSize = (t1 - t0) / numSteps;

    float transparency = 1.0;
    vec3 result = vec3(0.0, 0.0, 0.0);
    float g = 0.8;

    for(float n = 0.0; n < numSteps; n++) {
        float t = t0 + stepSize * (n + 0.5);
        vec3 sample_pos = cameraPosition + t * vDir;

        float sigma_t = sigma_a + sigma_s;

        // current sample transparency
        float sample_attenuation = exp(-stepSize * density * sigma_t);

        // attenuate volume object transparency by current sample transmission value
        transparency *= sample_attenuation;

        // In-Scattering. Find the distance traveled by light through
        // the volume to our sample point. Then apply Beer's law.
        float b = 2.0 * dot(sample_pos, lightDir);
        float c = dot(sample_pos, sample_pos) - radius2;
        float disc = max(0.0, b * b - 4.0 * c);

        float q = -0.5 * (b + sign(b) * sqrt(disc));
        float isect_vol = max(q, c / q);

        float cos_theta = dot(vDir, lightDir);
        float light_attenuation = exp(-density * isect_vol * sigma_t);
        // attenuate in-scattering contrib. by the transmission of all samples accumulated so far
        result += transparency * scatter * light_attenuation * sigma_s * phase(g, cos_theta) * density * stepSize;

        if (transparency < 1.0e-13) {
            break;
        }
    }

    gl_FragColor = vec4(bgColor * transparency + result, 1.0);

    // float distance = t1 - t0;
    // float transmission = exp(-distance * sigma_a);

    // gl_FragColor = vec4(bgColor * transmission + scatter * (1.0 - transmission), 1.0);
}
