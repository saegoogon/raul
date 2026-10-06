import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterState } from "@shared/types";
import { useLiveCharacter } from "./useLiveCharacter";

export function BlackyRig({
  state,
  reduceMotion,
  compact,
}: {
  state: CharacterState;
  reduceMotion: boolean;
  compact?: boolean;
}) {
  const { tick } = useLiveCharacter(state, reduceMotion);
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const hair = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Group>(null);
  const eyeR = useRef<THREE.Group>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);

  const hide = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#141414",
        roughness: 0.78,
        metalness: 0.02,
        clearcoat: 0.18,
        clearcoatRoughness: 0.5,
        sheen: 0.35,
        sheenColor: new THREE.Color("#2a2a2a"),
      }),
    [],
  );
  const eyeWhite = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#f3f2ee", roughness: 0.22, metalness: 0.05, clearcoat: 0.4 }),
    [],
  );
  const iris = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#111111",
        roughness: 0.16,
        emissive: new THREE.Color("#1c1c1c"),
        emissiveIntensity: 0.2,
      }),
    [],
  );
  const gloss = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.04,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.55,
      }),
    [],
  );
  const smile = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ecece8",
        roughness: 0.35,
        emissive: new THREE.Color("#cfcfc8"),
        emissiveIntensity: 0.12,
      }),
    [],
  );

  useFrame(({ clock, camera: cam }) => {
    const p = tick(clock.getElapsedTime());
    if (root.current) {
      root.current.position.y = -0.08 + p.breath + p.bounce;
      root.current.rotation.y = p.bodySway;
      root.current.rotation.x = p.lean;
    }
    if (head.current) head.current.rotation.set(p.headPitch, p.headYaw, p.headRoll);
    if (hair.current) {
      hair.current.rotation.z = (p.headYaw - p.hairLag) * 0.5;
    }
    const lookX = p.gazeX * 0.28;
    const lookY = p.gazeY * 0.2;
    if (eyeL.current) eyeL.current.rotation.set(-lookY, lookX, 0);
    if (eyeR.current) eyeR.current.rotation.set(-lookY, lookX, 0);
    if (lidL.current) lidL.current.rotation.x = -0.25 + p.blinkL * 1.35;
    if (lidR.current) lidR.current.rotation.x = -0.25 + p.blinkR * 1.35;
    if (browL.current) {
      browL.current.position.y = 0.16 + p.brow * 0.035;
      browL.current.rotation.z = 0.16 - p.smile * 0.1 + p.brow * 0.18;
    }
    if (browR.current) {
      browR.current.position.y = 0.16 + p.brow * 0.035;
      browR.current.rotation.z = -0.16 + p.smile * 0.1 - p.brow * 0.18;
    }
    if (mouth.current) {
      mouth.current.scale.set(0.85 + p.smile * 0.25 + p.mouthWide * 0.35, 0.45 + p.mouthOpen * 1.1, 1);
      mouth.current.position.y = -0.08 - p.smile * 0.012;
    }
    cam.position.set(p.camX, compact ? 0.12 : p.camY, compact ? 2.2 : p.camZ);
    cam.lookAt(0, 0.06, 0);
  });

  return (
    <group>
      <hemisphereLight args={["#3d3d3b", "#070707", 0.62]} />
      <directionalLight position={[1.5, 2.1, 1.6]} intensity={1.55} color="#f7f4ee" />
      <directionalLight position={[-1.8, 0.5, 0.8]} intensity={0.35} color="#8d8d8d" />
      <directionalLight position={[0.2, 1.2, -2]} intensity={1.35} color="#d8d8d8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0.04]}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} />
      </mesh>

      <group ref={root}>
        <group ref={head}>
          <mesh scale={[1, 0.92, 0.9]} material={hide}>
            <sphereGeometry args={[0.42, 32, 24]} />
          </mesh>
          <mesh position={[0, 0.02, 0.04]} scale={[0.92, 0.86, 0.78]} material={hide}>
            <sphereGeometry args={[0.4, 28, 20]} />
          </mesh>
          <group ref={hair}>
            <mesh position={[-0.3, 0.26, -0.02]} scale={[1, 0.7, 0.8]} material={hide}>
              <sphereGeometry args={[0.1, 12, 10]} />
            </mesh>
            <mesh position={[0.3, 0.26, -0.02]} scale={[1, 0.7, 0.8]} material={hide}>
              <sphereGeometry args={[0.1, 12, 10]} />
            </mesh>
          </group>

          <mesh ref={browL} position={[-0.12, 0.16, 0.3]} rotation={[0, 0, 0.16]} material={hide}>
            <capsuleGeometry args={[0.012, 0.07, 3, 6]} />
          </mesh>
          <mesh ref={browR} position={[0.12, 0.16, 0.3]} rotation={[0, 0, -0.16]} material={hide}>
            <capsuleGeometry args={[0.012, 0.07, 3, 6]} />
          </mesh>

          <group position={[-0.11, 0.055, 0.33]} scale={[1.05, 0.82, 0.7]}>
            <mesh material={eyeWhite}>
              <sphereGeometry args={[0.07, 18, 14]} />
            </mesh>
            <group ref={eyeL}>
              <mesh position={[0, 0, 0.038]} material={iris}>
                <sphereGeometry args={[0.036, 14, 12]} />
              </mesh>
              <mesh position={[0.014, 0.014, 0.062]} material={gloss}>
                <sphereGeometry args={[0.012, 8, 8]} />
              </mesh>
            </group>
            <mesh ref={lidL} position={[0, 0.05, 0.01]} rotation={[-0.25, 0, 0]} material={hide}>
              <sphereGeometry args={[0.074, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            </mesh>
          </group>
          <group position={[0.11, 0.055, 0.33]} scale={[1.05, 0.82, 0.7]}>
            <mesh material={eyeWhite}>
              <sphereGeometry args={[0.07, 18, 14]} />
            </mesh>
            <group ref={eyeR}>
              <mesh position={[0, 0, 0.038]} material={iris}>
                <sphereGeometry args={[0.036, 14, 12]} />
              </mesh>
              <mesh position={[0.014, 0.014, 0.062]} material={gloss}>
                <sphereGeometry args={[0.012, 8, 8]} />
              </mesh>
            </group>
            <mesh ref={lidR} position={[0, 0.05, 0.01]} rotation={[-0.25, 0, 0]} material={hide}>
              <sphereGeometry args={[0.074, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            </mesh>
          </group>

          <mesh ref={mouth} position={[0, -0.08, 0.36]} rotation={[0, 0, Math.PI]} material={smile}>
            <torusGeometry args={[0.09, 0.012, 8, 18, Math.PI]} />
          </mesh>
        </group>

        <mesh position={[0, -0.46, 0.02]} material={hide}>
          <capsuleGeometry args={[0.16, 0.12, 6, 12]} />
        </mesh>
      </group>
    </group>
  );
}
