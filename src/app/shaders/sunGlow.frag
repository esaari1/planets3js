varying vec3 viewVec;
varying vec3 tnorm;

uniform vec3 color;

vec3 brightnessToColor(float b) {
   b *= 0.25;
   return (vec3(b, b*b, b*b*b*b) / 0.25) * 0.8;
}

void main() {
   float alpha = abs(dot(viewVec, tnorm));
   alpha = pow(alpha, 2.0);

   float br = 1.0 + alpha * 0.83;
   gl_FragColor.rgb = brightnessToColor(br) * br;
   gl_FragColor.a = alpha;

   //alpha = max(0.0, alpha / 2.0);
   //gl_FragColor = vec4(alpha, alpha, alpha, 1.0);
}
