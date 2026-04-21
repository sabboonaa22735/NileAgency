import AnimatedBackground from '../components/landing/AnimatedBackground';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Showcase from '../components/landing/Showcase';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import ChatBot from '../components/landing/ChatBot';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen relative transition-colors duration-500 ${isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'}`}>
      <AnimatedBackground isDark={isDark} />
      
      <Navbar />
      
      <main>
        <Hero isDark={isDark} />
        <Features isDark={isDark} />
        <HowItWorks isDark={isDark} />
        <Showcase isDark={isDark} />
        <Testimonials isDark={isDark} />
        <Pricing isDark={isDark} />
        <CTA isDark={isDark} />
      </main>
      
      <Footer isDark={isDark} />
      <ChatBot isDark={isDark} />
    </div>
  );
}