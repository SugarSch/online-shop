import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useCart = () => {
    const { token } = useContext(AuthContext);
    const queryClient = useQueryClient();

    // ดึงข้อมูลสินค้าในตะกร้า
    const cartQuery = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            try {
                const response = await api.get("/cart");
                return response.data.data ? response.data.data : { cart: {}, cartItems: [], total_price: 0 };
            } catch (error) {
                return { cart: {}, cartItems: [], total_price: 0 };
            }
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 10, // 10 นาที
        retry: false,
        refetchOnWindowFocus: false,
    });

    // เพิ่มสินค้าลงตะกร้า
    const addCartMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.post("/cart/add", payload);
        },
        onSuccess: () => {
            // ล้างข้อมูลตะกร้าเก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    //แก้ไขจำนวนสินค้า
    const updateCartMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.patch("/cart/" + payload.id, payload);
        },
        onSuccess: () => {
            // ล้างข้อมูลตะกร้าเก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    //ลบสินค้าออกจากตะกร้า
    const removeCartMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.delete("/cart/" + payload.id);
        },
        onSuccess: () => {
            // ล้างข้อมูลตะกร้าเก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    //order สมบูรณ์
    const orderCartMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.patch("/cart/order/" + payload.id, payload);
        },
        onSuccess: () => {
            // ล้างข้อมูลตะกร้าเก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    return {
        cart: cartQuery.data,
        isLoading: cartQuery.isLoading,
        isError: cartQuery.isError,
        addCart: addCartMutation.mutate,
        isCartAdding: addCartMutation.isPending,
        updateCart: updateCartMutation.mutate,
        isCartUpdating: updateCartMutation.isPending,
        removeCart: removeCartMutation.mutate,
        isCartRemoving: removeCartMutation.isPending,
        orderCart: orderCartMutation.mutate,
        isCartOrdering: orderCartMutation.isPending
    };
};