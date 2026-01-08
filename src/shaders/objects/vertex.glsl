uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition; 



void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    vec3 pos = position;
    
    // Displace along normal direction for 3D geometries
    vec3 transformedNormal = normalize(normal);
    float wave = sin(uv.x * 6.28318 * 3.0 + uTime);
    float smoothWave = smoothstep(-1.0, 1.0, wave) * 2.0 - 1.0;
    pos += transformedNormal * smoothWave * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;  
    
    gl_Position = projectionMatrix * mvPosition;
}