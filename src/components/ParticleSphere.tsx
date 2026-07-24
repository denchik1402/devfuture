"use client";

import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type ParticleSphereProps = {
  className?: string;
};

function getParticleCount() {
  if (typeof window === "undefined") return 900;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile || (mem !== undefined && mem <= 4) || cores <= 4) return 700;
  return 1200;
}

/** Always-visible CSS orb — shown if WebGL fails or reduced-motion is on */
function CssOrbFallback() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden
      style={{ pointerEvents: "none" }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(0,240,255,0.35), rgba(176,38,255,0.18) 45%, transparent 70%)",
          boxShadow:
            "0 0 80px rgba(0,240,255,0.25), 0 0 160px rgba(176,38,255,0.15)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[min(42vw,300px)] w-[min(42vw,300px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-neon/25"
        style={{ boxShadow: "0 0 40px rgba(0,240,255,0.2)" }}
      />
    </div>
  );
}

function ParticleSphere({ className }: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"loading" | "webgl" | "fallback">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Windows 11 often sets reduced-motion — still show a clear orb
    if (reducedMotion) {
      setMode("fallback");
      return;
    }

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let ringGeo: THREE.RingGeometry | null = null;
    let ringMat: THREE.MeshBasicMaterial | null = null;

    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };

    try {
      const particleCount = getParticleCount();
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 4.0;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      });

      const gl = renderer.getContext();
      if (!gl) {
        throw new Error("No WebGL context");
      }

      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";
      container.appendChild(canvas);

      const syncSize = () => {
        if (!renderer) return;
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width || window.innerWidth));
        const h = Math.max(1, Math.floor(rect.height || window.innerHeight));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };
      syncSize();

      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const colorCyan = new THREE.Color("#00F0FF");
      const colorPurple = new THREE.Color("#B026FF");
      const colorMix = new THREE.Color();

      for (let i = 0; i < particleCount; i++) {
        const radius = 1.5 + Math.random() * 0.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        colorMix.copy(colorCyan).lerp(colorPurple, Math.random());
        colors[i * 3] = colorMix.r;
        colors[i * 3 + 1] = colorMix.g;
        colors[i * 3 + 2] = colorMix.b;
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: 0.07,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      ringGeo = new THREE.RingGeometry(2.0, 2.06, 96);
      ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.4;
      scene.add(ring);

      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      const onResize = () => syncSize();

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });

      const clock = new THREE.Clock();
      const frameInterval = 1000 / 30;
      let lastFrame = 0;

      const animate = () => {
        if (disposed || !renderer) return;
        raf = requestAnimationFrame(animate);
        const now = performance.now();
        if (now - lastFrame < frameInterval) return;
        lastFrame = now;

        const t = clock.getElapsedTime();
        targetRot.x += (mouse.y * 0.35 - targetRot.x) * 0.05;
        targetRot.y += (mouse.x * 0.45 - targetRot.y) * 0.05;
        points.rotation.y = t * 0.08 + targetRot.y;
        points.rotation.x = t * 0.03 + targetRot.x;
        ring.rotation.z = t * 0.12;
        ring.rotation.x = Math.PI / 2.4 + targetRot.x * 0.3;
        renderer.render(scene, camera);
      };

      syncSize();
      renderer.render(scene, camera);
      animate();
      setMode("webgl");

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        geometry?.dispose();
        material?.dispose();
        ringGeo?.dispose();
        ringMat?.dispose();
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.error("[ParticleSphere] WebGL failed, using CSS fallback", err);
      setMode("fallback");
      return;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      {(mode === "loading" || mode === "fallback") && <CssOrbFallback />}
    </div>
  );
}

export default memo(ParticleSphere);
