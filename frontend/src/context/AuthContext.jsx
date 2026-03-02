import React, { createContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [token, setToken] = useState(localStorage.getItem("token"));

    //useQuery จัดการข้อมูล User
    const { data: user, isLoading, isFetched } = useQuery(
        {
            queryKey: ["authUser"],
            queryFn: async () => {
                const response = await api.get("/user");
                return response.data.data;
            },
            enabled: !!token, // ดึงได้เมื่อมี token แล้วเท่านั้น
            staleTime: 1000 * 60 * 20, //ดึงข้อมูล user ใหม่ทุก ๆ 20 นาที
            retry: false, //ถ้า fail ไม่ต้องพยายามดึงใหม่
            refetchOnWindowFocus: false, // ไม่ต้องโหลดใหม่เวลาสลับหน้าต่างกลับมา
            refetchOnMount: false,
            initialData: () => { //ดึงข้อมูลเริ่มต้นมาจาก local 
                const savedUser = localStorage.getItem("user_basic");
                return savedUser ? JSON.parse(savedUser) : undefined;
            }
        }
    );

    const login = (userData, userToken) => {
        setToken(userToken);
        localStorage.setItem("token", userToken);

        localStorage.setItem("user_basic", JSON.stringify(userData));
        // สั่งให้ Query "authUser" โหลดข้อมูลใหม่ทันทีหลัง Login
        queryClient.setQueryData(["authUser"], userData);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        queryClient.clear(); //ล้าง Cache ทั้งแอป
    };

    const isInitializing = token && !user; //ใช้เช็กว่าดึงข้อมูลสำเร็จแล้วรึยัง

    const value = React.useMemo(() => ({
            user,
            token,
            login,
            logout,
            loading: isLoading && !!isFetched,
            isInitializing
        }), 
        [user, token, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};