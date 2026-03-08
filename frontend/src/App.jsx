import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthContext, AuthProvider } from './context/AuthContext';

import Login from './client/Login';
import Register from './client/Register';

//หน้าฝั่ง client
import ClientPanel from './client/ClientPanel';
import Product from './client/Product';
import History from './client/History';
import Order from './client/Order';

//หน้าฝั่ง admin
import AdminPanel from './admin/AdminPanel';
import ProductManagement from './admin/ProductManagement';
import OrderManagement from './admin/OrderManagement';
import Report from './admin/Report';
import ProductDetail from './admin/ProductDetail';
import ProductForm from './admin/ProductForm';

//เช็กสิทธิ ถ้ายังไม่ login จะพากลับ login page
const ProtectedRoute = ({ children, isAdminOnly = false }) => {
    const { token, loading, user } = useContext(AuthContext);

    if (token && loading && !user) {
        return <p className="text-center mt-5">กำลังยืนยันตัวตน...</p>;
    }

    if (!token) return <Navigate to="/login" />;

    //หน้าฝั่ง admin >>> ถ้า user ไม่มีสิทธิ admin ให้ดีดกลับหน้าแรก
    if (isAdminOnly && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    
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
                                    <ClientPanel />
                                  </ProtectedRoute>
                                } >
                  <Route path="product" element={ <Product /> } />
                  <Route path="history" element={ <History /> } />
                  <Route path="order" element={ <Order /> } />
              </Route>

              <Route path="/admin" element={
                                  <ProtectedRoute isAdminOnly={true}>
                                    <AdminPanel />
                                  </ProtectedRoute>
                                } >
                  <Route path="order_management" element={ <OrderManagement /> } />
                  <Route path="product_management" element={ <ProductManagement /> } />
                  <Route path="product/:id?" element={ <ProductDetail /> } />
                  <Route path="product_form/:id?" element={ <ProductForm /> } />
                  <Route path="report" element={ <Report /> } />
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
