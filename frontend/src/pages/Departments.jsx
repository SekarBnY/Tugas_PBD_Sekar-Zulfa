import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertTriangle, CheckCircle, Activity, UserCog, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

// Inlining the components to ensure they compile correctly in the current environment
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur-md shadow-sm border border-slate-200 rounded-xl ${className}`}>
    {children}
  </div>
);

const Header = ({ title }) => (
  <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
    <h1 className="text-xl font-bold text-slate-800">{title}</h1>
  </header>
);

const Footer = () => (
  <footer className="py-6 px-8 text-center mt-auto">
    <p className="text-sm text-slate-500">© 2026 Pusat Wawasan (DASH). All rights reserved.</p>
  </footer>
);

export const Departments = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/units/capacity');
        setUnits(res.data.data);
        setErrorMsg(null);
      } catch (error) {
        console.error("Error fetching units", error);
        setErrorMsg("Koneksi ke server terputus (Network Error). Menampilkan data pratinjau simulasi.");
        
        // Mock Data Fallback jika database backend tidak merespons
        setUnits([
          { dept_no: 'd005', name: 'Development', nodes: 85607, total_budget: 154200000, current_manager: 'Margareta Leonhardt', manager_id: 110511, status: 'Critical' },
          { dept_no: 'd007', name: 'Sales', nodes: 52245, total_budget: 92500000, current_manager: 'Hauke Zhang', manager_id: 111133, status: 'High' },
          { dept_no: 'd004', name: 'Production', nodes: 73485, total_budget: 118400000, current_manager: 'Oscar Gassner', manager_id: 110420, status: 'Critical' },
          { dept_no: 'd009', name: 'Customer Service', nodes: 23580, total_budget: 41200000, current_manager: 'Yuchang Weedon', manager_id: 111534, status: 'Medium' },
          { dept_no: 'd001', name: 'Marketing', nodes: 20211, total_budget: 38500000, current_manager: 'Vishwani Minakawa', manager_id: 110039, status: 'Medium' },
          { dept_no: 'd003', name: 'Human Resources', nodes: 17786, total_budget: 29800000, current_manager: 'Karsten Sigstam', manager_id: 110228, status: 'Low' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Critical': return { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', icon: AlertTriangle };
      case 'High': return { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', icon: Activity };
      case 'Medium': return { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', icon: CheckCircle };
      default: return { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: CheckCircle };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all">
      <Header title="Unit Operasional (UNITS)" />
      
      <main className="p-4 md:p-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md font-black text-slate-800 flex items-center header-sans uppercase tracking-wider">
            <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
            Monitor Kapasitas & Anggaran
          </h3>
        </div>

        {/* Warning Banner untuk Mode Mock/Fallback */}
        {errorMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-center shadow-sm mb-6">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {units.map((unit) => {
              const statusCfg = getStatusConfig(unit.status);
              const StatusIcon = statusCfg.icon;
              const chartData = [{ name: 'Nodes', value: unit.nodes }];

              return (
                <GlassCard key={unit.dept_no} className="flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4 p-4 pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <Building2 className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase header-sans">{unit.name}</h4>
                    </div>
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{unit.status}</span>
                    </span>
                  </div>

                  {/* Manager Section */}
                  <div className="mx-4 mb-4 flex items-center space-x-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                    <div className="p-2 bg-purple-200 rounded-full text-purple-700">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">Active Unit Manager</p>
                      <p className="text-sm font-black text-slate-800">{unit.current_manager || 'Vacant'}</p>
                      <p className="text-xs data-mono text-purple-500 font-semibold">{unit.manager_id ? `#${unit.manager_id}` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Kapasitas</p>
                      <p className="text-lg font-black text-slate-800 data-mono">{unit.nodes ? unit.nodes.toLocaleString('id-ID') : 0} Nodes</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Beban Fiskal</p>
                      <p className="text-lg font-black text-slate-800 data-mono">${unit.total_budget ? unit.total_budget.toLocaleString('id-ID') : 0}</p>
                    </div>
                  </div>

                  {/* Mini Analytics */}
                  <div className="mt-auto pt-4 border-t border-slate-100 px-4 pb-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Beban Kapasitas Relatif</p>
                    <div className="h-8 w-full bg-slate-50 rounded mb-4 border border-slate-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                          <YAxis type="category" dataKey="name" hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '4px', border: 'none', padding: '4px 8px', fontSize: '12px' }}
                            cursor={{fill: 'transparent'}}
                          />
                          <Bar dataKey="value" fill="#9333ea" radius={[4, 4, 4, 4]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <button 
                      onClick={() => navigate(`/departments/${unit.dept_no}`)}
                      className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                      <span>Inspeksi Detail Unit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};