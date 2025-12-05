import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import AppRoutes from './src/routes/AppRoutes';


function App() {
  return (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
  );
}

export default App;