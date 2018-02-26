 precision highp float;

  uniform float time; 
  uniform vec2 iResolution;  

  varying vec3 vPosition;
  varying float vOpacity;
  varying vec2 vUv;
		
		
vec3 hsv(float h,float s,float v) {
	return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}
float circle(vec2 p, float r) {
	return smoothstep(0.1, 0.0, abs(length(p)-r)); // try changing the 0.1 to 0.3
}
float r3 = sqrt(3.0);

void main() {
	vec2 uv;// =  - 1.0 + 2.0 * vPosition.xy;
	uv.x = - 1.0 + 2.0 * (vPosition.x*7.0+vPosition.z*10.0);	
	uv.y = - 1.0 + 2.0 * (vPosition.y*7.0-vPosition.z*10.0);	
	float r = smoothstep(-0.2, 0.7, sin(time*1.57-length(uv)*0.1))+1.0;
	vec2 rep = vec2(4.0,r3*4.0);
	vec2 p1 = mod(uv, rep)-rep*0.5;
	vec2 p2 = mod(uv+vec2(2.0,0.0), rep)-rep*0.5;
	vec2 p3 = mod(uv+vec2(1.0,r3), rep)-rep*0.5;
	vec2 p4 = mod(uv+vec2(3.0,r3), rep)-rep*0.5;
	vec2 p5 = mod(uv+vec2(0.0,r3*2.0), rep)-rep*0.5;
	vec2 p6 = mod(uv+vec2(2.0,r3*2.0), rep)-rep*0.5;
	vec2 p7 = mod(uv+vec2(1.0,r3*3.0), rep)-rep*0.5;
	vec2 p8 = mod(uv+vec2(3.0,r3*3.0), rep)-rep*0.5;
	
	float c = 0.0;
	c += circle(p1, r);
	c += circle(p2, r);
	c += circle(p3, r);
	c += circle(p4, r);
	c += circle(p5, r);
	c += circle(p6, r);
	c += circle(p7, r);
	c += circle(p8 , r);
	vec3 rgb = vec3(hsv(r+20.7, 1.0, c));
	gl_FragColor = vec4( -0.2+(rgb.x)*0.2, rgb.z*0.2, rgb.z*0.3, -0.4+rgb.z*rgb.x);
}
  		

		

	
	