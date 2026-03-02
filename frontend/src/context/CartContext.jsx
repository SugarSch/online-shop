import { createContext, useState, useEffect, useContext } from 'react';
import api from "../api";
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({children}) => {

    const [cart, setCart] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        // ถ้ามี token ในเครื่อง ให้ไปดึงข้อมูล cart ล่าสุดจาก backend
        const fetchCart = async () => {
            if (token) {
                try {
                    const response = await api.get("/cart");
                    setCart(response.data.data);
                    console.log("CartProvider");
                    console.log(cart);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchCart();
    }, [token]);

    return (
        <CartContext.Provider value={{ cart }}>
            {children}
        </CartContext.Provider>
    );
}