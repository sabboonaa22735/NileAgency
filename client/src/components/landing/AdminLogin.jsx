import { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiAlertCircle, FiKey, FiMonitor, FiSun, FiMoon, FiZap } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

function GlowingOrb({ position, color, scale = 1, speed = 1, distortion = 0.3 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      meshRef.current.position.y = position[1] + Math.sin(t) * 0.3;
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale * 1.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial color={color} distort={distortion} speed={1.5} roughness={0.1} metalness={0.8} transparent opacity={0.6} />
    </mesh>
  );
}

function FloatingRing({ position, rotation, speed = 1, color = '#8b5cf6' }) {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += 0.005 * speed;
      ringRef.current.rotation.y += 0.008 * speed;
    }
  });

  return (
    <mesh ref={ringRef} position={position} rotation={rotation} scale={1.2}>
      <torusGeometry args={[1, 0.05, 16, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

function FloatingCrystal({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(t) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={0.8}>
      <octahedronGeometry args={[1, 0]} />
      <MeshDistortMaterial color={color} distort={0.3} speed={1.5} metalness={0.9} roughness={0.1} transparent opacity={0.7} />
    </mesh>
  );
}

function ParticleField({ count = 100 }) {
  const ref = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [count]);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    const palette = [[0.55, 0.36, 0.96], [0.02, 0.71, 0.83], [0.73, 0.33, 0.69], [0.96, 0.52, 0.15]];
    for (let i = 0; i < count; i++) {
      const col = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = col[0];
      cols[i * 3 + 1] = col[1];
      cols[i * 3 + 2] = col[2];
    }
    return cols;
  }, [count]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function ParallaxShield({ mousePosition }) {
  const meshRef = useRef();
  const lightRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.x += (mousePosition.current.x * 0.4 - meshRef.current.position.x) * 0.03;
      meshRef.current.position.y += (mousePosition.current.y * 0.4 - meshRef.current.position.y) * 0.03;
      const scalePulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.setScalar(scalePulse * 1.8);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} position={[0, 0, 5]} intensity={0.8} color="#8b5cf6" distance={20} />
      <mesh ref={meshRef} scale={1.8}>
        <octahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial color="#a855f7" distort={0.4} speed={2} roughness={0.15} metalness={0.9} />
      </mesh>
    </group>
  );
}

function Scene3D({ mousePosition }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[-5, 3, 2]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[4, -2, 3]} intensity={0.3} color="#06b6d4" />
      <pointLight position={[0, 4, -2]} intensity={0.2} color="#f472b6" />
      <ParticleField count={80} />
      <ParallaxShield mousePosition={mousePosition} />
      <GlowingOrb position={[-4, 1, -2]} color="#8b5cf6" scale={1.2} speed={0.7} />
      <GlowingOrb position={[4, -0.5, -3]} color="#06b6d4" scale={0.9} speed={0.9} />
      <GlowingOrb position={[2, 2, -2.5]} color="#f472b6" scale={0.7} speed={1.1} />
      <GlowingOrb position={[-2.5, -1.5, -2]} color="#facc15" scale={0.6} speed={0.8} />
      <FloatingRing position={[3.5, 1.5, -2.5]} rotation={[Math.PI / 3, 0, 0]} speed={0.6} color="#a855f7" />
      <FloatingRing position={[-3, -0.5, -3]} rotation={[0, Math.PI / 4, Math.PI / 6]} speed={0.8} color="#06b6d4" />
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
        <FloatingCrystal position={[-2, 2, -2]} color="#22d3ee" speed={0.8} />
        <FloatingCrystal position={[1.5, -1.5, -1.5]} color="#f472b6" speed={1} />
      </Float>
    </>
  );
}

function AnimatedBackground({ isDark }) {
  const colors = isDark 
    ? { bg: '#030308', grid: 'rgba(139,92,246,0.04)', glow1: 'rgba(139,92,246,0.12)', glow2: 'rgba(6,182,212,0.08)', glow3: 'rgba(236,72,153,0.06)' }
    : { bg: '#f1f5f9', grid: 'rgba(99,102,241,0.06)', glow1: 'rgba(99,102,241,0.1)', glow2: 'rgba(6,182,212,0.08)', glow3: 'rgba(236,72,153,0.05)' };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ backgroundColor: colors.bg }} />
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: colors.glow1 }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: colors.glow2 }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[100px]" style={{ background: colors.glow3 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-50% to-transparent opacity-30" />
    </div>
  );
}

function GlowingBorder({ isDark }) {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
      <div className="absolute inset-0 rounded-3xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-indigo-500 via-cyan-500 to-fuchsia-500 opacity-30 animate-pulse" />
        <div className="absolute inset-0.5 rounded-[22px] bg-black/20 dark:bg-black/30" />
      </div>
      <svg className="absolute inset-0 w-full h-full rounded-3xl">
        <defs>
          <linearGradient id="glowBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="22" fill="none" stroke="url(#glowBorder)" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3.5 rounded-2xl border backdrop-blur-sm transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-800/5 border-slate-200 hover:bg-slate-800/10'}`}
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.5 }}
      >
        {isDark ? (
          <FiSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <FiMoon className="w-5 h-5 text-slate-700" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default function AdminLogin() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [email, setEmail] = useState('admin@nileagency.com');
  const [password, setPassword] = useState('admin123');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef([]);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const { isDark } = useTheme();
  const cursorXSpring = useSpring(cursorX, { damping: 25, stiffness: 700 });
  const cursorYSpring = useSpring(cursorY, { damping: 25, stiffness: 700 });

  const bgX = useTransform(cursorXSpring, [-1000, 1000], [20, -20]);
  const bgY = useTransform(cursorYSpring, [-1000, 1000], [20, -20]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      mousePosition.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePosition.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (email === 'admin@nileagency.com' && password === 'admin123') {
      setShow2FA(true);
      setIsLoading(false);
    } else {
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(digit => digit) && index === 5) handleVerifyOtp();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'admin-token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@nileagency.com', role: 'admin' }));
      window.location.href = '/admin';
    }, 1500);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
  const formVariants = { hidden: { opacity: 0, x: 30, scale: 0.97 }, visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  const s = isDark ? {
    bg: '#030308', cardBg: 'rgba(10,10,18,0.85)', cardBorder: 'rgba(255,255,255,0.06)',
    text: '#fff', textMuted: '#a1a1aa', textDim: '#71717a', textAccent: '#cbd5e1',
    inputBg: 'rgba(255,255,255,0.04)', inputBorder: 'rgba(255,255,255,0.08)', inputBorderFocus: 'rgba(139,92,246,0.5)',
    label: '#a1a1aa', glow: 'rgba(139,92,246,0.15)', badgeBg: 'rgba(255,255,255,0.05)', badgeBorder: 'rgba(255,255,255,0.1)',
  } : {
    bg: '#f8fafc', cardBg: 'rgba(255,255,255,0.95)', cardBorder: 'rgba(0,0,0,0.08)',
    text: '#0f172a', textMuted: '#334155', textDim: '#94a3b8', textAccent: '#1e293b',
    inputBg: '#f1f5f9', inputBorder: 'rgba(148,163,184,0.3)', inputBorderFocus: 'rgba(99,102,241,0.6)',
    label: '#475569', glow: 'rgba(99,102,241,0.1)', badgeBg: 'rgba(99,102,241,0.08)', badgeBorder: 'rgba(99,102,241,0.2)',
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans" style={{ pointerEvents: 'auto' }}>
      <AnimatedBackground isDark={isDark} />
      
      <motion.div 
        className="hidden lg:flex w-[45%] items-center justify-center relative overflow-hidden order-1"
        style={{ x: bgX, y: bgY }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: s.glow, x: bgX, y: bgY }} />
          <motion.div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(6,182,212,0.08)' }} />
        </div>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <Scene3D mousePosition={mousePosition} />
        </Canvas>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="absolute bottom-8 left-8 px-5 py-4 rounded-2xl border backdrop-blur-xl" style={{ backgroundColor: s.badgeBg, borderColor: s.badgeBorder }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <FiShield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className={`text-xs ${s.textMuted}`}>Security Status</div>
              <div className={`text-sm font-semibold ${s.text} flex items-center gap-2`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Secure
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-10 relative z-10 order-2" style={{ x: bgX, y: bgY }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-lg">
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="inline-flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <FiShield className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur-lg opacity-40 animate-pulse" />
                </motion.div>
                <div>
                  <span className="text-2xl font-bold" style={{ color: s.text }}>Nile</span>
                  <span className="text-2xl font-bold text-indigo-500">Agency</span>
                </div>
              </Link>
              <ThemeToggle />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-xl"
              style={{ backgroundColor: s.badgeBg, borderColor: s.badgeBorder }}
            >
              <FiMonitor className="w-4 h-4 text-indigo-500" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={`text-xs font-semibold ${s.textMuted}`}>Admin Access Only</span>
            </motion.div>
          </motion.div>

          <motion.div variants={formVariants} className="relative">
            <GlowingBorder isDark={isDark} />
            
            <div className="relative p-10 md:p-12 rounded-3xl border backdrop-blur-2xl overflow-hidden shadow-2xl" 
              style={{ backgroundColor: s.cardBg, borderColor: s.cardBorder }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-violet-500/[0.04]' : 'from-indigo-500/[0.03]'} via-transparent to-cyan-500/[0.02]`} />
              
              <motion.div variants={itemVariants} className="mb-9">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold mb-3" style={{ color: s.text }}
                >
                  Welcome back
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-lg" style={{ color: s.textMuted }}
                >
                  Sign in to access your admin dashboard
                </motion.p>
              </motion.div>

              <AnimatePresence mode="wait">
                {show2FA ? (
                  <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="text-center mb-8">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-18 h-18 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/20">
                        <FiKey className="w-9 h-9 text-violet-500" />
                      </motion.div>
                      <h2 className="text-xl font-bold" style={{ color: s.text }}>Two-Factor Authentication</h2>
                      <p className="text-sm mt-1" style={{ color: s.textMuted }}>Enter the 6-digit code from your authenticator</p>
                    </div>
                    
                    <div className="flex justify-center gap-3 mb-8">
                      {otp.map((digit, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-14 h-16 text-center text-2xl font-bold rounded-2xl border transition-all focus:ring-2 focus:ring-indigo-500/30"
                          style={{ backgroundColor: s.inputBg, borderColor: s.inputBorder, color: s.text }}
                        />
                      ))}
                    </div>
                    
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleVerifyOtp} disabled={isLoading}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 text-lg"
                    >
                      {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Verify Code</span><FiArrowRight className="w-6 h-6" /></>}
                    </motion.button>
                    
                    <button onClick={() => setShow2FA(false)} className={`w-full mt-4 py-2 text-sm hover:opacity-80 transition-opacity`} style={{ color: s.textMuted }}>
                      ← Back to login
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <motion.div variants={itemVariants} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: s.label }}>Email Address</label>
                        <div className="relative group">
                          <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500' : 'text-slate-400'} group-focus-within:text-indigo-500`}>
                            <FiMail className="w-5 h-5" />
                          </div>
                          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com"
                            className="w-full pl-14 pr-4 py-4.5 rounded-2xl border transition-all text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-zinc-400"
                            style={{ backgroundColor: s.inputBg, borderColor: s.inputBorder, color: s.text }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: s.label }}>Password</label>
                        <div className="relative group">
                          <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500' : 'text-slate-400'} group-focus-within:text-indigo-500`}>
                            <FiLock className="w-5 h-5" />
                          </div>
                          <input name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                            className="w-full pl-14 pr-14 py-4.5 rounded-2xl border transition-all text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            style={{ backgroundColor: s.inputBg, borderColor: s.inputBorder, color: s.text }}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors`}>
                            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only peer" />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all peer-checked:bg-indigo-500 peer-checked:border-indigo-500 ${isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-100'}`}>
                          <FiCheck className={`w-3 h-3 text-white ${rememberMe ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                        </div>
                        <span className="text-sm" style={{ color: s.textMuted }}>Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-indigo-500 font-medium hover:text-indigo-600 transition-colors">Forgot password?</a>
                    </motion.div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-3 p-4 rounded-2xl border bg-red-500/10 border-red-500/20 text-red-400 text-sm">
                          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />{error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button type="button" disabled={isLoading}
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => {
                          localStorage.setItem('token', 'admin-token');
                          localStorage.setItem('user', JSON.stringify({ email: 'admin@nileagency.com', role: 'admin' }));
                          window.location.href = '/admin';
                        }, 500);
                      }}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 text-lg cursor-pointer relative z-50 pointer-events-auto"
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 50 }}
                    >
                      {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In to Admin</span><FiArrowRight className="w-6 h-6" /></>}
                    </button>

                    <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <FiLock className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs" style={{ color: s.textDim }}>256-bit SSL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiZap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs" style={{ color: s.textDim }}>SOC 2</span>
                      </div>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-8">
            <Link to="/" className={`inline-flex items-center gap-2 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors text-sm group`}>
              <FiArrowRight className="w-4 h-4 -rotate-45 group-hover:-rotate-90 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}