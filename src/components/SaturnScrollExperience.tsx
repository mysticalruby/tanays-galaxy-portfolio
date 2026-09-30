"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { celestialTexturePaths, makeCelestialCanvas } from "@/lib/celestialTextures";
import styles from "./SaturnScrollExperience.module.css";

const chapters = [
  {
    code: "01",
    title: "Start with the whole thing.",
    text: "I like projects where I can first see the entire system, and then slowly get into why each part is there, this site works the same way.",
    href: "/about",
    link: "About me",
  },
  {
    code: "02",
    title: "Guidance is the part that decides where everything goes.",
    text: "For me that is the modeling, code, CAD, electronics and testing, they are different tools but usually I am using several of them on the same problem.",
    href: "/skills",
    link: "See my skills",
  },
  {
    code: "03",
    title: "Then the individual stages start to matter.",
    text: "These are the larger projects and competitions, including work that went well and also the iterations which did not, because that is usually where most of the engineering actually happened.",
    href: "/experience",
    link: "Explore my projects",
  },
  {
    code: "04",
    title: "A mission leaves some kind of record behind.",
    text: "The awards are not the only reason I do any of this, but they are a useful record of the teams, competitions and problems which pushed the work further.",
    href: "/awards",
    link: "View mission patches",
  },
  {
    code: "05",
    title: "The next launch is still being worked on.",
    text: "There are a lot of things I have only started learning, which is why I keep a separate place for tutorials, small experiments and whatever I want to understand next.",
    href: "/exploring",
    link: "Currently exploring",
  },
] as const;

export function SaturnScrollExperience({
  tagline,
  heroLine,
}: {
  tagline: string;
  heroLine: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const mount = mountRef.current;
    if (!root || !mount) return;
    const rootEl = root;
    const mountEl = mount;

    let disposed = false;
    let frame = 0;
    let renderer: import("three").WebGLRenderer | undefined;
    let progress = 0;
    let resizeObserver: ResizeObserver | undefined;
    let removeScroll: (() => void) | undefined;

    async function start() {
      const THREE = await import("three");
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100);
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.domElement.className = styles.webgl;
      mountEl.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xf4f6fb, 0x0a1a3f, 2.1));
      const key = new THREE.DirectionalLight(0xffffff, 4.5);
      key.position.set(4, 6, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffb63b, 3.6);
      rim.position.set(-5, 0, -3);
      scene.add(rim);

      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(1000 * 3);
      for (let i = 0; i < starPositions.length; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 22;
        starPositions[i + 1] = (Math.random() - 0.5) * 18;
        starPositions[i + 2] = (Math.random() - 0.5) * 13 - 3;
      }
      starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3),
      );
      const starMaterial = new THREE.PointsMaterial({
        color: 0xf4f6fb,
        size: 0.012,
        transparent: true,
        opacity: 0.24,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      let earthTexture: import("three").Texture = new THREE.CanvasTexture(makeCelestialCanvas("earth"));
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 64, 64),
        new THREE.MeshStandardMaterial({
          map: earthTexture,
          roughness: 0.88,
          metalness: 0,
        }),
      );
      earth.position.set(-.5, -3.9, -4);
      scene.add(earth);
      new THREE.TextureLoader().loadAsync(celestialTexturePaths.earth).then((loaded) => {
        if (disposed) return loaded.dispose();
        loaded.colorSpace = THREE.SRGBColorSpace;
        earth.material.map = loaded;
        earth.material.needsUpdate = true;
        earthTexture.dispose();
        earthTexture = loaded;
      }).catch(() => {});

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.47, 64, 64),
        new THREE.MeshBasicMaterial({
          color: 0x92c8ff,
          transparent: true,
          opacity: 0.17,
          side: THREE.BackSide,
        }),
      );
      atmosphere.position.copy(earth.position);
      scene.add(atmosphere);

      let moonTexture: import("three").Texture = new THREE.CanvasTexture(makeCelestialCanvas("moon"));
      moonTexture.colorSpace = THREE.SRGBColorSpace;
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(.52, 48, 32),
        new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 1 }),
      );
      moon.position.set(2.45, 1.45, -3.5);
      scene.add(moon);
      new THREE.TextureLoader().loadAsync(celestialTexturePaths.moon).then((loaded) => {
        if (disposed) return loaded.dispose();
        loaded.colorSpace = THREE.SRGBColorSpace;
        moon.material.map = loaded;
        moon.material.bumpMap = loaded;
        moon.material.bumpScale = .018;
        moon.material.needsUpdate = true;
        moonTexture.dispose();
        moonTexture = loaded;
      }).catch(() => {});

      const gltf = await new GLTFLoader().loadAsync("/saturn-v-nasa.glb");
      if (disposed) return;
      const rocketModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(rocketModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      rocketModel.position.sub(center);
      const rocket = new THREE.Group();
      rocket.add(rocketModel);
      rocket.scale.setScalar(3.6 / maxDimension);
      scene.add(rocket);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.17, 1.4, 24, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xff4a2b,
          transparent: true,
          opacity: 0.72,
          side: THREE.DoubleSide,
        }),
      );
      flame.rotation.z = Math.PI;
      flame.position.y = -3.15;
      scene.add(flame);

      const resize = () => {
        if (!renderer || !mountEl) return;
        const width = mountEl.clientWidth;
        const height = mountEl.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        moon.position.x = width < 760 ? 1.25 : 2.45;
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mountEl);
      resize();

      const updateProgress = () => {
        const rect = rootEl.getBoundingClientRect();
        const distance = Math.max(1, rootEl.offsetHeight - window.innerHeight);
        progress = Math.min(1, Math.max(0, -rect.top / distance));
        setActive(Math.min(chapters.length - 1, Math.floor(progress * chapters.length)));
        setStarted(progress > 0.0001);
      };
      window.addEventListener("scroll", updateProgress, { passive: true });
      removeScroll = () => window.removeEventListener("scroll", updateProgress);
      updateProgress();
      setReady(true);

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed || !renderer) return;
        frame = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const smooth = progress * progress * (3 - 2 * progress);

        rocket.rotation.y = smooth * Math.PI * 2.05 + Math.sin(time * 0.25) * 0.06;
        rocket.rotation.z = Math.sin(progress * Math.PI) * -0.15;
        rocket.scale.setScalar((3.6 + smooth * 7.6) / maxDimension);
        const openingOffset = Math.max(0, 1 - progress * 12) * 0.38;
        rocket.position.x = openingOffset + Math.sin(progress * Math.PI * 2) * 0.28;
        rocket.position.y = 0.08 - smooth * 0.22 + Math.sin(time * 0.7) * 0.025;

        camera.position.x = Math.sin(progress * Math.PI * 1.6) * 0.38;
        camera.position.y = 0.1 + Math.sin(progress * Math.PI) * 0.42;
        camera.position.z = 3.8 - Math.sin(progress * Math.PI) * 0.42;
        camera.lookAt(0, 0.05, 0);

        const launch = Math.max(0, 1 - progress * 5);
        flame.visible = launch > 0.01;
        flame.scale.y = 0.72 + Math.sin(time * 20) * 0.18;
        flame.material.opacity = 0.32 + launch * 0.55;

        earth.position.y = -3.9 + smooth * 1.5;
        atmosphere.position.copy(earth.position);
        earth.rotation.y = time * 0.025;
        moon.rotation.y = time * 0.035;
        stars.rotation.y = time * 0.012;
        stars.position.y = smooth * 1.5;

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        starGeometry.dispose();
        starMaterial.dispose();
        earth.geometry.dispose();
        earth.material.dispose();
        earthTexture.dispose();
        atmosphere.geometry.dispose();
        atmosphere.material.dispose();
        moon.geometry.dispose();
        moon.material.dispose();
        moonTexture.dispose();
      };
    }

    let cleanScene: (() => void) | undefined;
    start()
      .then((cleanup) => {
        cleanScene = cleanup;
      })
      .catch((error) => {
        console.error("NASA Saturn V scroll scene failed", error);
        setFailed(true);
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      removeScroll?.();
      resizeObserver?.disconnect();
      cleanScene?.();
      renderer?.dispose();
      if (renderer?.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.journey}>
      <div className={styles.sticky}>
        <div ref={mountRef} className={styles.scene} aria-hidden="true" />
        <div className={styles.shade} />
        {!ready && !failed && (
          <div className={styles.loading}>Preparing Saturn V…</div>
        )}
        {failed && (
          <div className={styles.loading}>The 3D launch view could not start.</div>
        )}

        <header className={`${styles.hero} ${!started ? styles.showHero : ""}`}>
          <p>{tagline}</p>
          <h1>Tanay Mangal</h1>
          <span>{heroLine}</span>
          <small>Scroll to launch ↓</small>
        </header>

        <div className={styles.chapters}>
          {chapters.map((chapter, index) => (
            <article
              key={chapter.code}
              className={`${styles.chapter} ${index % 2 ? styles.right : styles.left} ${started && active === index ? styles.visible : ""}`}
              aria-hidden={!started || active !== index}
            >
              <p>{chapter.code}</p>
              <h2>{chapter.title}</h2>
              <span>{chapter.text}</span>
              <Link href={chapter.href}>{chapter.link} →</Link>
            </article>
          ))}
        </div>

        <div className={styles.meter} aria-hidden="true">
          <span style={{ height: `${((active + 1) / chapters.length) * 100}%` }} />
        </div>
        <p className={styles.credit}>
          Saturn V model: NASA / Michael D. Carbajal
        </p>
      </div>

      <div className={styles.scrollTrack} aria-hidden="true">
        {chapters.map((chapter) => (
          <div key={chapter.code} />
        ))}
      </div>
    </div>
  );
}
