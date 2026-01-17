uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001

// SDF for invisible sphere
float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

// SDF for ground plane
float sdPlane(vec3 p) {
    return p.y;
}

// Scene SDF for shadow calculation (includes invisible object)
float sceneSDF(vec3 p) {
    // Animated floating sphere (invisible but casts shadow)
    vec3 spherePos = vec3(
        sin(uTime * 0.8) * 2.0,
        1.5 + sin(uTime * 1.2) * 0.5,
        cos(uTime * 0.6) * 2.0
    );
    float sphere = sdSphere(p - spherePos, 1.0);
    
    // Ground plane
    float plane = sdPlane(p);
    
    return min(sphere, plane);
}

// SDF for visible geometry only (just the ground)
float visibleSDF(vec3 p) {
    return sdPlane(p);
}

// Calculate normal
vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    float d = visibleSDF(p);
    vec3 n = d - vec3(
        visibleSDF(p - e.xyy),
        visibleSDF(p - e.yxy),
        visibleSDF(p - e.yyx)
    );
    return normalize(n);
}

// Soft shadows - uses full scene SDF (includes invisible object)
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    for(int i = 0; i < 64; i++) {
        float h = sceneSDF(ro + rd * t);
        res = min(res, k * h / t);
        t += clamp(h, 0.01, 0.1);
        if(h < 0.001 || t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

// Raymarch - only hits visible geometry (ground)
float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = visibleSDF(p);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST) break;
    }
    
    return dO;
}

void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;
    
    // Camera setup
    vec3 ro = vec3(0.0, 3.0, 8.0);
    vec3 lookAt = vec3(0.0, 0.0, 0.0);
    
    // Camera matrix
    vec3 forward = normalize(lookAt - ro);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    
    // Ray direction
    vec3 rd = normalize(uv.x * right + uv.y * up + forward * 1.5);
    
    // Raymarch (only visible geometry)
    float d = rayMarch(ro, rd);
    
    // Sky gradient background
    vec3 col = mix(vec3(0.7, 0.8, 0.95), vec3(0.4, 0.6, 0.9), uv.y + 0.5);
    
    if(d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);
        
        // Light 1 - Red/Orange from the right
        vec3 light1Pos = vec3(6.0, 6.0, 2.0);
        vec3 light1Dir = normalize(light1Pos - p);
        vec3 light1Col = vec3(1.0, 0.3, 0.1);
        float diff1 = max(dot(n, light1Dir), 0.0);
        float shadow1 = softShadow(p + n * 0.02, light1Dir, 0.02, 10.0, 8.0);
        
        // Light 2 - Cyan/Blue from the left
        vec3 light2Pos = vec3(-6.0, 5.0, 3.0);
        vec3 light2Dir = normalize(light2Pos - p);
        vec3 light2Col = vec3(0.1, 0.6, 1.0);
        float diff2 = max(dot(n, light2Dir), 0.0);
        float shadow2 = softShadow(p + n * 0.02, light2Dir, 0.02, 10.0, 8.0);
        
        // Light 3 - Green/Yellow from behind
        vec3 light3Pos = vec3(0.0, 7.0, -5.0);
        vec3 light3Dir = normalize(light3Pos - p);
        vec3 light3Col = vec3(0.4, 1.0, 0.2);
        float diff3 = max(dot(n, light3Dir), 0.0);
        float shadow3 = softShadow(p + n * 0.02, light3Dir, 0.02, 10.0, 8.0);
        
        // Ground material - neutral so colors show clearly
        vec3 groundCol = vec3(0.95);
        
        // Combine all lights
        vec3 ambient = vec3(0.08);
        vec3 lighting = ambient;
        lighting += light1Col * diff1 * shadow1 * 0.5;
        lighting += light2Col * diff2 * shadow2 * 0.5;
        lighting += light3Col * diff3 * shadow3 * 0.5;
        
        col = groundCol * lighting;
    }
    
    // Gamma correction
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}
