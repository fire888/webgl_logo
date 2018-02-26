  attribute vec3 position;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float time;

  varying vec3 vPosition;
  varying float vOpacity;
  varying vec2 vUv;

  const float duration = 4.0;
  const float delay = 3.0;

  float ease(float t) {
    return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
  }

  mat4 computeTranslateMat(vec3 v) {
    return mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      v.x, v.y, v.z, 1.0
    );
  }
  mat4 computeScaleMat(vec3 scale) {
    return mat4(
      scale.x, 0.0, 0.0, 0.0,
      0.0, scale.y, 0.0, 0.0,
      0.0, 0.0, scale.z, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }
  mat4 computeRotateMatX(float radian) {
    return mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, cos(radian), -sin(radian), 0.0,
      0.0, sin(radian), cos(radian), 0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }
  mat4 computeRotateMatY(float radian) {
    return mat4(
      cos(radian), 0.0, sin(radian), 0.0,
      0.0, 1.0, 0.0, 0.0,
      -sin(radian), 0.0, cos(radian), 0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }
  mat4 computeRotateMatZ(float radian) {
    return mat4(
      cos(radian), -sin(radian), 0.0, 0.0,
      sin(radian), cos(radian), 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }
  mat4 computeRotateMat(float radX, float radY, float radZ) {
    return computeRotateMatX(radX) * computeRotateMatY(radY) * computeRotateMatZ(radZ);
  }

  void main() {
    float now = clamp((time - delay) / duration, 0.0, 1.0);
    mat4 translateMat = computeTranslateMat(vec3(0.0, sin(time) * 10.0, 0.0));
    mat4 scaleMat = computeScaleMat(vec3(ease(now) * 0.6 + 0.4 + sin(time * 2.0) * 0.04));
    mat4 rotateMat = computeRotateMat(radians(45.0), radians(time * 2.0), radians(-time * 2.0));
    vec4 updatePosition = translateMat * rotateMat * scaleMat * vec4(position, 1.0);
    vPosition = normalize(position);
    vOpacity = normalize(updatePosition).z;
    gl_Position = projectionMatrix * modelViewMatrix * updatePosition;
  }