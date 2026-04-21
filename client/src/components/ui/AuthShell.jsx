import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import { Reveal, Scene, TiltCard } from './Scene';

export default function AuthShell({
  title,
  subtitle,
  badge = 'Nile Agency',
  sideTitle,
  sideBody,
  sideStats = [],
  children
}) {
  return (
    <Scene className="px-6 py-10 md:px-10 md:py-12" contentClassName="mx-auto max-w-7xl">
      <div className="grid min-h-[calc(100vh-4rem)] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <Reveal className="hidden lg:block">
          <TiltCard className="glass-morphism-strong p-10 min-h-[620px] overflow-hidden glow-border">
            <div className="absolute inset-x-8 top-8 flex items-center justify-between">
              <div className="badge-premium">
                <span />
                {badge}
              </div>
              <Link to="/" className="btn-secondary !min-h-0 px-4 py-2 text-sm">
                Home <FiArrowUpRight />
              </Link>
            </div>

            <div className="relative flex h-full flex-col justify-end">
              <div className="mb-8 max-w-xl">
                <p className="soft-label mb-4">Careers, hiring, approvals</p>
                <h1 className="text-5xl font-bold leading-[0.95] text-white">{sideTitle}</h1>
                <p className="mt-6 text-lg text-slate-300">{sideBody}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {sideStats.map((item) => (
                  <div key={item.label} className="metric-panel">
                    <div className="text-3xl font-bold text-white">{item.value}</div>
                    <div className="mt-2 text-sm text-slate-300">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="mt-1 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-200">
                    Faster approvals, richer messaging, and a calmer workflow for every role.
                  </p>
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-morphism-strong mx-auto w-full max-w-xl p-8 md:p-10 glow-border">
            <Link to="/" className="mb-8 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 via-blue-400 to-cyan-300 text-xl font-bold text-slate-950 shadow-2xl shadow-cyan-400/20">
                N
              </div>
              <span className="text-lg font-semibold text-white">Nile Agency</span>
            </Link>

            <div className="mb-8">
              <p className="soft-label mb-3">{badge}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
              <p className="mt-3 text-slate-300">{subtitle}</p>
            </div>

            {children}
          </div>
        </Reveal>
      </div>
    </Scene>
  );
}