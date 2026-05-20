import React, { useEffect, useState, memo } from 'react';
import axios from 'axios';
import useSWR, { preload } from 'swr';
import { Search, ChevronLeft, ChevronRight, Activity, AlertTriangle, UserCog, Calendar } from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';

const fetcher = url => axios.get(url).then(res => res.data);


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

// Optimasi: Memisahkan baris tabel manajer menjadi komponen Memoized
const ManagerRow = memo(({ mgr }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className="px-4 py-2.5 text-xs font-semibold text-indigo-700 data-mono">#{mgr.emp_no}</td>
    <td className="px-4 py-2.5">
      <div className="flex items-center">
        <div className="p-1.5 bg-indigo-100 rounded mr-3 text-indigo-600">
            <UserCog className="w-4 h-4" />
        </div>
        <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{mgr.full_name}</p>
      </div>
    </td>
    <td className="px-4 py-2.5 text-xs font-bold text-slate-600 data-mono bg-slate-50">{mgr.last_name}</td>
    <td className="px-4 py-2.5 text-xs font-medium text-purple-700 whitespace-nowrap">
      {mgr.dept_name}
    </td>
    <td className="px-4 py-2.5 text-xs text-slate-600 data-mono font-medium whitespace-nowrap">
      <div className="flex items-center">
        <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
        {mgr.from_date.split('T')[0]} <span className="mx-2 text-slate-300">→</span> {mgr.to_date.split('T')[0] === '9999-01-01' ? <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">Sekarang</span> : mgr.to_date.split('T')[0]}
      </div>
    </td>
  </tr>
));

export const ManagerReport = () => {
  const [paginationState, setPaginationState] = useState({ page: 1, limit: 15 });
  const [searchLastName, setSearchLastName] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [perfMetric, setPerfMetric] = useState(null);

  const queryParams = `page=${paginationState.page}&limit=${paginationState.limit}&last_name=${activeSearch}`;
  const apiUrl = `http://localhost:5000/api/managers?${queryParams}`;

  const startTime = performance.now();
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, { 
    keepPreviousData: true,
    onSuccess: () => {
      const endTime = performance.now();
      setPerfMetric(Math.round(endTime - startTime));
    }
  });

  const managers = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 15, totalPages: 1, total: 0 };
  const loading = isLoading;
  const errorMsg = error ? "Gagal memuat data manajer dari server. Pastikan database dan server aktif." : null;

  // Prefetch next page
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const nextQueryParams = `page=${pagination.page + 1}&limit=${paginationState.limit}&last_name=${activeSearch}`;
      preload(`http://localhost:5000/api/managers?${nextQueryParams}`, fetcher);
    }
  }, [pagination.page, pagination.totalPages, paginationState.limit, activeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchLastName);
    setPaginationState(prev => ({ ...prev, page: 1 }));
  };

  const handlePrevPage = () => {
    if (paginationState.page > 1) setPaginationState(prev => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (paginationState.page < pagination.totalPages) setPaginationState(prev => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 ml-0 md:ml-64 transition-all">
      <Header title="Laporan Manajer (MGR)" />
      
      <main className="p-4 md:p-8 flex-1 flex flex-col space-y-6">
        
        {/* Warning Banner */}
        {errorMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-center shadow-sm">
            <AlertTriangle className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Search Panel */}
        <GlassCard className="p-4 border-t-4 border-t-indigo-500">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 header-sans uppercase tracking-wider flex items-center">
              <Search className="w-4 h-4 mr-2 text-indigo-600" />
              Pencarian Index Nama Belakang
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Cari last_name (contoh: Facello)..."
                value={searchLastName}
                onChange={(e) => setSearchLastName(e.target.value)}
                className="flex-1 md:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all data-mono"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50"
              >
                Cari & Filter
              </button>
            </form>
          </div>
        </GlassCard>

        {/* Performance Metric Panel */}
        {perfMetric !== null && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center shadow-sm">
            <Activity className="w-5 h-5 text-indigo-600 mr-3" />
            <p className="text-sm font-medium text-indigo-900">
              Uji Performa: Permintaan ke Server & Proses SQL diselesaikan dalam <span className="font-black data-mono text-indigo-700 bg-indigo-200 px-2 py-0.5 rounded">{perfMetric} ms</span>
            </p>
          </div>
        )}

        {/* Data Grid */}
        <GlassCard className="flex-1 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-black text-slate-800 flex items-center header-sans uppercase tracking-wider">
              <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Profil Eksekutif & Riwayat Manajer
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 data-mono hidden md:inline-block">
              TOTAL: {pagination.total.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 header-sans">
                  <th className="px-4 py-3 font-bold w-24">UID Node</th>
                  <th className="px-4 py-3 font-bold">Identitas Manajer</th>
                  <th className="px-4 py-3 font-bold">Nama Belakang</th>
                  <th className="px-4 py-3 font-bold">Unit Operasional (Departemen)</th>
                  <th className="px-4 py-3 font-bold">Periode Masa Jabatan</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={15} cols={5} />
              ) : (
                <tbody className="divide-y divide-slate-100">
                  {managers.map((mgr, idx) => (
                    <ManagerRow key={`${mgr.emp_no}-${idx}`} mgr={mgr} />
                  ))}
                  {managers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Data manajer tidak ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 space-y-3 md:space-y-0">
            <p className="text-xs text-slate-500 font-medium data-mono">
              Rows {(pagination.page - 1) * pagination.limit + (managers.length > 0 ? 1 : 0)} - {Math.min(pagination.page * pagination.limit, pagination.total)}
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
        </GlassCard>
      </main>
      <Footer />
    </div>
  );
};
