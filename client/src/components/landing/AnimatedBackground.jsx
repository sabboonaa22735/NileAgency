import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, scale, speed, distort, isDark }) {
  const meshRef = useRef();
  const initialPosition = useMemo(() => position, [position]);
  const opacity = isDark ? 0.9 : 0.6;
  
  useFrame((state) => {
    if (meshRef.current) {
      const mouseX = state.mouse.x * 0.3;
      const mouseY = state.mouse.y * 0.3;
      
      meshRef.current.position.x = initialPosition[0] + mouseX;
      meshRef.current.position.y = initialPosition[1] + mouseY;
      
      meshRef.current.rotation.x += 0.0008 * speed;
      meshRef.current.rotation.y += 0.001 * speed;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 3]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={1.5}
          roughness={isDark ? 0.3 : 0.5}
          metalness={isDark ? 0.9 : 0.5}
          opacity={opacity}
          transparent
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 80, particleColor }) {
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0003;
      particlesRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={particleColor}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function GlowOrb({ position, color, scale, speed = 1, isDark }) {
  const meshRef = useRef();
  const initialPos = useRef(position);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * 0.2 * speed;
      const mouseX = state.mouse.x * 0.2;
      const mouseY = state.mouse.y * 0.2;
      
      meshRef.current.position.x = initialPos.current[0] + Math.sin(t) * 0.5 + mouseX;
      meshRef.current.position.y = initialPos.current[1] + Math.cos(t) * 0.5 + mouseY;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isDark ? 0.12 : 0.08}
      />
    </mesh>
  );
}

function Scene({ isDark }) {
  const particleColor = isDark ? '#a78bfa' : '#6366f1';
  const lightColors = isDark 
    ? { purple: '#8b5cf6', cyan: '#06b6d4', pink: '#f472b6' }
    : { purple: '#818cf8', cyan: '#22d3ee', pink: '#f472b6' };

  return (
    <>
      <ambientLight intensity={isDark ? 0.2 : 0.4} />
      <directionalLight position={[10, 10, 5]} intensity={isDark ? 0.4 : 0.6} />
      <pointLight position={[-10, -10, -5]} intensity={isDark ? 0.3 : 0.2} color={lightColors.purple} />
      <pointLight position={[10, -5, 5]} intensity={isDark ? 0.2 : 0.15} color={lightColors.cyan} />
      <pointLight position={[-5, 10, 5]} intensity={isDark ? 0.15 : 0.1} color={lightColors.pink} />
      
      <Particles count={60} particleColor={particleColor} />
      
      <FloatingShape
        position={[-5, 2, -4]}
        color={lightColors.purple}
        scale={0.7}
        speed={1.2}
        distort={0.25}
        isDark={isDark}
      />
      <FloatingShape
        position={[5, -2, -3]}
        color={lightColors.cyan}
        scale={0.5}
        speed={1.5}
        distort={0.3}
        isDark={isDark}
      />
      <FloatingShape
        position={[-3, -3, -5]}
        color={lightColors.pink}
        scale={0.4}
        speed={0.8}
        distort={0.2}
        isDark={isDark}
      />
      <FloatingShape
        position={[4, 3, -4]}
        color={lightColors.purple}
        scale={0.6}
        speed={1}
        distort={0.28}
        isDark={isDark}
      />
      
      <GlowOrb position={[-6, 0, -6]} color={lightColors.purple} scale={4} speed={0.8} isDark={isDark} />
      <GlowOrb position={[6, 2, -5]} color={lightColors.cyan} scale={3} speed={1} isDark={isDark} />
      <GlowOrb position={[0, -5, -4]} color={lightColors.pink} scale={2.5} speed={1.2} isDark={isDark} />
      <GlowOrb position={[-4, 5, -3]} color={lightColors.purple} scale={2} speed={0.6} isDark={isDark} />
    </>
  );
}

export default function AnimatedBackground({ isDark = true }) {
  if (!isDark) return null;
  
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene isDark={isDark} />
      </Canvas>
    </div>
  );
}