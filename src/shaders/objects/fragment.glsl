uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;

#include ../includes/perlinClassic3D.glsl


void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    //pixel noise
    vec3 quantizedPosition = floor(vPosition * 15.0) / 2.0;
    float pixelNoiseValue = perlinClassic3D(quantizedPosition * 0.5 + uTime);
    vec3 noiseColor = mix(vec3(1.0, 0.3, 0.5), vec3(0.1, 0.0, 0.2), step(0.0, pixelNoiseValue));
    
    // Fresnel: bright at edges, dark at center
    float fresnel = 1.0 - abs(dot(viewDir, normal));
    fresnel = pow(fresnel, 2.0);  // Adjust power for sharper/softer falloff
    
    // Apply to colors
    vec3 coreColor = vec3(0.1, 0.0, 0.2);   // center color
    vec3 edgeColor = vec3(1.0, 0.3, 0.5);   // edge glow
    vec3 fresnelColor = mix(coreColor, edgeColor, fresnel);

    float halfMask = step(0.0, vPosition.x); //0 on left, 1 on right

    vec3 color = mix(fresnelColor, noiseColor, halfMask );

    
    gl_FragColor = vec4(color, 1.0);
}