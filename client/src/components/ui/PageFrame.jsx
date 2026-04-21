import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Reveal, Scene } from './Scene';

export default function PageFrame({
  title,
  subtitle,
  backTo = '/dashboard',
  backLabel = 'Back',
  children,
  contentClassName = 'max-w-6xl'
}) {
  return (
    <Scene className="px-4 py-6 sm:px-6 lg:px-8" contentClassName={`mx-auto ${contentClassName}`}>
      <Reveal className="mb-6">
        <div className="glass flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
          <Link to={backTo} className="btn-secondary !min-h-0 px-4 py-2 text-sm">
            <FiArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <div className="text-right">
            <p className="soft-label mb-1">Workspace</p>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
          </div>
        </div>
      </Reveal>

      {children}
    </Scene>
  );
}
