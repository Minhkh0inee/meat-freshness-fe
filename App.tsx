import React from 'react';
import Layout from './components/Layout';
import AppRoutes from './src/routes/AppRoutes';
import { AuthProvider } from './src/context/AuthContext';


function App() {
  return (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
  );
}

export default App;