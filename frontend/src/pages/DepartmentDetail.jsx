import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Users, Banknote, History, ChevronLeft, ChevronRight, UserCog, ArrowLeft, AlertTriangle } from 'lucide-react';

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

export const DepartmentDetail = () => {
  const { dept_no } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch Department Info & Managers
  useEffect(() => {
    const fetchDepartmentInfo = async () => {
      setLoading(true);
      try {
        const [deptRes, managersRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/departments/${dept_no}`),
          axios.get(`http://localhost:5000/api/departments/${dept_no}/managers`)
        ]);
        setDepartment(deptRes.data.data);
        setManagers(managersRes.data.data);
        setErrorMsg(null);
      } catch (error) {
        console.error("Error fetching department info", error);
        setErrorMsg("Koneksi ke server terputus. Menampilkan data pratinjau.");
        
        // Mock Data Fallback
        setDepartment({
          dept_no: dept_no || 'DXXX',
          name: 'Unit Operasional (Simulasi)',
          nodes: 3450,
          total_budget: 85000000,
          current_manager: 'Siti Aminah',
          manager_id: 110022
        });
        setManagers([
          { emp_no: 110022, full_name: 'Siti Aminah', from_date: '2022-01-01', to_date: '9999-01-01' },
          { emp_no: 110011, full_name: 'Budi Santoso', from_date: '2018-05-10', to_date: '2022-01-01' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    if (dept_no) fetchDepartmentInfo();
  }, [dept_no]);

  // Fetch Employees with Pagination
  useEffect(() => {
    const fetchEmployees = async (page) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/departments/${dept_no}/employees?page=${page}&limit=${pagination.limit}`);
        setEmployees(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error("Error fetching employees", error);
        
        // Mock Data Fallback
        setEmployees([
          { emp_no: 10001, first_name: 'Andi', last_name: 'Wijaya', gender: 'M', classification: 'Senior Staff', fiscal_yield: 8500, hire_date: '2020-03-15' },
          { emp_no: 10002, first_name: 'Rina', last_name: 'Melati', gender: 'F', classification: 'Staff', fiscal_yield: 6000, hire_date: '2021-06-20' },
          { emp_no: 10003, first_name: 'Dewi', last_name: 'Lestari', gender: 'F', classification: 'Engineer', fiscal_yield: 9200, hire_date: '2019-11-01' }
        ]);
        setPagination({ page, limit: 15, totalPages: 5, total: 65 });
      }
    };
    if (dept_no && !loading) fetchEmployees(pagination.page);
  }, [dept_no, pagination.page, pagination.limit, loading]);

  const handlePrevPage = () => {
    if (pagination.page > 1) setPagination(prev => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all">
        <Header title="Memuat Profil Unit..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all">
        <Header title="Unit Tidak Ditemukan" />
        <div className="flex-1 flex items-center justify-center flex-col">
          <p className="text-xl text-slate-500 mb-4">Departemen tidak valid atau tidak ditemukan.</p>
          <button onClick={() => navigate('/departments')} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
            Kembali ke Daftar Unit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all">
      <Header title={`Profil Unit: ${department.name}`} />
      
      <main className="p-4 md:p-8 flex-1 space-y-6">
        
        {/* Warning Banner untuk Fallback */}
        {errorMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-center shadow-sm">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
          </div>
        )}
        
        {/* Navigation & Title */}
        <div className="flex items-center space-x-4 mb-2">
          <button onClick={() => navigate('/departments')} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors text-slate-600 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest header-sans flex items-center">
            <Building2 className="w-6 h-6 mr-3 text-purple-600" />
            {department.name} <span className="ml-3 text-sm data-mono text-slate-400 font-bold bg-slate-200 px-2 py-0.5 rounded">#{department.dept_no}</span>
          </h2>
        </div>

        {/* High-Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex items-center p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Kapasitas Node</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                {department.nodes ? department.nodes.toLocaleString('id-ID') : 0}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Beban Fiskal Unit</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                ${parseFloat(department.total_budget || 0).toLocaleString('id-ID')}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-6 border-l-4 border-l-purple-500 bg-purple-50/30 hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-200 rounded-lg mr-4">
              <UserCog className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-bold tracking-wider uppercase">Active Manager</p>
              <h3 className="text-lg font-black text-slate-800 mt-1 leading-tight">
                {department.current_manager || 'Vacant'}
              </h3>
              <p className="text-xs data-mono text-slate-500">{department.manager_id ? `#${department.manager_id}` : ''}</p>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Manager History */}
          <GlassCard className="xl:col-span-1 flex flex-col min-h-[400px]">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center header-sans uppercase tracking-wider">
              <History className="w-5 h-5 mr-2 text-purple-600" />
              Suksesi Manajerial
            </h3>
            <div className="flex-1 overflow-y-auto">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4">
                {managers.map((mgr, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${idx === 0 && mgr.to_date === '9999-01-01' ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <p className="text-sm font-bold text-slate-800">{mgr.full_name}</p>
                    <p className="text-[10px] font-bold text-slate-500 data-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">
                      UID: #{mgr.emp_no}
                    </p>
                    <p className="text-xs text-slate-500 data-mono mt-1">
                      {mgr.from_date} — {mgr.to_date === '9999-01-01' ? 'Sekarang' : mgr.to_date}
                    </p>
                  </div>
                ))}
                {managers.length === 0 && (
                  <p className="pl-6 text-sm text-slate-500">Tidak ada riwayat manajer.</p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Employee Data Grid */}
          <GlassCard className="xl:col-span-2 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-sm font-black text-slate-800 flex items-center header-sans uppercase tracking-wider">
                <Users className="w-5 h-5 mr-2 text-emerald-600" />
                Daftar Personel Aktif
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 data-mono w-fit">
                {pagination.total.toLocaleString('id-ID')} Nodes
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200 header-sans">
                    <th className="px-3 py-2 font-bold w-20">UID</th>
                    <th className="px-3 py-2 font-bold min-w-[120px]">Identitas</th>
                    <th className="px-3 py-2 font-bold">Gender</th>
                    <th className="px-3 py-2 font-bold">Klasifikasi</th>
                    <th className="px-3 py-2 font-bold text-right">Beban/Yield</th>
                    <th className="px-3 py-2 font-bold text-right">Tgl Gabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.emp_no} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-xs font-semibold text-emerald-700 data-mono">#{emp.emp_no}</td>
                      <td className="px-3 py-2">
                        <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{emp.first_name} {emp.last_name}</p>
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-slate-500">
                        {emp.gender === 'M' ? 'Pria' : 'Wanita'}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600 data-mono font-medium whitespace-nowrap">{emp.classification || 'N/A'}</td>
                      <td className="px-3 py-2 text-xs text-right data-mono font-medium text-blue-600">
                        {emp.fiscal_yield ? `$${parseFloat(emp.fiscal_yield).toLocaleString('id-ID')}` : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-xs text-right data-mono text-slate-500 whitespace-nowrap">{emp.hire_date}</td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">Tidak ada data personel aktif.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-500 font-medium data-mono">
                Menampilkan {(pagination.page - 1) * pagination.limit + (employees.length > 0 ? 1 : 0)} - {Math.min(pagination.page * pagination.limit, pagination.total)}
              </p>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1}
                  className={`p-1 rounded border ${pagination.page === 1 ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-2 data-mono">
                  {pagination.page} / {pagination.totalPages.toLocaleString('id-ID')}
                </span>
                <button 
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                  className={`p-1 rounded border ${pagination.page === pagination.totalPages || pagination.totalPages === 0 ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </GlassCard>
        </div>

      </main>
      <Footer />
    </div>
  );
};