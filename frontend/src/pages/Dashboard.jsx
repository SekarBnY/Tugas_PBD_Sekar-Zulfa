import { useEffect, useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Banknote, ShieldAlert, Building2 } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({ totalNodes: 0, averageYield: 0, activeManagers: 0, totalUnits: 0 });
  const [hiringData, setHiringData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [latestHires, setLatestHires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, hiringRes, deptRes, latestRes] = await Promise.all([
          axios.get('http://localhost:5000/api/stats'),
          axios.get('http://localhost:5000/api/charts/hiring'),
          axios.get('http://localhost:5000/api/charts/departments'),
          axios.get('http://localhost:5000/api/latest-hires')
        ]);
        
        setStats(statsRes.data.data);
        setHiringData(hiringRes.data.data);
        setDeptData(deptRes.data.data);
        setLatestHires(latestRes.data.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64">
      <Header title="Pusat Wawasan (DASH)" />
      
      <main className="p-8 flex-1 space-y-8">
        
        {/* Metrik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <GlassCard className="flex items-center p-6 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Total Node Aktif</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                {stats.totalNodes.toLocaleString('id-ID')}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-6 border-l-4 border-l-emerald-600">
            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
              <Banknote className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Beban Gaji Rata-rata</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                ${stats.averageYield.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-6 border-l-4 border-l-purple-500">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Unit Operasional</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                {stats.totalUnits.toLocaleString('id-ID')}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-6 border-l-4 border-l-purple-700">
            <div className="p-3 bg-purple-200 rounded-lg mr-4">
              <ShieldAlert className="w-6 h-6 text-purple-800" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Manajer Aktif</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                {stats.activeManagers.toLocaleString('id-ID')}
              </h3>
            </div>
          </GlassCard>
        </div>

        {/* Charts & Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <GlassCard className="xl:col-span-2">
            <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
              Analitik Velocity (Rekrutmen)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hiringData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} className="data-mono" />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} className="data-mono" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col">
            <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
              Sintesis Terakhir
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {latestHires.map((hire) => (
                <div key={hire.emp_no} className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-800">{hire.first_name} {hire.last_name}</span>
                    <span className="text-xs data-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">#{hire.emp_no}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{hire.title || 'Node'}</span>
                    <span className="text-xs data-mono text-slate-400">{hire.hire_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Distribusi Kapasitas */}
        <div className="grid grid-cols-1 gap-8">
          <GlassCard>
            <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-slate-800 rounded-full mr-3"></span>
              Distribusi Kapasitas Unit Operasional
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} className="data-mono" />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f1f5f9'}}
                    itemStyle={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

      </main>
      <Footer />
    </div>
  );
};
