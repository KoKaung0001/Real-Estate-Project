import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { LoginRegister } from './pages/LoginRegister';
import { PropertyDetails } from './pages/PropertyDetails';
import { Dashboard } from './pages/Dashboard';
import { AddEditProperty } from './pages/AddEditProperty';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDataManagement } from './pages/AdminDataManagement';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginRegister />} />
                <Route path="/register" element={<LoginRegister />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/property/add" element={<AddEditProperty />} />
                <Route path="/property/edit/:id" element={<AddEditProperty />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/data" element={<AdminDataManagement />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;