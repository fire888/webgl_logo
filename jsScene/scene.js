
"use strict";

/**************************************************;
 * Params SCENE
 **************************************************/
 
const params = {
	
	/** 
	 *  If need effect HightStrehgthWaves   
	 *	change param on 'true' 
	 *  else change on  'false' 
	 */
	fixHightDelta: false,		
	
	/** If need LOGO in scene 'true' else 'false'*/
	isLogo: true,
	/** If need SPHERE in scene 'true' else 'false'*/	
	isSphere: true,
	/** If need WAVES on screen 'true' else 'false'*/		
	isWavesScreen: true,
	/** If need GLITCJ on screen 'true' else 'false'*/		
	isGlitchScreen: true,

	/** waves params */
	hightDelta: 5.0,
	lowAmount: 0.1, 
	strengthFix: false,	
	speedUp: 0.4,
	speedDown: 0.4,	
	oldFixHightDelta: false,
	/** glitch params */
	time: 900,	
	/** logo params */
	logoDisp: 0.0,
}


/**************************************************;
 * LOAD SCENE
 **************************************************/

const loadScene = new Promise( 
	function (resolve, reject){	
		window.onload = function(){
			resolve();
		};
	}).then(		
		function(){	
			return new Promise( 
				function(resolve, reject){
					loadFiles([
						'jsScene/shader_logo.vs',
						'jsScene/shader_logo.fs',
						'jsScene/shader_sphere.vs',	
						'jsScene/shader_sphere.fs',					
					], loadGeomShaders, ()=>{resolve(); } );
				});
		},
		function(){
			console.log('window no loading');			
		}	
	).then( 
		function(v){
			main( ()=>{} );
			if (params.isSphere){	
				sc.skyOctahedronShell = new SkyOctahedronShell();
				sc.scene.add(sc.skyOctahedronShell.obj);
			}	
			animate();						
			return ( new Promise(  
				function(resolve, reject){
					if (params.isLogo){
						sc.logo = new Logo( ()=>{ resolve(); } );
					}else{
						resolve();
					}		
				} ) 
			);
		},	
		function (){
			console.log('error load-shaders or init scene');
		}	
	).then( 
		function(v){
			if (params.isLogo){
				sc.scene.add(sc.logo.obj);
			}				
		},	
		function (){		
			console.log('error init spheres or init logo');
		}	
	);
		

/**************************************************;
 * Shaders
 **************************************************/
 
 const loadGeomShaders = ( err, files, on ) => {
    if (err) {
      throw err;
    }
	sc.shaders = files;
	on();	
}
 
/**
 	Noise Displace Shader
 	A nice multi-octave noise pixel displacement.
 	
	@author Felix Turner / www.airtight.cc / @felixturner
	
	Uses Ashima WebGL Noise: https://github.com/ashima/webgl-noise
 	
	The MIT License
 	Copyright (c) 2017 Felix Turner
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
	Software, and to permit persons to whom the Software is furnished to do so, subject
	to the following conditions:
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
	PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 
THREE.WavesShader = {	
	uniforms: {
		'tDiffuse': { type: 't', value: null },
		'time': { type: 'f', value: 1.0 },
		'speed': { type: 'f', value: 2.8 },
		'scale': { type: 'f', value: 2.0 },
		'amount': { type: 'f', value: 0.1 },
		"iMouseX" : { type: 'f', value: 1.0 },
		"iMouseY" : { type: 'f', value: 1.0 },	
	},
	vertexShader: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),
	fragmentShader: [
		'uniform sampler2D tDiffuse;',
		'uniform float time;',
		'uniform float scale;',
		'uniform float amount;',
		'uniform float speed;',
		"uniform float iMouseX;",
		"uniform float iMouseY;",
		"uniform float mouseAmount;",	
		'varying vec2 vUv;',

		// Start Ashima 2D Simplex Noise

		'vec3 mod289(vec3 x) {',
		'  return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',

		'vec2 mod289(vec2 x) {',
		'  return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',

		'vec3 permute(vec3 x) {',
		'  return mod289(((x*34.0)+1.0)*x);',
		'}',

		'float snoise(vec2 v)',
		'  {',
		'  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0',
		'                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)',
		'                     -0.577350269189626,  // -1.0 + 2.0 * C.x',
		'                      0.024390243902439); // 1.0 / 41.0',
		'  vec2 i  = floor(v + dot(v, C.yy) );',
		'  vec2 x0 = v -   i + dot(i, C.xx);',

		'  vec2 i1;',
		'  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
		'  vec4 x12 = x0.xyxy + C.xxzz;',
		' x12.xy -= i1;',

		'  i = mod289(i); // Avoid truncation effects in permutation',
		'  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))',
		'		+ i.x + vec3(0.0, i1.x, 1.0 ));',

		'  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
		'  m = m*m ;',
		'  m = m*m ;',

		'  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
		'  vec3 h = abs(x) - 0.5;',
		'  vec3 ox = floor(x + 0.5);',
		'  vec3 a0 = x - ox;',

		'  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );',

		'  vec3 g;',
		'  g.x  = a0.x  * x0.x  + h.x  * x0.y;',
		'  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
		'  return 130.0 * dot(m, g);',
		'}',
		// End Ashima 2D Simplex Noise
		
		'float getNoise(vec2 uv, float t){',

			//generate multi-octave noise based on uv position and time
			//move noise  over time

			//scale noise position relative to center
			'uv -= 0.5;',

			//octave 1
			'float scl = 4.0 * scale;',
			'float noise = snoise( vec2(uv.x * scl ,uv.y * scl - t * speed ));',

			//octave 2
			'scl = 16.0 * scale;',
			'noise += snoise( vec2(uv.x * scl + t* speed ,uv.y * scl )) * 0.2 ;',

			//octave 3
			'scl = 26.0 * scale;',
			'noise += snoise( vec2(uv.x * scl + t* speed ,uv.y * scl )) * 0.2 ;',

			'return noise;',
		'}',
		'void main() {',
			'vec2 uv = vUv;',
			//point mouse
			"vec2 tapPoint = vec2(iMouseX/uv.x*0.5,iMouseY/uv.y*0.5);",				
			//mask circle
			'float pct = 0.0;',
			'vec2 toCenter = tapPoint-uv;',			
			'pct = length(toCenter*100.0/amount);',	
            //render 			
			'vec2 noiseUv = vec2( uv.x + getNoise(uv, time * 24.0)/pct, uv.y + getNoise(uv, time * 24.0)/pct  );',
			'gl_FragColor = texture2D(tDiffuse,noiseUv);',	
		'}'
	].join('\n')
};


/**************************************************;
 * mouse move for waves
 **************************************************/
 
let windowW = document.documentElement.clientWidth;
let windowH = document.documentElement.clientHeight;
	  
let mouseX = 0, mouseY = 0; 
document.addEventListener("mousemove", (e) => {	 
	 mouseX = e.offsetX;
	 mouseY = e.offsetY;	 
});


/**************************************************;
 * animation screen Waves
 **************************************************/
 
const moreWaves = () => {
	if (sc.wavesShaderPass.uniforms.amount.value < params.lowAmount + params.hightDelta){
		sc.wavesShaderPass.uniforms.amount.value += params.speedUp;
		setTimeout(moreWaves, 60);
	}else{
		if (!params.fixHightDelta){
			setTimeout(lessWaves, 60);
		}	
	}		
}
	
const lessWaves = () => {
	if (sc.wavesShaderPass.uniforms.amount.value > params.lowAmount){
		sc.wavesShaderPass.uniforms.amount.value -= params.speedDown;
		if (!params.fixHightDelta){
			setTimeout(lessWaves, 100);
		}	
	}else{
		sc.wavesShaderPass.uniforms.amount.value = params.lowAmount;
	}		
}

if (params.isWavesScreen){
	window.onclick = () => {
		setTimeout(moreWaves, 200);
	}
}


/**************************************************;
 * animation screen Glitch
 **************************************************/

const startGlitch = () =>{
	if ( sc.glitchPass.uniforms[ "on" ].value == 0.0 ){
		sc.glitchPass.uniforms[ "on" ].value = 1.0;
		setTimeout( stopGlitch, params.time ); 
	}	
}

const stopGlitch = () => {
	sc.glitchPass.uniforms[ "on" ].value = 0.0;
}
	
if (params.isGlitchScreen){	
	document.addEventListener("mousewheel", startGlitch, false);
	document.addEventListener("DOMMouseScroll", startGlitch, false);
}


/**************************************************;
 * LOGO
 **************************************************/
 
const MathEx = {
  degrees: function(radian) {
    return radian / Math.PI * 180;
  },
  radians: function(degree) {
    return degree * Math.PI / 180;
  },
  clamp: function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  mix: function(x1, x2, a) {
    return x1 * (1 - a) + x2 * a;
  },
  polar: function(radian1, radian2, radius) {
    return [
      Math.cos(radian1) * Math.cos(radian2) * radius,
      Math.sin(radian1) * radius,
      Math.cos(radian1) * Math.sin(radian2) * radius,
    ];
  }
};

const debounce = (callback, duration) => {
  var timer;
  return function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, duration);
  };
};

const computeFaceNormal = (v0, v1, v2) => {
  const n = [];
  const v1a = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
  const v2a = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
  n[0] = v1a[1] * v2a[2] - v1a[2] * v2a[1];
  n[1] = v1a[2] * v2a[0] - v1a[0] * v2a[2];
  n[2] = v1a[0] * v2a[1] - v1a[1] * v2a[0];
  const l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2], 2);
  for (var i = 0; i < n.length; i++) {
    n[i] = n[i] / l;
  }
  return n;
};
 
class Logo {
	  
  constructor( on ) {
  
	this.loadOn = on;
	
    this.uniforms = {
      time: {  
        type: 'f',
        value: 0
      },
	  noiseAmount: {
		type: 'float',
		value: 0.02	
	  },	  
    };	

	this.vectorMouse = new THREE.Vector3( 0, 0, 150 );
	this.obj = null;
	this.loadObj();
  }
   
  loadObj(){ 
	this.loader = new THREE.OBJLoader( );
	this.loader.load( 'jsScene/logo.obj', function ( object ) {	
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh){
				if( typeof child.geometry.attributes.position.array == "object" ){ 
					const geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);	
					const positions = child.geometry.attributes.position.array;
					const faceNormalsBase = [];
					const centersBase = [];
					const delaysBase = [];
					for (var i = 0; i < positions.length; i += 9) {
						const n = computeFaceNormal(
							[positions[i + 0], positions[i + 1], positions[i + 2]],
							[positions[i + 3], positions[i + 4], positions[i + 5]],
							[positions[i + 6], positions[i + 7], positions[i + 8]]
						);
						faceNormalsBase.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
						const c = [
							(positions[i + 0] + positions[i + 3] + positions[i + 6]) / 3,
							(positions[i + 1] + positions[i + 4] + positions[i + 7]) / 3,
							(positions[i + 2] + positions[i + 5] + positions[i + 8]) / 3
						];
						const delay = Math.random() * 0.5;
						centersBase.push(c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2]);
						delaysBase.push(delay, delay, delay);
					}
							
					const faceNormals = new Float32Array(faceNormalsBase);
					const centers = new Float32Array(centersBase);
					const delays = new Float32Array(delaysBase);
					child.geometry.addAttribute('faceNormal', new THREE.BufferAttribute(faceNormals, 3));
					child.geometry.addAttribute('center', new THREE.BufferAttribute(centers, 3));
					child.geometry.addAttribute('delay', new THREE.BufferAttribute(delays, 1));	
		
					sc.logo.obj = new THREE.Mesh(
						child.geometry,
						new THREE.RawShaderMaterial({
							uniforms: sc.logo.uniforms,
							vertexShader: sc.shaders["jsScene/shader_logo.vs"],
							fragmentShader: sc.shaders["jsScene/shader_logo.fs"],
							flatShading: true,
							transparent: true,
							side: THREE.DoubleSide
						})
					)
					sc.logo.obj.scale.set(0.45, 0.45, 0.45);
					setTimeout( sc.logo.removeDoubleSide, 8000);
							
					sc.logo.loadOn();					
				}		
			}		
		});		
	});  
  }
	
  render(time) {
	this.uniforms.time.value += time;
    this.vectorMouse.x = (mouseX-windowW/2)/15;
    this.vectorMouse.y = (windowH/2-mouseY)/15;
	if (Math.abs(this.vectorMouse.x)< 7 && Math.abs(this.vectorMouse.y)<7){
		if ( this.uniforms.noiseAmount.value < 50.0 * params.logoDisp ){
			this.uniforms.noiseAmount.value += 2.0
		}		
	}else{
		if ( this.uniforms.noiseAmount.value > 2.0 * params.logoDisp )
		this.uniforms.noiseAmount.value -= 1.0;			
	}	
	this.obj.lookAt(this.vectorMouse);		
  }
  
  removeDoubleSide(){
	sc.logo.obj.material.side = THREE.FrontSide;
  }	  
}


/**************************************************;
 * SPHERE
 **************************************************/

class SkyOctahedronShell {
  constructor() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      },	  
    };
    this.obj = this.createObj();
	this.obj.position.z = 30;
	
  }
  
  createObj() {
    const geometry = new THREE.OctahedronBufferGeometry(120, 5);
    return new THREE.Mesh(
      geometry,
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: sc.shaders['jsScene/shader_sphere.vs'],
        fragmentShader: sc.shaders['jsScene/shader_sphere.fs'],
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    )
  }
  
  render(time) {
    this.uniforms.time.value += time;
  }
}


/**************************************************;
 * SCENE
 **************************************************/
 
const sc = { 
	shaders: false,
	scene: false,
	renderer: false,
	camera: false,
	
	clock: false,
	wavesShaderPass: false,
	glitchPass: false,
	composer: false,
	
	logo: false,
	loader: false,
	skyOctahedronShell: false	
}; 
 
function main( on ){ 
	
	const canvas = document.getElementById('canvas-webgl');
	sc.renderer = new THREE.WebGLRenderer({ canvas: canvas} );
	sc.renderer.setPixelRatio( window.devicePixelRatio );
	sc.renderer.setSize(window.innerWidth, window.innerHeight);
	sc.renderer.gammaInput = true;
	sc.renderer.gammaOutput = true;

    sc.scene = new THREE.Scene();
	
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;
	sc.camera = new THREE.PerspectiveCamera( 35,
			window.innerWidth/window.innerHeight, 
            0.1, 
            1000 
        );

	sc.camera.position.set( 0, 5, 350 );
	sc.camera.lookAt( sc.scene.position );
	        
	sc.composer = new THREE.EffectComposer( sc.renderer );	
	
	if (params.isWavesScreen){
		sc.wavesShaderPass = new THREE.ShaderPass(THREE.WavesShader);
		sc.composer.addPass( sc.wavesShaderPass );	
	}	
	

	sc.glitchPass = new THREE.GlitchPass(35, 195, 48, 120, 200, 200 );	
	
	sc.glitchPass.renderToScreen = true;
	if (params.isGlitchScreen){		
		sc.glitchPass.goWild = true;
	}	
	sc.composer.addPass( sc.glitchPass );
	sc.composer.addPass( new THREE.RenderPass( sc.scene, sc.camera ) );

	sc.clock = new THREE.Clock();
	sc.loader = new THREE.ObjectLoader();
	
	on();	
}


/**************************************************;
 * animation scene
 **************************************************/
  
function animate() {

	sc.renderer.render( sc.scene, sc.camera );		
	const time = sc.clock.getDelta();		
	if (sc.logo){
		if (sc.logo.obj){
			sc.logo.render(time);
		}		
	}		
	if (params.isWavesScreen){
		sc.wavesShaderPass.uniforms.time.value += time*0.05;		
		sc.wavesShaderPass.uniforms.iMouseX.value = (mouseX)/window.innerWidth;
		sc.wavesShaderPass.uniforms.iMouseY.value = 1-(mouseY)/window.innerHeight;

		if (params.fixHightDelta != params.oldFixHightDelta){
			if (params.fixHightDelta){
				moreWaves();
			}else{
				lessWaves();			
			}
			params.oldFixHightDelta = params.fixHightDelta;
		}
	}				
	if ( sc.skyOctahedronShell ){
		sc.skyOctahedronShell.render(time);
	}		
	if (params.isWavesScreen || params.isGlitchScreen ){
		sc.composer.render();
	}

	requestAnimationFrame( animate );	
}


/**************************************************;
 * resize scene
 **************************************************/
  
function handleWindowResize() {
	
	windowW = window.innerWidth;
	windowH = window.innerHeight;	
	
	let HEIGHT = window.innerHeight;
	let WIDTH = window.innerWidth;
	
	sc.renderer.setSize(WIDTH, HEIGHT);
	sc.camera.aspect = WIDTH / HEIGHT;
	sc.camera.updateProjectionMatrix();
}

window.addEventListener('resize', handleWindowResize, false);

