import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, ShieldCheck, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    <p className="text-sm text-slate-500">© Dikerjakan oleh Sekar dan Zulfa.</p>
  </footer>
);

export const Processing = () => {
  const [summary, setSummary] = useState({ totalPayroll: 0, growthRate: '', balance: 0 });
  const [unitExpenses, setUnitExpenses] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, unitsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/financial/summary'),
          axios.get('http://localhost:5000/api/units/capacity')
        ]);
        
        setSummary(summaryRes.data.data);
        setErrorMsg(null);
        
        // Format unit expenses for chart
        const formattedUnits = unitsRes.data.data.map(u => ({
          name: u.name,
          cost: u.total_budget
        }));
        setUnitExpenses(formattedUnits);
      } catch (error) {
        console.error("Error fetching processing data", error);
        setErrorMsg("Gagal memuat data finansial. Menampilkan data simulasi (Mock Data).");
        
        // Mock data fallback
        setSummary({ totalPayroll: 1854500000, growthRate: '+2.4%', balance: 3500000000 });
        setUnitExpenses([
          { name: 'Development', cost: 154200000 },
          { name: 'Sales', cost: 92500000 },
          { name: 'Production', cost: 118400000 },
          { name: 'Customer Service', cost: 41200000 },
          { name: 'Marketing', cost: 38500000 }
        ]);
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
        
        // Mock data fallback
        setAuditLog([
          { emp_no: 10001, full_name: 'Georgi Facello', classification: 'Senior Staff', annual_yield: 85000 },
          { emp_no: 10002, full_name: 'Bezalel Simmel', classification: 'Staff', annual_yield: 62000 },
          { emp_no: 10003, full_name: 'Parto Bamford', classification: 'Senior Engineer', annual_yield: 94000 },
          { emp_no: 10004, full_name: 'Chirstian Koblick', classification: 'Engineer', annual_yield: 75000 },
          { emp_no: 10005, full_name: 'Kyoichi Maliniak', classification: 'Staff', annual_yield: 58000 }
        ]);
        setPagination({ page: page, limit: 10, totalPages: 10, total: 100 });
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all">
      <Header title="Pemrosesan Fiskal (PROC)" />
      
      <main className="p-4 md:p-8 flex-1 space-y-8">
        
        {/* Warning Banner */}
        {errorMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-center shadow-sm">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Ringkasan Finansial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col p-6 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payroll Aktif</h4>
            </div>
            <h3 className="text-3xl font-black text-slate-800 data-mono">${summary.totalPayroll.toLocaleString('id-ID')}</h3>
          </GlassCard>

          <GlassCard className="flex flex-col p-6 border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Pertumbuhan Aktual</h4>
            </div>
            <h3 className={`text-3xl font-black data-mono ${summary.growthRate.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
              {summary.growthRate || '+0.0%'}
            </h3>
          </GlassCard>

          <GlassCard className="flex flex-col p-6 border-t-4 border-t-purple-500 hover:shadow-md transition-shadow">
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
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Beban']}
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
                          <td className="px-4 py-2.5 text-xs font-medium text-slate-600">{log.classification || 'N/A'}</td>
                          <td className="px-4 py-2.5 text-right font-black text-red-600 data-mono">
                            ${log.annual_yield ? log.annual_yield.toLocaleString('id-ID') : 0}
                          </td>
                        </tr>
                      ))}
                      {auditLog.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-500">Log audit kosong.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500 font-medium data-mono">
                    Audit Rows {(pagination.page - 1) * pagination.limit + (auditLog.length > 0 ? 1 : 0)} - {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handlePrevPage}
                      disabled={pagination.page === 1}
                      className={`p-1.5 rounded border ${pagination.page === 1 ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-3 data-mono">
                      {pagination.page} / {pagination.totalPages.toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={handleNextPage}
                      disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                      className={`p-1.5 rounded border ${pagination.page === pagination.totalPages || pagination.totalPages === 0 ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
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