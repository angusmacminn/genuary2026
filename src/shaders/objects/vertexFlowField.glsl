uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uCurlAmount;
uniform vec3 uMousePos;
uniform float uMouseInfluence; // 0-1 smooth transition
uniform float uAttractionStrength;
uniform float uSwirlStrength;
uniform float uSpeedBoost;

attribute float aScale;
attribute vec3 aVelocity;
attribute float aLife;

varying vec3 vColor;
varying float vAlpha;

// Simplex 3D noise
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Curl noise for divergence-free flow
vec3 curlNoise(vec3 p) {
    float e = 0.1;
    
    float n1 = snoise(p + vec3(e, 0.0, 0.0));
    float n2 = snoise(p - vec3(e, 0.0, 0.0));
    float n3 = snoise(p + vec3(0.0, e, 0.0));
    float n4 = snoise(p - vec3(0.0, e, 0.0));
    float n5 = snoise(p + vec3(0.0, 0.0, e));
    float n6 = snoise(p - vec3(0.0, 0.0, e));
    
    float x = (n4 - n3) - (n6 - n5);
    float y = (n6 - n5) - (n2 - n1);
    float z = (n2 - n1) - (n4 - n3);
    
    return normalize(vec3(x, y, z)) * 0.5;
}

void main() {
    // Calculate speed with boost when clicking
    float currentSpeedMult = mix(1.0, uSpeedBoost, uMouseInfluence);
    float t = uTime * uSpeed * currentSpeedMult;
    vec3 pos = position;
    
    // === FLOW FIELD MODE ===
    vec3 noisePos = pos * uNoiseScale + vec3(t * 0.1);
    vec3 curl = curlNoise(noisePos) * uCurlAmount;
    
    float nx = snoise(noisePos + vec3(0.0, 100.0, 0.0));
    float ny = snoise(noisePos + vec3(100.0, 0.0, 0.0));
    float nz = snoise(noisePos + vec3(0.0, 0.0, 100.0));
    vec3 noiseDir = vec3(nx, ny, nz) * uNoiseStrength;
    
    vec3 flowOffset = (curl + noiseDir) * sin(t + aLife * 6.28);
    vec3 flowPos = pos + flowOffset + aVelocity * sin(t * 2.0 + aLife * 10.0) * 0.2;
    
    // === MOUSE ATTRACTION MODE ===
    vec3 toMouse = uMousePos - pos;
    float distToMouse = length(toMouse);
    vec3 dirToMouse = normalize(toMouse);
    
    // Attraction force - stronger when closer, with falloff
    float attractionFalloff = 1.0 / (1.0 + distToMouse * 0.3);
    vec3 attraction = dirToMouse * uAttractionStrength * attractionFalloff;
    
    // Swirl around mouse - perpendicular to attraction direction
    // Create a swirl axis (cross product with up vector, or right if too parallel)
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 swirlAxis = cross(dirToMouse, up);
    if (length(swirlAxis) < 0.1) {
        swirlAxis = cross(dirToMouse, vec3(1.0, 0.0, 0.0));
    }
    swirlAxis = normalize(swirlAxis);
    
    // Swirl perpendicular direction
    vec3 swirlDir = cross(swirlAxis, dirToMouse);
    
    // Animate swirl with boosted time for faster spinning when clicking
    float swirlPhase = t * 3.0 + aLife * 6.28;
    vec3 swirl = swirlDir * sin(swirlPhase) * uSwirlStrength * attractionFalloff;
    swirl += swirlAxis * cos(swirlPhase) * uSwirlStrength * attractionFalloff * 0.5;
    
    // Add some noise to the swirl for organic feel
    vec3 swirlNoise = curlNoise(pos * 0.5 + t * 0.2) * 0.5;
    
    // Mouse-influenced position
    vec3 mousePos = pos + attraction + swirl + swirlNoise * uMouseInfluence;
    
    // === BLEND BETWEEN MODES ===
    // Smooth easing for the blend
    float blend = smoothstep(0.0, 1.0, uMouseInfluence);
    vec3 finalPos = mix(flowPos, mousePos, blend);
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    
    // Size attenuation - particles get slightly bigger when attracted
    float sizeBoost = 1.0 + blend * 0.3 * attractionFalloff;
    gl_PointSize = uSize * aScale * sizeBoost * (300.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    
    // Color - shift hue slightly when mouse is active
    vec3 baseColor = vec3(0.2, 0.5, 1.0);
    vec3 accentColor = vec3(1.0, 0.3, 0.6);
    vec3 mouseColor = vec3(1.0, 0.8, 0.2); // Warmer color when attracted
    
    float colorMix = sin(aLife * 6.28 + t) * 0.5 + 0.5;
    vec3 normalColor = mix(baseColor, accentColor, colorMix);
    vec3 attractedColor = mix(normalColor, mouseColor, attractionFalloff * 0.5);
    
    vColor = mix(normalColor, attractedColor, blend);
    
    // Alpha - slightly more visible when attracted
    float baseAlpha = smoothstep(-15.0, -2.0, mvPosition.z) * (0.6 + 0.4 * sin(aLife * 6.28));
    vAlpha = baseAlpha * (1.0 + blend * 0.2);
}
