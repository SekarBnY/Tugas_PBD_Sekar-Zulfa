import { useEffect, useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Building2, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

export const Departments = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/units/capacity');
        setUnits(res.data.data);
      } catch (error) {
        console.error("Error fetching units", error);
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64">
      <Header title="Unit Operasional (UNITS)" />
      
      <main className="p-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md font-black text-slate-800 flex items-center header-sans uppercase tracking-wider">
            <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
            Monitor Kapasitas & Anggaran
          </h3>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {units.map((unit) => {
              const statusCfg = getStatusConfig(unit.status);
              const StatusIcon = statusCfg.icon;
              const chartData = [{ name: 'Nodes', value: unit.nodes }];

              return (
                <GlassCard key={unit.dept_no} className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase header-sans">{unit.name}</h4>
                    </div>
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{unit.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 mt-2">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Kapasitas</p>
                      <p className="text-lg font-black text-slate-800 data-mono">{unit.nodes.toLocaleString('id-ID')} Nodes</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Beban Fiskal (Tahunan)</p>
                      <p className="text-lg font-black text-slate-800 data-mono">${unit.total_budget.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Mini Analytics */}
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Beban Kapasitas Relatif</p>
                    <div className="h-8 w-full bg-slate-50 rounded">
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
