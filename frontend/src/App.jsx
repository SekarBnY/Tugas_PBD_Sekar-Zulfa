
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Registry } from './pages/Registry';
import { Departments } from './pages/Departments';
import { Processing } from './pages/Processing';

import { DepartmentDetail } from './pages/DepartmentDetail';

function App() {
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registry" element={<Registry />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/departments/:dept_no" element={<DepartmentDetail />} />
        <Route path="/processing" element={<Processing />} />
      </Routes>
    </div>
  );
}

export default App;
