import { Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-8 mb-4 flex justify-center items-center text-slate-500 text-xs font-semibold data-mono">
      <div className="flex items-center space-x-2 bg-slate-200/50 px-4 py-2 rounded-full">
        <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
        <span>Sekar Bestari Nindita Yasmin (21120123130072) & Zulfa Salsabila (21120123130057)</span>
      </div>
    </footer>
  );
};
