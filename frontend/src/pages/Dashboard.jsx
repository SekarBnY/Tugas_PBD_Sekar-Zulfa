import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Banknote, ShieldAlert, Building2, AlertTriangle, Loader2 } from 'lucide-react';

// Inlining the components here to ensure they compile correctly in the current environment
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

const COLORS = ['#059669', '#9333ea', '#3b82f6', '#f59e0b', '#ef4444'];

export const Dashboard = () => {
  const [stats, setStats] = useState({ totalNodes: 0, averageYield: 0, activeManagers: 0, totalUnits: 0 });
  const [hiringData, setHiringData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [latestHires, setLatestHires] = useState([]);
  const [demographics, setDemographics] = useState({ gender: [], age: [] });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let completed = 0;
        const totalTasks = 5;
        
        // Fungsi pembantu untuk meningkatkan progres setiap kali request selesai
        const updateProgress = (res) => {
          completed++;
          setProgress(Math.round((completed / totalTasks) * 100));
          return res;
        };

        const [statsRes, hiringRes, deptRes, latestRes, demoRes] = await Promise.all([
          axios.get('http://localhost:5000/api/stats').then(updateProgress),
          axios.get('http://localhost:5000/api/charts/hiring').then(updateProgress),
          axios.get('http://localhost:5000/api/charts/departments').then(updateProgress),
          axios.get('http://localhost:5000/api/latest-hires').then(updateProgress),
          axios.get('http://localhost:5000/api/charts/demographics').then(updateProgress)
        ]);
        
        setStats(statsRes.data.data);
        setHiringData(hiringRes.data.data);
        setDeptData(deptRes.data.data);
        setLatestHires(latestRes.data.data);
        setDemographics(demoRes.data.data);
        setErrorMsg(null);
      } catch (error) {
        console.error("Error fetching data", error);
        setErrorMsg("Koneksi ke backend server gagal (Network Error). Menampilkan data pratinjau simulasi.");
        
        // Memuat data mock secara bertahap untuk mensimulasikan progres pada fallback
        setProgress(100);
        setStats({ totalNodes: 14250, averageYield: 75400, activeManagers: 104, totalUnits: 12 });
        setHiringData([
          { year: 2018, count: 120 }, { year: 2019, count: 250 }, { year: 2020, count: 180 },
          { year: 2021, count: 320 }, { year: 2022, count: 410 }, { year: 2023, count: 390 }
        ]);
        setDeptData([
          { name: 'Engineering', value: 4500 }, { name: 'Sales', value: 3200 },
          { name: 'Marketing', value: 2100 }, { name: 'Human Resources', value: 850 },
          { name: 'Finance', value: 600 }
        ]);
        setLatestHires([
          { emp_no: 10001, first_name: 'Budi', last_name: 'Santoso', title: 'Senior Engineer', hire_date: '2023-11-12' },
          { emp_no: 10002, first_name: 'Siti', last_name: 'Aminah', title: 'Marketing Manager', hire_date: '2023-12-05' },
          { emp_no: 10003, first_name: 'Andi', last_name: 'Wijaya', title: 'Sales Associate', hire_date: '2024-01-10' },
          { emp_no: 10004, first_name: 'Rina', last_name: 'Melati', title: 'HR Specialist', hire_date: '2024-02-14' },
          { emp_no: 10005, first_name: 'Dewi', last_name: 'Lestari', title: 'Data Analyst', hire_date: '2024-03-01' }
        ]);
        setDemographics({
          gender: [{ name: 'M', value: 8500 }, { name: 'F', value: 5750 }],
          age: [{ name: '1970s', value: 1200 }, { name: '1980s', value: 4500 }, { name: '1990s', value: 6500 }, { name: '2000s', value: 2050 }]
        });
      } finally {
        // Sedikit delay agar user sempat melihat persentase 100%
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">Memuat Dasbor</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Mengambil data analitik...</p>
          
          <div className="w-64 bg-slate-200 rounded-full h-2 mb-3 overflow-hidden shadow-inner">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${Math.max(progress, 5)}%` }} // Minimal width 5% as starting indicator
            ></div>
          </div>
          
          <p className="text-emerald-600 text-xs font-bold tracking-widest data-mono">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all duration-300 animate-in fade-in duration-500">
      <Header title="Pusat Wawasan (DASH)" />
      
      <main className="p-4 md:p-8 flex-1 space-y-8">

        {/* Warning Banner untuk Mode Mock/Fallback */}
        {errorMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-center shadow-sm">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
          </div>
        )}
        
        {/* Metrik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <GlassCard className="flex items-center p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
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

          <GlassCard className="flex items-center p-6 border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow">
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

          <GlassCard className="flex items-center p-6 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
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

          <GlassCard className="flex items-center p-6 border-l-4 border-l-purple-700 hover:shadow-md transition-shadow">
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

        {/* Demographics & Demografi */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <GlassCard className="xl:col-span-1 flex flex-col">
             <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Distribusi Gender
            </h3>
            <div className="flex-1 min-h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics.gender}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {demographics.gender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-2xl font-black text-slate-800 data-mono">{demographics.gender.reduce((a,b)=>a+b.value, 0).toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total</span>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
               {demographics.gender.map((entry, index) => (
                 <div key={entry.name} className="flex items-center space-x-1">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                   <span className="text-xs font-bold text-slate-600">{entry.name === 'M' ? 'Male' : 'Female'}</span>
                 </div>
               ))}
            </div>
          </GlassCard>

          <GlassCard className="xl:col-span-2">
            <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-orange-500 rounded-full mr-3"></span>
              Demografi Usia Node (Dekade Kelahiran)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics.age} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} className="data-mono" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} className="data-mono" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                    itemStyle={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
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