'use client';

import { Float, Environment, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function MindParticles() {
  const count = typeof window !== 'undefined' && window.innerWidth < 640 ? 800 : 3000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const r = 2.5 + Math.random() * 0.5;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        temp.push({ t: Math.random() * 100, factor: 0.1 + Math.random(), speed: 0.01 + Math.random() / 200, x, y, z });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, x, y, z } = particle;
      t = particle.t += speed / 2;
      const s = Math.cos(t);
      
      dummy.position.set(
        x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
    </instancedMesh>
  );
}

function SceneController({ scrollProgress }: { scrollProgress: number }) {
  const brainRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const targetY = useRef(0);
  const targetZ = useRef(8);
  
  useFrame((state) => {
     if (!brainRef.current) return;
     
     // Smooth interpolation targets
     targetRotation.current = scrollProgress * Math.PI * 2;
     targetY.current = scrollProgress * 2 - 1;
     targetZ.current = THREE.MathUtils.lerp(8, 5, scrollProgress);
     
     // Apply smooth lerp
     brainRef.current.rotation.y = THREE.MathUtils.lerp(brainRef.current.rotation.y, targetRotation.current, 0.05);
     brainRef.current.position.y = THREE.MathUtils.lerp(brainRef.current.position.y, targetY.current, 0.05);
     state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ.current, 0.05);
  });

  return (
      <group ref={brainRef}>
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
            <MindParticles />
        </Float>
      </group>
  );
}

export function Scene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <Sparkles count={500} scale={12} size={2} speed={0.4} opacity={0.15} color="#10b981" />
      <SceneController scrollProgress={scrollProgress} />
      <Environment preset="city" />
    </>
  );
}
