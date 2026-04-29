import { useEffect, useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calculator, TrendingUp, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Processing = () => {
  const [summary, setSummary] = useState({ totalPayroll: 0, growthRate: '', balance: 0 });
  const [unitExpenses, setUnitExpenses] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, unitsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/financial/summary'),
          axios.get('http://localhost:5000/api/units/capacity')
        ]);
        
        setSummary(summaryRes.data.data);
        
        // Format unit expenses for chart
        const formattedUnits = unitsRes.data.data.map(u => ({
          name: u.name,
          cost: u.total_budget
        }));
        setUnitExpenses(formattedUnits);
      } catch (error) {
        console.error("Error fetching processing data", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAuditLog = async (page) => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/financial/audit?page=${page}&limit=${pagination.limit}`);
        setAuditLog(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error("Error fetching audit log", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLog(pagination.page);
  }, [pagination.page, pagination.limit]);

  const handlePrevPage = () => {
    if (pagination.page > 1) setPagination(prev => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64">
      <Header title="Pemrosesan Fiskal (PROC)" />
      
      <main className="p-8 flex-1 space-y-8">
        
        {/* Ringkasan Finansial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col p-6 border-t-4 border-t-blue-500">
            <div className="flex items-center space-x-3 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payroll Aktif</h4>
            </div>
            <h3 className="text-3xl font-black text-slate-800 data-mono">${summary.totalPayroll.toLocaleString('id-ID')}</h3>
          </GlassCard>

          <GlassCard className="flex flex-col p-6 border-t-4 border-t-emerald-500">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Pertumbuhan Aktual</h4>
            </div>
            <h3 className={`text-3xl font-black data-mono ${summary.growthRate.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
              {summary.growthRate || '+0.0%'}
            </h3>
          </GlassCard>

          <GlassCard className="flex flex-col p-6 border-t-4 border-t-purple-500">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi Saldo Fiskal</h4>
            </div>
            <h3 className="text-3xl font-black text-slate-800 data-mono">${summary.balance.toLocaleString('id-ID')}</h3>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Analitik Pengeluaran Unit */}
          <GlassCard className="xl:col-span-1 flex flex-col">
            <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Analitik Pengeluaran
            </h3>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitExpenses} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} className="data-mono" />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f1f5f9'}}
                    itemStyle={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Log Audit Gaji */}
          <GlassCard className="xl:col-span-2 flex flex-col">
            <h3 className="text-md font-black text-slate-800 mb-6 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
              Log Audit Gaji (Annual Yield)
            </h3>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 header-sans">
                        <th className="px-4 py-3 font-bold">UID</th>
                        <th className="px-4 py-3 font-bold">Nama Entitas</th>
                        <th className="px-4 py-3 font-bold">Klasifikasi</th>
                        <th className="px-4 py-3 font-bold text-right">Annual Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLog.map((log) => (
                        <tr key={log.emp_no} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 text-xs font-semibold text-slate-500 data-mono">#{log.emp_no}</td>
                          <td className="px-4 py-2.5 text-sm font-bold text-slate-800">{log.full_name}</td>
                          <td className="px-4 py-2.5 text-xs font-medium text-slate-600">{log.classification}</td>
                          <td className="px-4 py-2.5 text-right font-black text-red-600 data-mono">
                            ${log.annual_yield.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500 font-medium data-mono">
                    Audit Rows {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handlePrevPage}
                      disabled={pagination.page === 1}
                      className={`p-1.5 rounded border ${pagination.page === 1 ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-3 data-mono">
                      {pagination.page} / {pagination.totalPages.toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={handleNextPage}
                      disabled={pagination.page === pagination.totalPages}
                      className={`p-1.5 rounded border ${pagination.page === pagination.totalPages ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </GlassCard>

        </div>
      </main>
      <Footer />
    </div>
  );
};
