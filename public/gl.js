const defaultVertex = `
#ifdef GL_ES
precision mediump float;
#endif
attribute vec2 a_position;
attribute vec2 a_texcoord;
varying vec2 v_texcoord;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
}
`;

const defaultFragment = `
#ifdef GL_ES
precision mediump float;
#endif
uniform float u_time;
uniform float u_deltaTime;
varying vec2 v_texcoord;
void main(){
    gl_FragColor = vec4(sin(abs(u_time)), sin(abs(u_time+1.0471)), sin(abs(u_time+2.0943)), 1.0);
}
`;

class Program {
    constructor(gl, vert, frag) {
        this.gl = gl;
        this.vert = this.loadShader(gl.VERTEX_SHADER, vert);
        this.frag = this.loadShader(gl.FRAGMENT_SHADER, frag);
        this.program = this.gl.createProgram();

        this.attachAndLink();
    }

    loadNew = (type, src) => {
        this.vert = type === this.gl.VERTEX_SHADER ? this.loadShader(gl.VERTEX_SHADER, src) : this.vert;
        this.frag = type === this.gl.FRAGMENT_SHADER ? this.loadShader(gl.FRAGMENT_SHADER, src) : this.frag;

        this.attachAndLink();
    }

    attachAndLink = () => {
        this.gl.attachShader(this.program, this.vert);
        this.gl.attachShader(this.program, this.frag);

        this.gl.linkProgram(this.program);

        if(!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            alert('Failure to link shader program: ' + this.gl.getProgramInfoLog(this.program));
        }
    }

    loadShader = (type, src) => {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occured compiling a shader: ' + this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    bind = () => {
        this.gl.useProgram(this.program);
    }
}

class GlCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = undefined;

        this.textures = {};
        this.buffers = {};
        this.uniforms = {};
        this.vbo = {};
        this.loadTime = performance.now();
        this.prevTime = performance.now();

        this.vertex = defaultVertex;
        this.fragment = defaultFragment;
    
        this.gl = this.getGlContext(canvas);

        this.program = new Program(this.gl, this.vertex, this.fragment);

        let texCoordLoc = this.gl.getAttribLocation(this.program.program, 'a_texcoord');
        this.vbo.texCoords = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo.texCoords);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), this.gl.STATIC_DRAW); // draw fullscreen quad
        this.gl.enableVertexAttribArray(texCoordLoc);
        this.gl.vertexAttribPointer(texCoordLoc, 2, this.gl.FLOAT, false, 0, 0);

        let vertsLoc = this.gl.getAttribLocation(this.program.program, 'a_position');
        this.vbo.verts = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo.verts);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), this.gl.STATIC_DRAW); // assign verts proper coords
        this.gl.enableVertexAttribArray(vertsLoc);
        this.gl.vertexAttribPointer(vertsLoc, 2, this.gl.FLOAT, false, 0, 0);

        this.uniforms['u_time'] = this.gl.getUniformLocation(this.program.program, 'u_time');
        this.uniforms['u_deltaTime'] = this.gl.getUniformLocation(this.program.program, 'u_deltaTime');

        this.renderLoop();
    }

    getGlContext(canvas) {
        const gl = canvas.getContext("webgl2");
        if (gl === null) {
            console.log("Fell back to webgl1.")
            gl = canvas.getContext("webgl")
        }
        
        return gl;
    }
    
    renderLoop = () => {
        this.render();

        window.requestAnimationFrame(this.renderLoop);
    }

    render = () => {
        const now = performance.now();
        const delta = (now - this.prevTime)/1000.0;
        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;

        this.gl.viewport(0, 0, width, height);

        this.program.bind();

        this.gl.uniform1f(this.uniforms['u_time'], (now - this.loadTime)/1000.0);
        this.gl.uniform1f(this.uniforms['u_deltaTime'], delta);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.prevTime = performance.now();
    }
}

const main = () => {
    const canvas = document.getElementById("glCanvas");

    const glCanvas = new GlCanvas(canvas);
}

window.onload = main;