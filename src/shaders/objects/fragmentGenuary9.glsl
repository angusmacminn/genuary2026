uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

// inverse lerp / mix function
float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

// remap values function
float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}
// hash function
vec3 hash( vec3 p ) 
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
            dot(p,vec3(269.5,183.3,246.1)),
            dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

// basic noise function
float noise( in vec3 p )
{
  vec3 i = floor( p );
  vec3 f = fract( p );
	
	vec3 u = f*f*(3.0-2.0*f);

  return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                        dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                   mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                        dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
              mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                        dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                   mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                        dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}

// cellular noise function
float cellular(vec3 coords) {
  vec2 gridBasePosition = floor(coords.xy);
  vec2 gridCoordOffset = fract(coords.xy);

  float closest = 1.0;
  float secondClosest = 1.0;
  for (float y = -1.0; y <= 1.0; y += 1.0) {
    for (float x = -1.0; x <= 1.0; x += 1.0) {
      vec2 neighbourCellPosition = vec2(x, y);
      vec2 cellWorldPosition = gridBasePosition + neighbourCellPosition;
      vec2 cellOffset = vec2(
        noise(vec3(cellWorldPosition, coords.z) + vec3(243.432, 324.235, 0.0)),
        noise(vec3(cellWorldPosition, coords.z))
      );

      float distToNeighbour = length(
          neighbourCellPosition + cellOffset - gridCoordOffset);
      // closest = min(closest, distToNeighbour);

      if (distToNeighbour < closest) {
        secondClosest = closest;
        closest = distToNeighbour;
      } else if (distToNeighbour < secondClosest) {
        secondClosest = distToNeighbour;
      }
    }
  }

  return secondClosest - closest;
}


void main() {

    // colors
    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 green = vec3(0.0, 1.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    
    
    vec3 coords = vec3(vUv * 10.0, uTime * 0.2);
    vec2 uv = vUv;

    // Single cellular call - reuse for all coord-based samples
    float cellularNoiseSample = cellular(coords);
    float noiseSample = cellularNoiseSample;

    //pixel noise (reduced resolution for performance)
    vec2 quantizedUVs = floor(vUv * 400.0) / 400.0;
    vec3 quantizedCoords = vec3(quantizedUVs * 30.0, uTime * 0.2);
    float quantizedNoiseSample = cellular(quantizedCoords);

    float blended = clamp(cellularNoiseSample * 0.5 + quantizedNoiseSample * 0.5, 0.0, 1.0);

    float edgeMask = 1.0 - smoothstep(0.1, 0.4, noiseSample);
    float result = mix(cellularNoiseSample, quantizedNoiseSample, edgeMask);

    float distToCenter = length(vUv - vec2(cellularNoiseSample, cellularNoiseSample));
    float pixelEdge = mix(distToCenter, quantizedNoiseSample, 0.9);
    
    vec3 noiseColor = mix(red, vec3(pixelEdge), noiseSample * 2.5 + 0.5);

    vec3 color = mix(noiseColor, blue, result);
    
    gl_FragColor = vec4(vec3(color), 1.0);
}
