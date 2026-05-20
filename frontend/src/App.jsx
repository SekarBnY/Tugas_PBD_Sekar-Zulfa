
import { Routes, Route } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Registry } from './pages/Registry';
import { Departments } from './pages/Departments';
import { Processing } from './pages/Processing';
import { DepartmentDetail } from './pages/DepartmentDetail';
import { ManagerReport } from './pages/ManagerReport';

// Konfigurasi SWR Global:
// - dedupingInterval 300s: request yang sama tidak dikirim ulang dalam 5 menit
// - revalidateOnFocus: false: tidak re-fetch saat user alt+tab kembali ke browser
// - revalidateOnReconnect: false: tidak re-fetch otomatis saat koneksi pulih
// - errorRetryCount: 2: maksimal 2x retry jika error, tidak spam request
const swrConfig = {
  dedupingInterval: 300000,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 2,
  errorRetryInterval: 3000,
};

function App() {
  return (
    <SWRConfig value={swrConfig}>
      <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:dept_no" element={<DepartmentDetail />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/managers" element={<ManagerReport />} />
        </Routes>
      </div>
    </SWRConfig>
  );
}

export default App;
