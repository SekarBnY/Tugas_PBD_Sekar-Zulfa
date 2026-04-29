import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Building2, Users, Banknote, History, ChevronLeft, ChevronRight, UserCog, ArrowLeft } from 'lucide-react';

export const DepartmentDetail = () => {
  const { dept_no } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching department info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentInfo();
  }, [dept_no]);

  useEffect(() => {
    const fetchEmployees = async (page) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/departments/${dept_no}/employees?page=${page}&limit=${pagination.limit}`);
        setEmployees(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };
    if (dept_no) fetchEmployees(pagination.page);
  }, [dept_no, pagination.page, pagination.limit]);

  const handlePrevPage = () => {
    if (pagination.page > 1) setPagination(prev => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64">
        <Header title="Memuat Profil Unit..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64">
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-64">
      <Header title={`Profil Unit: ${department.name}`} />
      
      <main className="p-8 flex-1 space-y-6">
        
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
          <GlassCard className="flex items-center p-6 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Kapasitas Node</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 data-mono">
                {department.nodes.toLocaleString('id-ID')}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-6 border-l-4 border-l-blue-500">
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

          <GlassCard className="flex items-center p-6 border-l-4 border-l-purple-500 bg-purple-50/30">
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center header-sans uppercase tracking-wider">
                <Users className="w-5 h-5 mr-2 text-emerald-600" />
                Daftar Personel Aktif
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 data-mono">
                {pagination.total.toLocaleString('id-ID')} Nodes
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200 header-sans">
                    <th className="px-3 py-2 font-bold w-20">UID</th>
                    <th className="px-3 py-2 font-bold">Identitas</th>
                    <th className="px-3 py-2 font-bold">Gender</th>
                    <th className="px-3 py-2 font-bold">Klasifikasi</th>
                    <th className="px-3 py-2 font-bold text-right">Tgl Gabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.emp_no} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-xs font-semibold text-emerald-700 data-mono">#{emp.emp_no}</td>
                      <td className="px-3 py-2">
                        <p className="text-sm font-bold text-slate-800">{emp.first_name} {emp.last_name}</p>
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-slate-500">
                        {emp.gender === 'M' ? 'Pria' : 'Wanita'}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600 data-mono font-medium">{emp.classification || 'N/A'}</td>
                      <td className="px-3 py-2 text-xs text-right data-mono text-slate-500">{emp.hire_date}</td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Tidak ada data personel aktif.</td>
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
                  className={`p-1 rounded border ${pagination.page === 1 ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-2 data-mono">
                  {pagination.page} / {pagination.totalPages.toLocaleString('id-ID')}
                </span>
                <button 
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                  className={`p-1 rounded border ${pagination.page === pagination.totalPages || pagination.totalPages === 0 ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'}`}
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
