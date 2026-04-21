import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/contexts/AuthContext';
import { LanguageProvider } from './i18n';
import { ErrorBoundary } from './components/common';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './admin/pages/Login';
import AdminDashboard from './admin/pages/Dashboard';
import RideManagement from './admin/pages/RideManagement';
import ProtectedRoute from './admin/components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Redirect root to /en/ */}
                <Route path="/" element={<Navigate to="/en" replace />} />

                {/* Language-prefixed public routes */}
                <Route path="/:lang" element={<Layout />}>
                  <Route index element={<ErrorBoundary><Home /></ErrorBoundary>} />
                  <Route path="about" element={<ErrorBoundary><About /></ErrorBoundary>} />
                  <Route path="contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
                </Route>

                {/* Admin Routes (no language prefix) */}
                <Route path="/admin/login" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route path="dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                  <Route path="rides" element={<ErrorBoundary><RideManagement /></ErrorBoundary>} />
                </Route>
              </Routes>
            </div>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
