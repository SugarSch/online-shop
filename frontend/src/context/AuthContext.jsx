import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [cart, setCart] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true); // เพิ่ม loading เพื่อเช็กสถานะตอนโหลด

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    useEffect(() => {
        // ถ้ามี token ในเครื่อง ให้ไปดึงข้อมูล user ล่าสุดจาก backend
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await api.get("/user"); // route สำหรับดึงข้อมูล user
                    setUser(response.data.data);
                    localStorage.setItem("user", JSON.stringify(response.data.data));
                } catch (error) {
                    console.error("Token expired or invalid");
                    logout(); // ถ้า token หมดอายุ ให้ logout ทันที
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};