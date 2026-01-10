uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

#define PI 3.14159265359

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

float fbm(vec3 p, int octaves, float persistence, float lacunarity) {
  float amplitude = 0.5;
  float frequency = 1.0;
  float total = 0.0;
  float normalization = 0.0;

  for (int i = 0; i < octaves; ++i) {
    float noiseValue = noise(p * frequency);
    total += noiseValue * amplitude;
    normalization += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  total /= normalization;

  return total;
}

float domainWarpingFBM(vec3 coords) {
  vec3 offset = vec3(
    fbm(coords, 4, 0.5, 2.0),
    fbm(coords + vec3(43.235, 23.112, 0.0), 4, 0.5, 2.0), 0.0);
  float noiseSample = fbm(coords + offset, 1, 0.5, 2.0);

  vec3 offset2 = vec3(
    fbm(coords + 4.0 * offset + vec3(5.325, 1.421, 3.235), 4, 0.5, 2.0),
    fbm(coords + 4.0 * offset + vec3(4.32, 0.532, 6.324), 4, 0.5, 2.0), 0.0);
  noiseSample = fbm(coords + 4.0 * offset2, 1, 0.5, 2.0);

  return noiseSample;
}

void main() {
    vec2 uv = vUv;
    // shift origin from (0,0) to (0.5, 0.5)
    vec2 toCenter = vec2(0.5, 0.5) - uv;
    // calculate radius
    float radius = length(toCenter) * 2.0;
    // calculate angle (theta) using atan()
    float angle = atan(toCenter.y, toCenter.x);
    // map the polar coordiantes (r, theta) to normalized uv coordinates
    vec2 polarUV;
    polarUV.x = radius; // use radius as the horizontal U coord (distance from center)
    polarUV.y = angle * 0.5 / PI + 0.5; // use angle as the vertical V coord (normalized angle)


    vec2 polarCoords = vec2(radius, angle);

    float warp = domainWarpingFBM(vec3(polarCoords * 5.0, uTime * 0.2));
    float gradient = smoothstep(0.0, 1.0, radius + warp * 0.5);

    // Creates organic, blobby gradients from center
    vec3 color = mix(vec3(0.1, 0.2, 0.85), vec3(0.1, 0.7, 0.1), gradient);


    gl_FragColor = vec4(color, 1.0);
}