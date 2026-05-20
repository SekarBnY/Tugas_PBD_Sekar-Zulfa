
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calculator, Fingerprint } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { name: 'DASH', title: 'Pusat Wawasan', icon: LayoutDashboard, path: '/' },
    { name: 'NODES', title: 'Registri Data', icon: Users, path: '/registry' },
    { name: 'UNITS', title: 'Unit Operasional', icon: Building2, path: '/departments' },
    { name: 'PROC', title: 'Pemrosesan Fiskal', icon: Calculator, path: '/processing' },
    { name: 'MGR', title: 'Laporan Manajer', icon: Fingerprint, path: '/managers' },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 glass-header flex flex-col z-20">
      <div className="p-6 flex items-center justify-center border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 tracking-wider">TUGASPBD</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.name}</span>
              <span className="text-sm">{item.title}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
