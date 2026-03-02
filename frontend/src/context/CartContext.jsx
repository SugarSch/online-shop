import { createContext, useState, useEffect, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({children}) => {
    const { token } = useContext(AuthContext);

    const { data: cart } = useQuery(
        {
            queryKey: ["cart"],
            queryFn: async () => {
                const response = await api.get("/cart");
                return response.data.data;
            },
            enabled: !!token, // ดึงได้เมื่อมี token แล้วเท่านั้น
            staleTime: 1000 * 60 * 10, //ดึงข้อมูล user ใหม่ทุก ๆ 20 นาที
            retry: false //ถ้า fail ไม่ต้องพยายามดึงใหม่
        }
    );

    return (
        <CartContext.Provider value={{ cart }}>
            {children}
        </CartContext.Provider>
    );
}