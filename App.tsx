import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Scanner from './components/Scanner';
import MeatDictionary from './components/MeatDictionary';
import Blog from './components/Blog';
import BlogDetail from './components/BlogDetail';
import History from './components/History';
import LandingPage from './components/LandingPage';
import Premium from './components/Premium';
import AIAssistant from './components/AIAssistant';
import Account from './components/Account';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with main layout */}
          <Route path="/" element={
            <Layout>
              <LandingPage />
            </Layout>
          } />
          <Route path="/blog" element={
            <Layout>
              <Blog />
            </Layout>
          } />
          <Route path="/blog/:id" element={
            <Layout>
              <BlogDetail />
            </Layout>
          } />
          <Route path="/dictionary" element={
            <Layout>
              <MeatDictionary />
            </Layout>
          } />

          {/* Auth routes with auth layout (no navigation) */}
          <Route path="/signin" element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          } />
          <Route path="/signup" element={
            <AuthLayout>
              <SignUp />
            </AuthLayout>
          } />

          {/* App routes with main layout */}
          <Route path="/scan" element={
            <Layout>
              <Scanner />
            </Layout>
          } />
          <Route path="/history" element={
            <Layout>
              <History />
            </Layout>
          } />
          <Route path="/account" element={
            <Layout>
              <Account />
            </Layout>
          } />
          <Route path="/premium" element={
            <Layout>
              <Premium />
            </Layout>
          } />
          <Route path="/assistant" element={
            <Layout>
              <AIAssistant />
            </Layout>
          } />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;