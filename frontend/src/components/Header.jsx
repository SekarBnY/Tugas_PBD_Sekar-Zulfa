import { Award, Activity, Server, Zap } from 'lucide-react';

export const Header = ({ title }) => {
  return (
    <header className="h-20 glass-header flex flex-col justify-center px-8 sticky top-0 z-10">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-2xl header-sans text-slate-800">{title}</h2>
        
        <div className="flex items-center space-x-6">
          {/* Status Infrastruktur */}
          <div className="hidden md:flex items-center space-x-4 text-xs font-semibold data-mono text-slate-500 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full">
            <div className="flex items-center space-x-1.5" title="Latency">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>12ms</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center space-x-1.5" title="Integrity">
              <Server className="w-3.5 h-3.5 text-purple-500" />
              <span>100%</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center space-x-1.5" title="System Activity">
              <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span className="text-blue-600">SYNC</span>
            </div>
          </div>

          {/* Lencana Otoritas */}
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full shadow-sm cursor-help" title="Architected By: Two Women Engineers">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
              Tugas PBD
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
