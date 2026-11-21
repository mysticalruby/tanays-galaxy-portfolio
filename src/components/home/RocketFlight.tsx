"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { celestialTexturePaths } from "@/lib/celestialTextures";
import styles from "./HomeStory.module.css";

/**
 * A Saturn V that flies through the home page as you scroll.
 *
 * The page marks a few elements and the rocket reads their positions every frame:
 *   [data-rocket-hero]    the rocket stands next to the name
 *   [data-flight]         a gap between chapters; the rocket crosses the screen, rolling
 *   [data-flight=launch]  the rocket turns upright and launches off the top
 * Between flights it parks at the edge of the screen (only on wide screens).
 */

type Pose = { x: number; y: number; angle: number; roll: number; scale: number; flame: number };
type Key = Pose & { at: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function RocketFlight() {
  const reduce = useReducedMotion();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // With "reduce motion" on, the rocket still flies with the scroll (it only moves when the
    // visitor scrolls), but without the barrel rolls, idle spin, bobbing or pointer tilt.
    const calm = Boolean(reduce);
    const m = calm ? 0 : 1;
    const mount = mountRef.current;
    if (!mount) return;
    const mountEl = mount;

    let disposed = false;
    let raf = 0;
    let cleanup: (() => void) | undefined;

    async function start() {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      mountEl.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 10);

      scene.add(new THREE.HemisphereLight(0xf4f6fb, 0x14203a, 2.0));
      const key = new THREE.DirectionalLight(0xffffff, 4);
      key.position.set(4, 6, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xe9b25a, 3);
      rim.position.set(-6, -1, -3);
      scene.add(rim);

      const loader = new THREE.TextureLoader();
      const tex = (path: string) => {
        const t = loader.load(path);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };

      // ---------- background bodies that drift past with parallax ----------
      type Drifter = { obj: import("three").Object3D; ndcX: number; baseY: number; speed: number; spin: number };
      const drifters: Drifter[] = [];
      // ndcX is where it sits across the screen (-1 left edge, 1 right edge); kept near the edges so it never sits under text
      const addDrifter = (obj: import("three").Object3D, ndcX: number, baseY: number, z: number, speed: number, spin: number) => {
        obj.position.set(0, baseY, z);
        scene.add(obj);
        drifters.push({ obj, ndcX, baseY, speed, spin });
      };

      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 32), new THREE.MeshStandardMaterial({ map: tex(celestialTexturePaths.moon), roughness: 1 }));
      addDrifter(moon, 0.9, -2.5, -6, 0.0016, 0.03);

      const mars = new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 32), new THREE.MeshStandardMaterial({ map: tex(celestialTexturePaths.mars), roughness: 1 }));
      addDrifter(mars, -0.9, -9, -7, 0.0016, 0.05);

      const giant = new THREE.Group();
      giant.add(new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 48), new THREE.MeshStandardMaterial({ map: tex(celestialTexturePaths.jupiter), roughness: 0.9 })));
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.7, 2.6, 96),
        new THREE.MeshBasicMaterial({ color: 0xe9b25a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      );
      ring.rotation.x = Math.PI / 2.4;
      giant.add(ring);
      giant.rotation.z = 0.35;
      addDrifter(giant, 0.95, -18, -9, 0.0016, 0.02);

      const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a8f99, roughness: 1, flatShading: true });
      for (let i = 0; i < 9; i++) {
        const r = 0.12 + ((i * 37) % 10) / 40;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
        const side = i % 2 === 0 ? 1 : -1;
        addDrifter(rock, side * (0.86 + ((i * 13) % 7) * 0.02), -4 - i * 3.3, -3 - (i % 3), 0.0022, 0.4 + (i % 4) * 0.2);
      }

      // ---------- rocket ----------
      const gltf = await new GLTFLoader().loadAsync("/saturn-v-nasa.glb");
      if (disposed) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      // make the long axis point up
      if (size.x > size.y && size.x >= size.z) model.rotation.z = Math.PI / 2;
      else if (size.z > size.y && size.z >= size.x) model.rotation.x = -Math.PI / 2;
      model.updateMatrixWorld(true);
      const box2 = new THREE.Box3().setFromObject(model);
      const size2 = box2.getSize(new THREE.Vector3());
      const center = box2.getCenter(new THREE.Vector3());
      const holder = new THREE.Group();
      model.position.sub(center);
      holder.add(model);
      holder.scale.setScalar(1 / size2.y); // the rocket is 1 unit tall before scaling

      const rocket = new THREE.Group();
      rocket.add(holder);
      scene.add(rocket);

      // flame: two additive cones at the nozzle (local y = -0.5)
      const flameGroup = new THREE.Group();
      flameGroup.position.y = -0.5;
      const outer = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.32, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xff7a2b, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      const inner = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.2, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      outer.rotation.x = Math.PI;
      inner.rotation.x = Math.PI;
      outer.position.y = -0.16;
      inner.position.y = -0.1;
      flameGroup.add(outer, inner);
      rocket.add(flameGroup);

      // exhaust trail particles in world space
      const N = 220;
      const pPos = new Float32Array(N * 3);
      const pCol = new Float32Array(N * 3);
      const pVel = new Float32Array(N * 3);
      const pLife = new Float32Array(N);
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
      const trail = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      scene.add(trail);
      let nextParticle = 0;

      // ---------- layout ----------
      let halfH = 1;
      let halfW = 1;
      let wide = true;
      let narrow = false;
      const resize = () => {
        const w = mountEl.clientWidth;
        const h = mountEl.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        halfH = Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z;
        halfW = halfH * camera.aspect;
        wide = w >= 1280;
        narrow = w < 900;
        for (const d of drifters) {
          const depth = (camera.position.z - d.obj.position.z) / camera.position.z;
          d.obj.position.x = d.ndcX * halfW * depth;
          d.obj.visible = !narrow; // on phones the planets would sit under the text
        }
      };
      const ro = new ResizeObserver(resize);
      ro.observe(mountEl);
      resize();

      // build keyframes from the page every frame (cheap: a handful of rects)
      const buildKeys = (): Key[] => {
        const sy = window.scrollY;
        const vh = window.innerHeight;
        const keys: Key[] = [];
        const parkScale = wide ? 1.15 : 0;
        const heroEl = document.querySelector<HTMLElement>("[data-rocket-hero]");
        let roll = 0;
        let side = 0;
        if (heroEl) {
          const r = heroEl.getBoundingClientRect();
          const hero: Pose = narrow
            ? { x: 0.8, y: 0.1, angle: 0.08, roll: 0, scale: 0, flame: 0 }
            : { x: 0.12, y: 0.06, angle: 0, roll: 0, scale: 3.3, flame: 0.2 };
          keys.push({ at: sy + r.top + r.height * 0.35 - vh / 2, ...hero });
          side = hero.x;
        }
        bandRanges.length = 0;
        const flights = Array.from(document.querySelectorAll<HTMLElement>("[data-flight]"));
        flights.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          // the band's stage is pinned from when its top reaches the top of the screen
          // until (height - one screen) later; the flight happens during that pin
          const pinStart = sy + r.top;
          const pinEnd = pinStart + Math.max(vh * 0.4, r.height - vh);
          const top = pinStart - vh * 0.35;
          const bottom = pinEnd - vh * 0.08;
          const mid = lerp(top, bottom, 0.5);
          const fromX = side;
          if (el.dataset.flight === "launch") {
            keys.push({ at: top, x: fromX, y: 0, angle: 0, roll, scale: parkScale, flame: 0.3 });
            keys.push({ at: lerp(top, bottom, 0.4), x: 0, y: -0.75, angle: 0, roll: roll + Math.PI, scale: narrow ? 2.3 : 3.2, flame: 1 });
            keys.push({ at: bottom, x: 0, y: 1.9, angle: 0, roll: roll + Math.PI * 2.5, scale: narrow ? 2.4 : 3.6, flame: 1.4 });
            side = 0;
            bandRanges.push({ el, top, bottom, kind: "up" });
            return;
          }
          const toX = (i % 2 === 0 ? 1 : -1) * 0.9;
          const dir = Math.sign(toX - fromX) || 1;
          keys.push({ at: top, x: fromX, y: 0, angle: 0, roll, scale: i === 0 && heroEl ? (narrow ? 0 : 3.3) : parkScale, flame: 0.3 });
          // enter from the side, cross just above the title, leave toward the other side
          keys.push({ at: lerp(top, bottom, 0.18), x: fromX + (toX - fromX) * 0.05 - dir * 0.25, y: 0.14, angle: -dir * (Math.PI / 2 - 0.2), roll: roll + Math.PI * 0.3, scale: narrow ? 2.2 : 3, flame: 1 });
          keys.push({ at: mid, x: 0, y: 0.16, angle: -dir * (Math.PI / 2 - 0.12), roll: roll + Math.PI, scale: narrow ? 2.4 : 3.3, flame: 1.1 });
          keys.push({ at: lerp(top, bottom, 0.82), x: dir * 0.95, y: 0.12, angle: -dir * (Math.PI / 2 - 0.2), roll: roll + Math.PI * 1.7, scale: narrow ? 2.2 : 3, flame: 1 });
          roll += Math.PI * 2;
          keys.push({ at: bottom, x: toX, y: 0, angle: -dir * 0.18, roll, scale: parkScale, flame: 0.3 });
          side = toX;
          bandRanges.push({ el, top, bottom, kind: dir > 0 ? "right" : "left" });
        });
        return keys;
      };

      // for each band: where its flight happens, so the title can be uncovered behind the rocket
      const bandRanges: { el: HTMLElement; top: number; bottom: number; kind: "right" | "left" | "up" }[] = [];

      const poseAt = (keys: Key[], at: number): Pose => {
        if (!keys.length) return { x: 0, y: 3, angle: 0, roll: 0, scale: 0, flame: 0 };
        if (at <= keys[0].at) return keys[0];
        for (let i = 1; i < keys.length; i++) {
          if (at <= keys[i].at) {
            const a = keys[i - 1];
            const b = keys[i];
            const t = smooth((at - a.at) / Math.max(1, b.at - a.at));
            return {
              x: lerp(a.x, b.x, t),
              y: lerp(a.y, b.y, t),
              angle: lerp(a.angle, b.angle, t),
              roll: lerp(a.roll, b.roll, t),
              scale: lerp(a.scale, b.scale, t),
              flame: lerp(a.flame, b.flame, t),
            };
          }
        }
        return keys[keys.length - 1];
      };

      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const cur: Pose = { x: 0.12, y: 0, angle: 0, roll: 0, scale: 0, flame: 0 };
      const clock = new THREE.Clock();
      const nozzle = new THREE.Vector3();
      const back = new THREE.Vector3();

      const animate = () => {
        if (disposed) return;
        raf = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);
        const time = clock.elapsedTime;

        const target = poseAt(buildKeys(), window.scrollY);
        const k = 1 - Math.pow(0.0015, dt); // frame-rate independent easing
        (Object.keys(cur) as (keyof Pose)[]).forEach((p) => (cur[p] = lerp(cur[p], target[p], k)));

        // uncover each band's title right behind the rocket
        const rocketPx = ((cur.x + 1) / 2) * window.innerWidth;
        const rocketPy = ((1 - cur.y) / 2) * window.innerHeight;
        for (const b of bandRanges) {
          let f: number;
          const sy = window.scrollY;
          if (sy <= b.top) f = 0;
          else if (sy >= b.bottom) f = 1;
          else {
            const card = b.el.firstElementChild?.firstElementChild as HTMLElement | null;
            const cr = card?.getBoundingClientRect();
            if (!cr || !cr.width) f = (sy - b.top) / (b.bottom - b.top);
            else if (b.kind === "right") f = (rocketPx - cr.left) / cr.width;
            else if (b.kind === "left") f = (cr.right - rocketPx) / cr.width;
            else f = (cr.bottom - rocketPy) / cr.height;
          }
          b.el.style.setProperty("--flight", Math.min(1, Math.max(0, f)).toFixed(3));
        }

        const bob = Math.sin(time * 1.3) * 0.04 * m;
        rocket.position.set(cur.x * halfW, cur.y * halfH + bob, 0);
        rocket.rotation.set(pointer.y * 0.15 * m, 0, cur.angle + pointer.x * -0.08 * m);
        holder.rotation.y = calm ? 0.6 : cur.roll + time * 0.25; // slow spin on its own axis plus the roll from the flight
        rocket.scale.setScalar(Math.max(0.0001, cur.scale));
        rocket.visible = cur.scale > 0.02;

        const f = cur.flame;
        flameGroup.visible = f > 0.05 && rocket.visible;
        const flick = calm ? 0.95 : 0.85 + Math.sin(time * 40) * 0.1 + Math.random() * 0.1;
        flameGroup.scale.set(0.8 + f * 0.2, (0.25 + f * 0.55) * flick, 0.8 + f * 0.2);

        // emit trail particles from the nozzle, flying out the back
        rocket.updateMatrixWorld();
        nozzle.set(0, -0.55, 0).applyMatrix4(rocket.matrixWorld);
        back.set(0, -1, 0).applyQuaternion(rocket.quaternion).normalize();
        const emit = rocket.visible ? Math.floor(f * 4) : 0;
        for (let e = 0; e < emit; e++) {
          const i = nextParticle++ % N;
          pPos[i * 3] = nozzle.x + (Math.random() - 0.5) * 0.06;
          pPos[i * 3 + 1] = nozzle.y + (Math.random() - 0.5) * 0.06;
          pPos[i * 3 + 2] = nozzle.z;
          const sp = 1.2 + Math.random() * 1.2;
          pVel[i * 3] = back.x * sp + (Math.random() - 0.5) * 0.4;
          pVel[i * 3 + 1] = back.y * sp + (Math.random() - 0.5) * 0.4;
          pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
          pLife[i] = 1;
        }
        for (let i = 0; i < N; i++) {
          if (pLife[i] <= 0) {
            pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0;
            continue;
          }
          pLife[i] -= dt * 1.4;
          pPos[i * 3] += pVel[i * 3] * dt;
          pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
          pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
          const l = Math.max(0, pLife[i]);
          // hot yellow fading to orange to nothing (additive, so black is invisible)
          pCol[i * 3] = l;
          pCol[i * 3 + 1] = l * l * 0.75;
          pCol[i * 3 + 2] = l * l * l * 0.35;
        }
        pGeo.attributes.position.needsUpdate = true;
        pGeo.attributes.color.needsUpdate = true;

        // background bodies scroll slower than the page
        const sy = window.scrollY;
        for (const d of drifters) {
          d.obj.position.y = d.baseY + sy * d.speed;
          d.obj.rotation.y += d.spin * dt * m;
          d.obj.rotation.x += d.spin * 0.3 * dt * m;
        }

        camera.position.x = pointer.x * 0.4 * m;
        camera.position.y = -pointer.y * 0.3 * m;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      animate();
      mountEl.dataset.ready = "true";

      cleanup = () => {
        window.removeEventListener("pointermove", onPointer);
        ro.disconnect();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    // wait until the page is idle so the 3D never slows down the first paint
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const handle = idle ? idle(() => void start(), { timeout: 1500 }) : window.setTimeout(() => void start(), 300);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (!idle) window.clearTimeout(handle);
      cleanup?.();
    };
  }, [reduce]);

  return <div ref={mountRef} className={styles.rocketLayer} aria-hidden />;
}
