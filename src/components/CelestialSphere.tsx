"use client";

import { useEffect, useRef, useState } from "react";
import { celestialTexturePaths, makeCelestialCanvas, type CelestialKind } from "@/lib/celestialTextures";

export function CelestialSphere({
  kind,
  className = "",
  interactive = false,
}: {
  kind: CelestialKind;
  className?: string;
  interactive?: boolean;
}) {
  const mountRef = useRef<HTMLSpanElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let frame = 0;
    let renderer: import("three").WebGLRenderer | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cleanupScene: (() => void) | undefined;

    async function start() {
      const THREE = await import("three");
      if (disposed || !mount) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, .1, 20);
      camera.position.set(0, 0, 3.3);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.16;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xf4f6fb, kind === "sun" ? 1.1 : .1));
      const key = new THREE.DirectionalLight(0xffffff, kind === "sun" ? 1.3 : 3.4);
      key.position.set(-4, 1.8, 1);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x7198e8, .18);
      rim.position.set(3, -2, -1);
      scene.add(rim);

      let surfaceTexture: import("three").Texture = new THREE.CanvasTexture(makeCelestialCanvas(kind));
      surfaceTexture.colorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.SphereGeometry(1, 64, 48);
      const material = new THREE.MeshStandardMaterial({
        map: surfaceTexture,
        roughness: kind === "earth" ? .72 : 1,
        metalness: 0,
        emissive: kind === "sun" ? 0xff9c21 : 0x000000,
        emissiveIntensity: kind === "sun" ? .55 : 0,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.rotation.set(.08, Math.PI / 7, .18);
      scene.add(sphere);

      new THREE.TextureLoader().loadAsync(celestialTexturePaths[kind]).then((loaded) => {
        if (disposed) return loaded.dispose();
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 1, 8);
        material.map = loaded;
        if (kind === "moon" || kind === "mercury" || kind === "mars") {
          material.bumpMap = loaded;
          material.bumpScale = kind === "moon" ? .035 : .022;
        }
        material.needsUpdate = true;
        surfaceTexture.dispose();
        surfaceTexture = loaded;
      }).catch(() => {});

      let atmosphere: import("three").Mesh | undefined;
      let cloudShell: import("three").Mesh | undefined;
      let cloudTexture: import("three").Texture | undefined;
      if (kind === "earth") {
        atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.075, 64, 48),
          new THREE.MeshBasicMaterial({ color: 0x7cbbff, transparent: true, opacity: .18, side: THREE.BackSide }),
        );
        scene.add(atmosphere);
        new THREE.TextureLoader().loadAsync("/textures/earth_clouds.jpg").then((loaded) => {
          if (disposed) return loaded.dispose();
          cloudTexture = loaded;
          cloudShell = new THREE.Mesh(
            new THREE.SphereGeometry(1.012, 64, 48),
            new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: loaded, transparent: true, opacity: .38, depthWrite: false }),
          );
          cloudShell.rotation.copy(sphere.rotation);
          scene.add(cloudShell);
        }).catch(() => {});
      }

      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        mount.setPointerCapture(event.pointerId);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        sphere.rotation.y += (event.clientX - lastX) * .012;
        sphere.rotation.x += (event.clientY - lastY) * .008;
        sphere.rotation.x = Math.max(-.7, Math.min(.7, sphere.rotation.x));
        lastX = event.clientX;
        lastY = event.clientY;
      };
      const onPointerUp = () => { dragging = false; };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          sphere.rotation.y += event.key === "ArrowLeft" ? -.3 : .3;
        }
      };
      if (interactive) {
        mount.addEventListener("pointerdown", onPointerDown);
        mount.addEventListener("pointermove", onPointerMove);
        mount.addEventListener("pointerup", onPointerUp);
        mount.addEventListener("pointercancel", onPointerUp);
        mount.addEventListener("keydown", onKeyDown);
      }

      const resize = () => {
        if (!renderer || !mount) return;
        const width = Math.max(1, mount.clientWidth);
        const height = Math.max(1, mount.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      const tick = () => {
        if (disposed || !renderer) return;
        frame = requestAnimationFrame(tick);
        // Venus is the one retrograde planet in this set; the others turn the same way.
        const spin = kind === "venus" ? -.0022 : kind === "sun" ? .0015 : kind === "moon" ? .004 : .003;
        if (!dragging) sphere.rotation.y += spin;
        if (cloudShell) cloudShell.rotation.y += .0033;
        renderer.render(scene, camera);
      };
      tick();

      cleanupScene = () => {
        geometry.dispose();
        material.dispose();
        surfaceTexture.dispose();
        atmosphere?.geometry.dispose();
        (atmosphere?.material as import("three").Material | undefined)?.dispose();
        cloudShell?.geometry.dispose();
        (cloudShell?.material as import("three").Material | undefined)?.dispose();
        cloudTexture?.dispose();
        if (interactive) {
          mount.removeEventListener("pointerdown", onPointerDown);
          mount.removeEventListener("pointermove", onPointerMove);
          mount.removeEventListener("pointerup", onPointerUp);
          mount.removeEventListener("pointercancel", onPointerUp);
          mount.removeEventListener("keydown", onKeyDown);
        }
      };
    }

    start().catch(() => setFailed(true));
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      cleanupScene?.();
      renderer?.dispose();
      if (renderer?.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [kind, interactive]);

  return (
    <span
      ref={mountRef}
      className={`relative block h-full w-full ${interactive ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}
      role={interactive ? "img" : undefined}
      aria-label={interactive ? `Rotating 3D model of ${kind}. Drag or use the arrow keys to turn it.` : undefined}
      aria-hidden={interactive ? undefined : true}
      tabIndex={interactive ? 0 : undefined}
      style={interactive ? { touchAction: "none" } : undefined}
    >
      {failed && <span className="block h-full w-full rounded-full bg-surface-raised" />}
    </span>
  );
}
