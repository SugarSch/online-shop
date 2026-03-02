import React, { useState, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthContext, AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Login from './client/Login';
import Register from './client/Register';
import Home from './client/Home';
import Product from './client/Product';
import History from './client/History';

//เช็กสิทธิ ถ้ายังไม่ login จะพากลับ login page
const ProtectedRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);

    if (loading) return <p>Loading...</p>;
    if (!token) return <Navigate to="/login" />;
    
    return children;
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          {/* ใช้ Consumer เพื่อเช็กสถานะ loading */}
          <AuthContext.Consumer>
              {({ loading }) => (
                  loading ? <p className="text-center mt-5">กำลังโหลดข้อมูล...</p> : (
                      <CartProvider>
                        <BrowserRouter>
                            <Routes>

                              <Route path="/" element={
                                                  <ProtectedRoute>
                                                    <Home />
                                                  </ProtectedRoute>
                                                } >
                                  <Route path="" element={ <Product /> } />
                                  <Route path="products" element={ <Product /> } />
                                  <Route path="history" element={ <History /> } />
                                  <Route path="cart/:id" element={ <Home /> } />
                              </Route>
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />

                            </Routes>
                        </BrowserRouter>
                      </CartProvider>
                  )
              )}
          </AuthContext.Consumer>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
