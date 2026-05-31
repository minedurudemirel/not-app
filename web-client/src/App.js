import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Notes from './components/Notes';

// Giriş yapılmamışsa login sayfasına yönlendiren koruma bileşeni
function PrivateRoute({ children }) {
  const { authToken } = useAuth();
  return authToken ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Varsayılan yönlendirme */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Herkese açık sayfalar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Sadece giriş yapan kullanıcılar için */}
          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
