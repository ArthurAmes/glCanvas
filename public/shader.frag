precision highp float;

uniform float u_red;

void main () {
    gl_FragColor = vec4(u_red, 0.0, 0.0, 1.0);
}