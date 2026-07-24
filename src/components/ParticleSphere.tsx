"use client";

import { memo, useEffect, useRef } from "react";
import * as THREE from "three";

type ParticleSphereProps = {
  className?: string;
};

/** Adaptive particle count: fewer on weak / mobile GPUs */
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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      container.style.background =
        "radial-gradient(ellipse at center, rgba(0,240,255,0.12), transparent 60%)";
      return;
    }

    const particleCount = getParticleCount();
    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    let visible = true;
    let pageVisible = true;
    let raf = 0;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
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
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const syncSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (!w || !h) return false;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      return true;
    };
    syncSize();

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorCyan = new THREE.Color("#00F0FF");
    const colorPurple = new THREE.Color("#B026FF");
    const colorMix = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.55 + Math.random() * 0.35;
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

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
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
      opacity: 0.14,
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
      if (resizeQueued || disposed) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        syncSize();
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        // Ignore zero-size false negatives (layout not ready yet)
        if (
          !entry.isIntersecting &&
          (container.clientWidth === 0 || container.clientHeight === 0)
        ) {
          return;
        }
        visible = entry.isIntersecting;
        if (visible && pageVisible && !raf) animate();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible && visible && !raf) animate();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const clock = new THREE.Clock();
    const frameInterval = 1000 / 30;
    let lastFrame = 0;

    const animate = () => {
      if (disposed || !visible || !pageVisible) {
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

      points.rotation.y = t * 0.08 + targetRot.y;
      points.rotation.x = t * 0.03 + targetRot.x;
      ring.rotation.z = t * 0.12;
      ring.rotation.x = Math.PI / 2.4 + targetRot.x * 0.3;

      renderer.render(scene, camera);
    };

    // Layout can be 0 on first tick — retry once after paint
    requestAnimationFrame(() => {
      if (disposed) return;
      syncSize();
      if (!raf) animate();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      // Do NOT use contain:strict — size containment can collapse to 0×0
      // and IntersectionObserver then never starts the animation loop.
      style={{ pointerEvents: "none", width: "100%", height: "100%" }}
    />
  );
}

export default memo(ParticleSphere);
