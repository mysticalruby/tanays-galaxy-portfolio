"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ROCKET_MODEL_SRC,
  rocketPartLinks,
  type RocketPartDestination,
} from "@/lib/rocketPartLinks";

const DRACO_DECODER =
  "https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/";
const DRAG_THRESHOLD_PX = 6;

type ViewerStatus = "loading" | "ready" | "error";

export function RocketViewer() {
  const holderRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const holder = holderRef.current;
    const tooltipEl = tooltipRef.current;
    if (!holder) return;

    let disposed = false;
    let frameId = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let controls: import("three/examples/jsm/controls/OrbitControls.js").OrbitControls | null =
      null;
    let resizeObserver: ResizeObserver | null = null;

    const pointerDown = { x: 0, y: 0 };

    async function init() {
      const THREE = await import("three");
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const { DRACOLoader } = await import(
        "three/examples/jsm/loaders/DRACOLoader.js"
      );
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );

      if (disposed || !holder) return;

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
      camera.position.set(0, 0, 1.3);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      const canvasEl = renderer.domElement;
      canvasEl.style.display = "block";
      canvasEl.style.width = "100%";
      canvasEl.style.height = "100%";
      canvasEl.style.background = "transparent";
      holder.appendChild(canvasEl);

      const syncSize = () => {
        if (!renderer || !holder) return;
        const width = holder.clientWidth;
        const height = holder.clientHeight;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // updateStyle false — CSS already fills the holder; only resize the buffer
        renderer.setSize(width, height, false);
      };
      syncSize();

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.zoomSpeed = 4;
      controls.minDistance = 0.5;
      controls.maxDistance = 8;
      controls.target.set(0, 0, 0);
      controls.update();

      scene.add(new THREE.AmbientLight(0xffffff, 1.8));
      const dirLight = new THREE.DirectionalLight(0xffffff, 2.6);
      dirLight.position.set(4, 10, 6);
      scene.add(dirLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 1.32);
      fillLight.position.set(-4, 3, 5);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
      rimLight.position.set(0, -4, -6);
      scene.add(rimLight);

      let modelRoot: import("three").Object3D | null = null;
      let assemblyRoot: import("three").Object3D | null = null;

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(DRACO_DECODER);

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      try {
        const gltf = await loader.loadAsync(ROCKET_MODEL_SRC);
        if (disposed) {
          dracoLoader.dispose();
          return;
        }

        modelRoot = gltf.scene;
        assemblyRoot = modelRoot.children[0] ?? modelRoot;

        // Open cut faces +Z. Pitch −90° about X; yaw 0; roll 0.
        modelRoot.rotation.order = "YXZ";
        modelRoot.rotation.set(-Math.PI / 2, 0, 0);

        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.32 / maxDim;
        modelRoot.scale.setScalar(scale);
        modelRoot.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale,
        );
        // Second pass after scale so the AABB center lands exactly on the orbit target
        const centered = new THREE.Box3()
          .setFromObject(modelRoot)
          .getCenter(new THREE.Vector3());
        modelRoot.position.sub(centered);

        scene.add(modelRoot);
        controls.target.set(0, 0, 0);
        camera.lookAt(controls.target);
        controls.update();
        setStatus("ready");
      } catch (err) {
        console.error("Failed to load rocket model", err);
        if (!disposed) {
          setStatus("error");
          setErrorMessage("Could not load the 3D rocket model.");
        }
        dracoLoader.dispose();
        return;
      }

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      function findPartNode(obj: import("three").Object3D) {
        let node: import("three").Object3D | null = obj;
        while (
          node &&
          node.parent &&
          assemblyRoot &&
          node.parent !== assemblyRoot
        ) {
          node = node.parent;
        }
        return node;
      }

      function raycastAt(clientX: number, clientY: number) {
        if (!modelRoot || !renderer) return null;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(modelRoot, true);
        if (intersects.length === 0) return null;
        return findPartNode(intersects[0].object);
      }

      function destinationFor(
        part: import("three").Object3D | null,
      ): RocketPartDestination | null {
        if (!part) return null;
        return rocketPartLinks[part.name] ?? null;
      }

      const canvas = renderer.domElement;

      const onPointerMove = (event: PointerEvent) => {
        const part = raycastAt(event.clientX, event.clientY);
        const destination = destinationFor(part);

        if (destination && tooltipEl) {
          tooltipEl.style.display = "block";
          tooltipEl.style.left = `${event.clientX + 14}px`;
          tooltipEl.style.top = `${event.clientY + 14}px`;
          tooltipEl.textContent = destination.label;
          canvas.style.cursor = "pointer";
        } else if (tooltipEl) {
          tooltipEl.style.display = "none";
          canvas.style.cursor = part ? "default" : "grab";
        }
      };

      const onPointerLeave = () => {
        if (tooltipEl) tooltipEl.style.display = "none";
      };

      const onPointerDown = (event: PointerEvent) => {
        pointerDown.x = event.clientX;
        pointerDown.y = event.clientY;
      };

      const onClick = (event: MouseEvent) => {
        const dx = event.clientX - pointerDown.x;
        const dy = event.clientY - pointerDown.y;
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) return;

        const part = raycastAt(event.clientX, event.clientY);
        const destination = destinationFor(part);
        if (!destination) return;
        router.push(destination.href);
      };

      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("click", onClick);

      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(holder);

      const animate = () => {
        if (disposed) return;
        frameId = requestAnimationFrame(animate);
        controls?.update();
        renderer?.render(scene, camera);
      };
      animate();

      return () => {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("click", onClick);
        dracoLoader.dispose();
      };
    }

    let detachListeners: (() => void) | undefined;

    init()
      .then((cleanup) => {
        detachListeners = cleanup;
      })
      .catch((err) => {
        console.error(err);
        if (!disposed) {
          setStatus("error");
          setErrorMessage("Could not start the 3D viewer.");
        }
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      detachListeners?.();
      resizeObserver?.disconnect();
      controls?.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement === holder) {
          holder.removeChild(renderer.domElement);
        }
      }
      if (tooltipEl) tooltipEl.style.display = "none";
    };
  }, [router]);

  return (
    <div className="relative w-full overflow-hidden bg-transparent">
      <div
        ref={holderRef}
        className="relative h-[min(49vh,392px)] w-full min-h-[224px] touch-none bg-transparent"
        aria-label="Interactive 3D rocket — drag to rotate, scroll to zoom, click a part to navigate"
        role="img"
      />

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          Loading rocket model…
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-text-muted">
          {errorMessage ?? "Viewer unavailable."}
        </div>
      )}

      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-text-muted sm:text-sm">
        Drag to rotate · Scroll to zoom · Click a part to explore
        <span className="mt-0.5 block text-[0.7rem] opacity-80 sm:text-xs">
          Custom-made 3D model.
        </span>
      </p>

      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-50 hidden max-w-[240px] border border-white/20 bg-[#0f1419]/95 px-2.5 py-1.5 text-xs text-text-primary shadow-lg"
        aria-hidden
      />
    </div>
  );
}
