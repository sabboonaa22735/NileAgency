import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiZap, FiShield, FiLayout } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Canvas } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FloatingBlob = ({ position, scale, color }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={1}
          chromaticAberration={0.3}
          iridescence={1}
          iridescenceIOR={1.5}
          color={color}
          transmission={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = () => {
  const points = new THREE.BufferGeometry();
  const count = 200;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }
  
  points.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  return (
    <points geometry={points}>
      <pointsMaterial size={0.02} color="#8ea2ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const ThreeDBackground = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={[isLight ? '#f0f4ff' : '#07111f']} />
      <fog attach="fog" args={[isLight ? '#f0f4ff' : '#07111f'], 8, 30]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color={isLight ? '#5b7cff' : '#8ea2ff'} />
      <pointLight position={[5, -5, 5]} intensity={0.5} color={isLight ? '#0ea5e9' : '#39c6ff'} />
      
      <Sparkles count={100} scale={15} size={1.5} speed={0.3} opacity={isLight ? 0.3 : 0.5} color={isLight ? '#5b7cff' : '#8ea2ff'} />
      
      <FloatingBlob position={[-3, 1.5, -4]} scale={0.7} color={isLight ? '#5b7cff' : '#8ea2ff'} />
      <FloatingBlob position={[2.5, -1, -3]} scale={0.5} color={isLight ? '#0ea5e9' : '#39c6ff'} />
      <FloatingBlob position={[0, 2, -5]} scale={0.4} color={isLight ? '#8b5cf6' : '#a78bfa'} />
      <FloatingBlob position={[-2, -2, -4]} scale={0.35} color={isLight ? '#06b6d4' : '#6ff7d2'} />
      
      <ParticleField />
    </Canvas>
  );
};

const AnimatedBackground = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          x: springX,
          y: springY,
        }}
      >
        <div className={`absolute left-[10%] top-[10%] h-64 w-64 rounded-full blur-[100px] ${isLight ? 'bg-indigo-400/20' : 'bg-indigo-500/20'}`} />
        <div className={`absolute right-[10%] top-[30%] h-48 w-48 rounded-full blur-[80px] ${isLight ? 'bg-cyan-400/15' : 'bg-cyan-500/15'}`} />
        <div className={`absolute left-[30%] bottom-[20%] h-56 w-56 rounded-full blur-[90px] ${isLight ? 'bg-violet-400/15' : 'bg-violet-500/15'}`} />
        <div className={`absolute right-[25%] bottom-[30%] h-40 w-40 rounded-full blur-[70px] ${isLight ? 'bg-emerald-400/15' : 'bg-emerald-500/15'}`} />
      </motion.div>
      
      <div className="absolute inset-0">
        <div className={`absolute inset-0 opacity-[${isLight ? '0.03' : '0.03]'}`} 
          style={{
            backgroundImage: `radial-gradient(${isLight ? '#5b7cff' : '#8ea2ff'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </div>
  );
};

export function PremiumAuthLayout({ children }) {
  const [activeTab, setActiveTab] = useState('login');
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`premium-auth-page min-h-screen flex ${isLight ? 'bg-gradient-to-br from-gray-50 via-indigo-50/30 to-white' : 'bg-gradient-to-br from-[#0a0f1d] via-[#0d1529] to-[#060912]'}`}>
      <AnimatedBackground />
      
      <motion.div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{ x: mousePos.x * 0.1, y: mousePos.y * 0.1 }}
      >
        <div className="canvas-container h-full">
          <ThreeDBackground />
        </div>
      </motion.div>

      <div className="relative z-10 flex w-full">
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] items-center justify-center p-8 xl:p-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >
            <motion.div
              className="mb-8 inline-flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 text-2xl font-bold text-white shadow-xl shadow-indigo-500/30">
                N
              </div>
              <span className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Nile Agency</span>
            </motion.div>
            
            <h1 className={`text-5xl xl:text-6xl font-bold leading-[1.1] mb-6 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {activeTab === 'login' ? (
                <>Welcome<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">back</span></>
              ) : (
                <>Join the<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">revolution</span></>
              )}
            </h1>
            
            <p className={`text-lg xl:text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-10 max-w-md`}>
              {activeTab === 'login' 
                ? 'Sign in to access your premium dashboard and experience the future of recruitment.'
                : 'Create your account and be part of the next generation of hiring platform.'}
            </p>

            <div className="flex gap-6">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '10K+', label: 'Jobs Posted' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`glass-card-premium rounded-2xl p-5 ${isLight ? 'bg-white/70' : 'bg-white/5'}`}
                >
                  <div className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-1`}>{stat.value}</div>
                  <div className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 xl:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md ${isLight ? 'glass-card-premium' : 'glass-morphism-strong'} rounded-3xl p-8 xl:p-10`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`flex rounded-2xl p-1 ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                {['login', 'register'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab
                        ? isLight ? 'text-gray-900' : 'text-white'
                        : isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 rounded-xl ${isLight ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10 capitalize">{tab}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'} transition-colors`}
              >
                {isLight ? '🌙' : '☀️'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function AuthForm({ children }) {
  return <>{children}</>;
}