import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthContext, AuthProvider } from './context/AuthContext';

import Login from './client/Login';
import Register from './client/Register';
import Home from './client/Home';
import Product from './client/Product';
import History from './client/History';

//เช็กสิทธิ ถ้ายังไม่ login จะพากลับ login page
const ProtectedRoute = ({ children }) => {
    const { token, loading, user } = useContext(AuthContext);

    if (token && loading && !user) {
        return <p className="text-center mt-5">กำลังยืนยันตัวตน...</p>;
    }

    if (!token) return <Navigate to="/login" />;
    
    return children;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 30, // ดึง cache ใหม่ ทุก ๆ 30 นาที
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
            <Routes>

              <Route path="/" element={
                                  <ProtectedRoute>
                                    <Home />
                                  </ProtectedRoute>
                                } >
                  <Route path="" element={ <Product /> } />
                  <Route path="product" element={ <Product /> } />
                  <Route path="history" element={ <History /> } />
                  <Route path="cart/:id" element={ <Home /> } />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

            </Routes>    
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
