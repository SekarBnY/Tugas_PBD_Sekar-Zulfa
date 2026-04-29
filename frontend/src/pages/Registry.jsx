import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ChevronLeft, ChevronRight, Search, Eye, Trash2, Database, X, History, TrendingUp } from 'lucide-react';

export const Registry = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ department: '', classification: '' });
  const [loading, setLoading] = useState(true);
  
  const [sqlLogs, setSqlLogs] = useState([]);
  const logsEndRef = useRef(null);

  // Modal State
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empHistory, setEmpHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const addLog = (query) => {
    setSqlLogs(prev => [...prev, { time: new Date().toLocaleTimeString('id-ID'), query }]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sqlLogs]);

  useEffect(() => {
    const fetchEmployees = async (page, currentFilters) => {
      setLoading(true);
      const queryParams = `page=${page}&limit=${pagination.limit}&department=${currentFilters.department}&classification=${currentFilters.classification}`;
      addLog(`SELECT * FROM employees WHERE department LIKE '%${currentFilters.department}%' AND title LIKE '%${currentFilters.classification}%' LIMIT ${pagination.limit} OFFSET ${(page - 1) * pagination.limit}`);
      
      try {
        const res = await axios.get(`http://localhost:5000/api/employees?${queryParams}`);
        setEmployees(res.data.data);
        setPagination(res.data.pagination);
        addLog(`-- Returned ${res.data.data.length} rows. Total dataset: ${res.data.pagination.total}`);
      } catch (error) {
        console.error("Error fetching employees", error);
        addLog(`-- ERROR: Connection failed`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees(pagination.page, filters);
  }, [pagination.page, pagination.limit, filters]);

  const handlePrevPage = () => {
    if (pagination.page > 1) setPagination(prev => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInspect = async (empNo) => {
    setSelectedEmp(empNo);
    setLoadingHistory(true);
    addLog(`SELECT * FROM employees, titles, salaries WHERE emp_no = ${empNo}`);
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/${empNo}/history`);
      setEmpHistory(res.data.data);
      addLog(`-- Loaded complete historical profile for Node #${empNo}`);
    } catch (error) {
      console.error("Error fetching history", error);
      addLog(`-- ERROR: Profile data fetch failed`);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeModal = () => {
    setSelectedEmp(null);
    setEmpHistory(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64 relative">
      <Header title="Registri Data Node (NODES)" />
      
      <main className="p-8 flex-1 flex flex-col space-y-6">
        
        {/* Panel Kontrol Lab */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 header-sans uppercase tracking-wider flex items-center">
              <Search className="w-4 h-4 mr-2 text-emerald-600" />
              Panel Kontrol
            </h3>
            <div className="flex space-x-4 w-full md:w-auto">
              <input 
                type="text" 
                name="department"
                placeholder="Unit Operasional (Mis: Sales)..."
                value={filters.department}
                onChange={handleFilterChange}
                className="flex-1 md:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all data-mono"
              />
              <input 
                type="text" 
                name="classification"
                placeholder="Klasifikasi Jabatan..."
                value={filters.classification}
                onChange={handleFilterChange}
                className="flex-1 md:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all data-mono"
              />
            </div>
          </div>
        </GlassCard>

        {/* Data Grid */}
        <GlassCard className="flex-1 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-black text-slate-800 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
              Data Grid Kepadatan Tinggi
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 data-mono">
              TOTAL: {pagination.total.toLocaleString('id-ID')}
            </span>
          </div>

          {loading ? (
             <div className="flex-1 flex items-center justify-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
             </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 header-sans">
                      <th className="px-4 py-3 font-bold w-24">UID Node</th>
                      <th className="px-4 py-3 font-bold">Identitas</th>
                      <th className="px-4 py-3 font-bold">Unit Operasional</th>
                      <th className="px-4 py-3 font-bold">Klasifikasi</th>
                      <th className="px-4 py-3 font-bold text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => (
                      <tr key={emp.emp_no} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-2.5 text-xs font-semibold text-emerald-700 data-mono">#{emp.emp_no}</td>
                        <td className="px-4 py-2.5">
                          <p className="text-sm font-bold text-slate-800">{emp.first_name} {emp.last_name}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-purple-700">
                          {emp.department || 'N/A'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 data-mono font-medium">{emp.classification || 'N/A'}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleInspect(emp.emp_no)} className="p-1.5 bg-slate-100 text-blue-600 rounded hover:bg-blue-100" title="Inspect Node">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 bg-slate-100 text-red-600 rounded hover:bg-red-100" title="Delete Node (Mock)">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500 font-medium data-mono">
                  Rows {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
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

        {/* Live SQL Console */}
        <div className="bg-slate-900 rounded-lg p-4 h-48 flex flex-col border border-slate-700 shadow-inner">
          <div className="flex items-center text-slate-400 mb-2 border-b border-slate-700 pb-2">
            <Database className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-widest header-sans">Live SQL Console</span>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
            {sqlLogs.map((log, idx) => (
              <div key={idx} className="flex space-x-3">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className={`${log.query.startsWith('--') ? 'text-emerald-400/70' : 'text-emerald-400'}`}>
                  {log.query}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

      </main>

      {/* Employee Inspect Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-800 text-white border-b border-slate-700">
              <h2 className="text-lg font-black tracking-wider uppercase flex items-center">
                <Search className="w-5 h-5 mr-3 text-emerald-400" />
                Rekam Jejak Node
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : empHistory ? (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-emerald-600 font-bold tracking-widest uppercase mb-1">Identitas Karyawan</p>
                      <h3 className="text-2xl font-black text-slate-800">{empHistory.profile.first_name} {empHistory.profile.last_name}</h3>
                      <p className="text-sm text-slate-500 data-mono mt-1">UID: #{empHistory.profile.emp_no} | Gender: {empHistory.profile.gender === 'M' ? 'Laki-laki' : 'Perempuan'}</p>
                    </div>
                    <div className="flex space-x-6 text-right">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Tgl Lahir</p>
                        <p className="text-sm font-bold text-slate-700 data-mono">{empHistory.profile.birth_date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Tgl Masuk</p>
                        <p className="text-sm font-bold text-slate-700 data-mono">{empHistory.profile.hire_date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titles History */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center">
                        <History className="w-4 h-4 text-purple-600 mr-2" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase">Riwayat Jabatan</h4>
                      </div>
                      <div className="p-0 overflow-y-auto max-h-80">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 text-xs">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Jabatan</th>
                              <th className="px-4 py-2 font-semibold">Masa Berlaku</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {empHistory.titles.map((t, idx) => (
                              <tr key={idx} className={idx === 0 ? "bg-purple-50/30" : ""}>
                                <td className="px-4 py-3 font-semibold text-slate-700">{t.title}</td>
                                <td className="px-4 py-3 text-xs data-mono text-slate-500">
                                  {t.from_date} <br/>ke {t.to_date === '9999-01-01' ? 'Sekarang' : t.to_date}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Salary History */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center">
                        <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase">Riwayat Gaji (Annual Yield)</h4>
                      </div>
                      <div className="p-0 overflow-y-auto max-h-80">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 text-xs">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Nominal</th>
                              <th className="px-4 py-2 font-semibold">Masa Berlaku</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {empHistory.salaries.map((s, idx) => (
                              <tr key={idx} className={idx === 0 ? "bg-emerald-50/30" : ""}>
                                <td className="px-4 py-3 font-black text-emerald-700 data-mono">${s.salary.toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 text-xs data-mono text-slate-500">
                                  {s.from_date} <br/>ke {s.to_date === '9999-01-01' ? 'Sekarang' : s.to_date}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-center text-slate-500">Gagal memuat riwayat.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
