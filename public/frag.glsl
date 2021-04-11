#ifdef GL_ES
precision mediump float;
#endif
uniform float u_time;
uniform float u_deltaTime;
varying vec2 v_texcoord;
void main(){
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}