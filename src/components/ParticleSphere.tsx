"use client";

import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { SPHERE_BURST_EVENT } from "@/lib/sphere-events";

type ParticleSphereProps = {
  className?: string;
};

function getParticleCount() {
  if (typeof window === "undefined") return 900;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile || (mem !== undefined && mem <= 4) || cores <= 4) return 600;
  return 1100;
}

function ParticleSphere({ className }: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const start = () => {
      if (cancelled || !containerRef.current) return;
      const el = containerRef.current;

      const particleCount = getParticleCount();
      const mouse = { x: 0, y: 0 };
      const targetRot = { x: 0, y: 0 };
      let visible = true;
      let pageVisible = true;
      let raf = 0;
      let burst = 0;

      const width = el.clientWidth || window.innerWidth;
      const height = el.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.z = 4.2;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      });
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      el.appendChild(renderer.domElement);

      const positions = new Float32Array(particleCount * 3);
      const basePositions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const colorCyan = new THREE.Color("#00F0FF");
      const colorPurple = new THREE.Color("#B026FF");
      const colorMix = new THREE.Color();

      for (let i = 0; i < particleCount; i++) {
        const radius = 1.55 + Math.random() * 0.35;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        basePositions[i * 3] = x;
        basePositions[i * 3 + 1] = y;
        basePositions[i * 3 + 2] = z;
        colorMix.copy(colorCyan).lerp(colorPurple, Math.random());
        colors[i * 3] = colorMix.r;
        colors[i * 3 + 1] = colorMix.g;
        colors[i * 3 + 2] = colorMix.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.022,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const ringGeo = new THREE.RingGeometry(2.05, 2.08, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.4;
      scene.add(ring);

      const onMouseMove = (e: MouseEvent) => {
        if (!visible) return;
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      let resizeQueued = false;
      const onResize = () => {
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(() => {
          resizeQueued = false;
          const w = el.clientWidth;
          const h = el.clientHeight;
          if (!w || !h) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        });
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && pageVisible && !raf) animate();
        },
        { threshold: 0.05 }
      );
      io.observe(el);

      const onVisibility = () => {
        pageVisible = document.visibilityState === "visible";
        if (pageVisible && visible && !raf) animate();
      };

      const onBurst = () => {
        burst = 1;
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener(SPHERE_BURST_EVENT, onBurst);

      const clock = new THREE.Clock();
      const frameInterval = 1000 / 30;
      let lastFrame = 0;
      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;

      const animate = () => {
        if (!visible || !pageVisible) {
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(animate);

        const now = performance.now();
        if (now - lastFrame < frameInterval) return;
        lastFrame = now;

        const t = clock.getElapsedTime();
        targetRot.x += (mouse.y * 0.35 - targetRot.x) * 0.05;
        targetRot.y += (mouse.x * 0.45 - targetRot.y) * 0.05;

        if (burst > 0.01) {
          const expand = 1 + burst * 0.18;
          for (let i = 0; i < particleCount; i++) {
            posAttr.array[i * 3] = basePositions[i * 3] * expand;
            posAttr.array[i * 3 + 1] = basePositions[i * 3 + 1] * expand;
            posAttr.array[i * 3 + 2] = basePositions[i * 3 + 2] * expand;
          }
          posAttr.needsUpdate = true;
          material.size = 0.022 + burst * 0.02;
          material.opacity = 0.9 + burst * 0.1;
          burst *= 0.88;
        } else if (burst !== 0) {
          burst = 0;
          for (let i = 0; i < particleCount; i++) {
            posAttr.array[i * 3] = basePositions[i * 3];
            posAttr.array[i * 3 + 1] = basePositions[i * 3 + 1];
            posAttr.array[i * 3 + 2] = basePositions[i * 3 + 2];
          }
          posAttr.needsUpdate = true;
          material.size = 0.022;
          material.opacity = 0.9;
        }

        points.rotation.y = t * 0.08 + targetRot.y;
        points.rotation.x = t * 0.03 + targetRot.x;
        ring.rotation.z = t * 0.12;
        ring.rotation.x = Math.PI / 2.4 + targetRot.x * 0.3;

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        io.disconnect();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener(SPHERE_BURST_EVENT, onBurst);
        geometry.dispose();
        material.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === el) {
          el.removeChild(renderer.domElement);
        }
      };
    };

    // Defer WebGL until after first paint / idle — protects LCP
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    let idleId = 0;
    let timeoutId = 0;
    if (typeof ric === "function") {
      idleId = ric(() => start(), { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(start, 400);
    }

    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none", contain: "strict" }}
    />
  );
}

export default memo(ParticleSphere);
