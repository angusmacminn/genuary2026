uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define PI 3.14159265359

// Signed Distance Functions
float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdPlane(vec3 p, vec3 n, float h) {
    return dot(p, n) + h;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Smooth minimum for blending shapes
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Scene SDF - combine all objects here
float sceneSDF(vec3 p) {
    // Animated sphere
    vec3 spherePos = vec3(sin(uTime) * 1.5, 0.5 + sin(uTime * 2.0) * 0.3, cos(uTime) * 1.5);
    float sphere = sdSphere(p - spherePos, 0.5);
    
    // Second sphere
    vec3 sphere2Pos = vec3(-sin(uTime * 0.7) * 1.2, 0.5, -cos(uTime * 0.7) * 1.2);
    float sphere2 = sdSphere(p - sphere2Pos, 0.4);
    
    // Ground plane
    float plane = sdPlane(p, vec3(0.0, 1.0, 0.0), 0.0);
    
    // Box in the center
    vec3 boxPos = vec3(0.0, 0.5, 0.0);
    float box = sdBox(p - boxPos, vec3(0.4));
    
    // Combine shapes with smooth minimum
    float objects = smin(sphere, sphere2, 0.5);
    objects = smin(objects, box, 0.3);
    
    return min(objects, plane);
}

// Calculate normal using gradient
vec3 getNormal(vec3 p) {
    float d = sceneSDF(p);
    vec2 e = vec2(0.001, 0.0);
    
    vec3 n = d - vec3(
        sceneSDF(p - e.xyy),
        sceneSDF(p - e.yxy),
        sceneSDF(p - e.yyx)
    );
    
    return normalize(n);
}

// Soft shadows
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    for(int i = 0; i < 32; i++) {
        float h = sceneSDF(ro + rd * t);
        res = min(res, k * h / t);
        t += clamp(h, 0.02, 0.1);
        if(h < 0.001 || t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

// Ambient occlusion
float ambientOcclusion(vec3 p, vec3 n) {
    float occ = 0.0;
    float weight = 1.0;
    for(int i = 0; i < 5; i++) {
        float dist = 0.01 + 0.12 * float(i);
        float d = sceneSDF(p + n * dist);
        occ += (dist - d) * weight;
        weight *= 0.85;
    }
    return 1.0 - clamp(0.6 * occ, 0.0, 1.0);
}

// Raymarching
float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneSDF(p);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST) break;
    }
    
    return dO;
}

void main() {
    // Normalized coordinates with aspect ratio correction
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;
    
    // Camera setup
    vec3 ro = vec3(0.0, 2.0, 5.0); // Ray origin (camera position)
    vec3 lookAt = vec3(0.0, 0.5, 0.0);
    
    // Camera matrix
    vec3 forward = normalize(lookAt - ro);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    
    // Ray direction
    vec3 rd = normalize(uv.x * right + uv.y * up + forward * 1.5);
    
    // Raymarch
    float d = rayMarch(ro, rd);
    
    // Background color (sky gradient)
    vec3 col = mix(vec3(0.5, 0.7, 0.9), vec3(0.1, 0.2, 0.4), uv.y + 0.5);
    
    if(d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);
        
        // Lighting
        vec3 lightPos = vec3(3.0, 5.0, 4.0);
        vec3 lightDir = normalize(lightPos - p);
        vec3 viewDir = normalize(ro - p);
        vec3 halfDir = normalize(lightDir + viewDir);
        
        // Diffuse
        float diff = max(dot(n, lightDir), 0.0);
        
        // Specular (Blinn-Phong)
        float spec = pow(max(dot(n, halfDir), 0.0), 32.0);
        
        // Shadows and AO
        float shadow = softShadow(p + n * 0.02, lightDir, 0.02, 5.0, 16.0);
        float ao = ambientOcclusion(p, n);
        
        // Material color (simple checker pattern on ground)
        vec3 matCol;
        if(p.y < 0.01) {
            // Checkerboard floor
            float checker = mod(floor(p.x) + floor(p.z), 2.0);
            matCol = mix(vec3(0.2), vec3(0.8), checker);
        } else {
            // Object color
            matCol = vec3(0.9, 0.3, 0.2);
        }
        
        // Combine lighting
        vec3 ambient = vec3(0.1, 0.15, 0.2);
        col = matCol * (ambient * ao + diff * shadow) + spec * shadow * 0.5;
        
        // Fog
        float fog = 1.0 - exp(-0.02 * d * d);
        col = mix(col, vec3(0.5, 0.7, 0.9), fog);
    }
    
    // Gamma correction
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}
