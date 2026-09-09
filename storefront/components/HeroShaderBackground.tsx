"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Simplex-noise gradient, adapted from Componentry's Hero Geometric: a diagonal
// color sweep perturbed by animated noise, with soft banding for a less
// "digital" gradient look than a raw linear interpolation.
const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float noise = snoise(uv * 1.5 + vec2(uTime * 0.05, uTime * 0.03)) * 0.25;
  float diagonal = (uv.x + uv.y) * 0.5;
  float gradient = clamp(diagonal * 1.2 + noise, 0.0, 1.0);
  vec3 color = mix(uColor1, uColor2, gradient);
  gl_FragColor = vec4(color, 1.0);
}
`;

function GradientPlane({ color1, color2 }: { color1: string; color2: string }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally created once; colors are pushed into the existing THREE.Color below instead of recreating uniforms
    []
  );

  useEffect(() => {
    uniforms.uColor1.value.set(color1);
    uniforms.uColor2.value.set(color2);
  }, [uniforms, color1, color2]);

  useFrame((state) => {
    // react-three-fiber's standard animation pattern: mutate the uniforms
    // object's values every frame instead of triggering a React re-render
    // (which would defeat the point of a 60fps shader animation).
    // eslint-disable-next-line react-hooks/immutability
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/**
 * Animated ink-to-accent gradient behind the hero. Skips the WebGL canvas
 * entirely — falling back to a static CSS gradient — when the browser has
 * no WebGL support or the user prefers reduced motion, rather than forcing
 * a moving background on people who asked not to see one.
 */
export function HeroShaderBackground({
  color1 = "#0b0b0c",
  color2 = "#2b5cff",
  className = "",
}: {
  color1?: string;
  color2?: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [canRenderShader, setCanRenderShader] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setTimeout(() => setCanRenderShader(supportsWebGL()), 0);
    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  const staticGradient = { backgroundImage: `linear-gradient(135deg, ${color1}, ${color2})` };

  if (!canRenderShader) {
    return <div aria-hidden className={className} style={staticGradient} />;
  }

  return (
    <div aria-hidden className={className}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(color1)}
        fallback={<div style={staticGradient} className="h-full w-full" />}
      >
        <GradientPlane color1={color1} color2={color2} />
      </Canvas>
    </div>
  );
}
