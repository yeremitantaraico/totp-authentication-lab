import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ConfigurationPage } from './features/configuration/pages/ConfigurationPage';
import { HomePage } from './features/home/pages/HomePage';
import { ProtectedRoute } from './shared/components/protected-route';
import { AuthProvider } from './shared/context/auth-context';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/configuration" element={<ConfigurationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
