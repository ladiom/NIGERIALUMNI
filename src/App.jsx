import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SchoolProfile from './pages/SchoolProfile';
import AlumniProfile from './pages/AlumniProfile';
import Register from './pages/Register';
import RegisterWithSchool from './pages/RegisterWithSchool';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DebugSchools from './pages/DebugSchools';
import Test from './pages/Test';
import SupabaseTest from './pages/SupabaseTest';
import LagosTest from './pages/LagosTest';
import SimpleSearchTest from './pages/SimpleSearchTest';
import LagosVerification from './pages/LagosVerification';
import Admin from './pages/Admin';
import SetupAdmin from './pages/SetupAdmin';
import PendingRegistrations from './pages/PendingRegistrations';
import EmailQueue from './pages/EmailQueue';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/schools/:schoolId" element={<SchoolProfile />} />
            <Route path="/alumni/:alumniId" element={<AlumniProfile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterWithSchool />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/debug" element={<DebugSchools />} />
            <Route path="/test" element={<Test />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="/lagos-test" element={<LagosTest />} />
      <Route path="/simple-search-test" element={<SimpleSearchTest />} />
      <Route path="/lagos-verification" element={<LagosVerification />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/setup-admin" element={<SetupAdmin />} />
            <Route path="/pending-registrations" element={<PendingRegistrations />} />
            <Route path="/email-queue" element={<EmailQueue />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;