import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, Eye, Trash2, Database, X, History, TrendingUp, AlertTriangle } from 'lucide-react';

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

export const Registry = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ department: '', classification: '' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
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
        setErrorMsg(null);
        addLog(`-- Returned ${res.data.data.length} rows. Total dataset: ${res.data.pagination.total}`);
      } catch (error) {
        console.error("Error fetching employees", error);
        setErrorMsg("Koneksi ke backend gagal. Menampilkan data simulasi (Mock Data).");
        addLog(`-- ERROR: Connection failed. Loading fallback mock data.`);
        
        // Mock data fallback
        setEmployees([
          { emp_no: 10001, first_name: 'Georgi', last_name: 'Facello', department: 'Development', classification: 'Senior Engineer' },
          { emp_no: 10002, first_name: 'Bezalel', last_name: 'Simmel', department: 'Sales', classification: 'Staff' },
          { emp_no: 10003, first_name: 'Parto', last_name: 'Bamford', department: 'Production', classification: 'Senior Engineer' },
          { emp_no: 10004, first_name: 'Chirstian', last_name: 'Koblick', department: 'Production', classification: 'Engineer' },
          { emp_no: 10005, first_name: 'Kyoichi', last_name: 'Maliniak', department: 'Human Resources', classification: 'Senior Staff' },
          { emp_no: 10006, first_name: 'Anneke', last_name: 'Preusig', department: 'Development', classification: 'Senior Engineer' },
          { emp_no: 10007, first_name: 'Tzvetan', last_name: 'Zielinski', department: 'Research', classification: 'Senior Staff' },
        ]);
        setPagination({ page: page, limit: 15, totalPages: 10, total: 150 });
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
      addLog(`-- ERROR: Profile data fetch failed. Loading mock profile.`);
      
      // Fallback Data untuk Inspect
      setTimeout(() => {
        setEmpHistory({
          profile: {
            emp_no: empNo,
            first_name: 'Simulasi',
            last_name: 'Karyawan',
            gender: 'M',
            birth_date: '1985-10-15',
            hire_date: '2010-05-20'
          },
          titles: [
            { title: 'Senior Engineer', from_date: '2015-05-20', to_date: '9999-01-01' },
            { title: 'Engineer', from_date: '2010-05-20', to_date: '2015-05-20' }
          ],
          salaries: [
            { salary: 85000, from_date: '2020-05-20', to_date: '9999-01-01' },
            { salary: 78000, from_date: '2015-05-20', to_date: '2020-05-20' },
            { salary: 65000, from_date: '2010-05-20', to_date: '2015-05-20' }
          ]
        });
        setLoadingHistory(false);
      }, 600);
      return;
    } 
    setLoadingHistory(false);
  };

  const closeModal = () => {
    setSelectedEmp(null);
    setEmpHistory(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all relative">
      <Header title="Registri Data Node (NODES)" />
      
      <main className="p-4 md:p-8 flex-1 flex flex-col space-y-6">
        
        {/* Warning Banner untuk Fallback */}
        {errorMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-center shadow-sm">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Panel Kontrol Lab */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 header-sans uppercase tracking-wider flex items-center">
              <Search className="w-4 h-4 mr-2 text-emerald-600" />
              Panel Kontrol
            </h3>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
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
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 data-mono hidden md:inline-block">
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
                          <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{emp.first_name} {emp.last_name}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-purple-700 whitespace-nowrap">
                          {emp.department || 'N/A'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 data-mono font-medium whitespace-nowrap">{emp.classification || 'N/A'}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end space-x-2 md:opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleInspect(emp.emp_no)} className="p-1.5 bg-slate-100 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Inspect Node">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 bg-slate-100 text-red-600 rounded hover:bg-red-100 transition-colors" title="Delete Node (Mock)">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Pencarian tidak menemukan kecocokan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 space-y-3 md:space-y-0">
                <p className="text-xs text-slate-500 font-medium data-mono">
                  Rows {(pagination.page - 1) * pagination.limit + (employees.length > 0 ? 1 : 0)} - {Math.min(pagination.page * pagination.limit, pagination.total)}
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

        {/* Live SQL Console */}
        <div className="bg-slate-900 rounded-lg p-4 h-48 flex flex-col border border-slate-700 shadow-inner">
          <div className="flex items-center text-slate-400 mb-2 border-b border-slate-700 pb-2">
            <Database className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-widest header-sans">Live SQL Console</span>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 scrollbar-hide">
            {sqlLogs.map((log, idx) => (
              <div key={idx} className="flex space-x-3">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className={`${log.query.startsWith('-- ERROR') ? 'text-red-400' : log.query.startsWith('--') ? 'text-emerald-400/70' : 'text-emerald-400'}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
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
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
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
                    <div className="flex space-x-6 md:text-right">
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
                                <td className="px-4 py-3 text-xs data-mono text-slate-500 whitespace-nowrap">
                                  {t.from_date} <br/>ke {t.to_date === '9999-01-01' ? 'Sekarang' : t.to_date}
                                </td>
                              </tr>
                            ))}
                            {empHistory.titles.length === 0 && (
                              <tr><td colSpan="2" className="px-4 py-3 text-xs text-slate-500">Tidak ada data.</td></tr>
                            )}
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
                                <td className="px-4 py-3 text-xs data-mono text-slate-500 whitespace-nowrap">
                                  {s.from_date} <br/>ke {s.to_date === '9999-01-01' ? 'Sekarang' : s.to_date}
                                </td>
                              </tr>
                            ))}
                            {empHistory.salaries.length === 0 && (
                              <tr><td colSpan="2" className="px-4 py-3 text-xs text-slate-500">Tidak ada data.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-center text-slate-500 font-medium">Gagal memuat riwayat.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};