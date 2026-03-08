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
                return response.data.data ? response.data.data : { cart: {}, cartItems: [], total_price: 0, expired_at: null };
            } catch (error) {
                return { cart: {}, cartItems: [], total_price: 0, expired_at: null };
            }
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 10, // 10 นาที
        retry: false,
        refetchOnWindowFocus: false,
    });

    // ดึงประวัติออเดอร์
    const cartOrderHistoryQuery = useQuery({
        queryKey: ["cartOrderHistory"],
        queryFn: async () => {
            try {
                const response = await api.get("/cart/order/history");
                return response.data.data ? response.data.data : { };
            } catch (error) {
                return {  };
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

    //จองสินค้าใน stock ตอนกำลังสั่งซื้อ
    const reserveStockCartMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.patch("/cart/reserve/" + payload.id, payload);
        },
        onSuccess: (newData) => {
        // อัปเดตข้อมูลใน Cache ของ "cart" ทันทีโดยไม่ต้องยิง API ใหม่
            queryClient.setQueryData(["cart"], (oldData) => {
                return {
                    ...oldData,
                    expired_at: newData.data.expired_at // อัปเดตค่า expired
                    
                };
            });
            
            // สั่ง invalidate ควบคู่ไปด้วย
            queryClient.invalidateQueries({ queryKey: ["cart"], exact: false });
        }
        
    });

    //order สมบูรณ์
    const orderCartMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.patch("/cart/order/" + payload.id, payload);
        },
        onSuccess: () => {
            // ล้างข้อมูลตะกร้าเก่าเพื่อให้ React query ดึงตัวใหม่

            queryClient.setQueryData(["cart"], () => {
                return {}; //ล้างตะกร้าให้ว่าง
            });
            queryClient.invalidateQueries({ queryKey: ["cart", "cartOrderHistory", "authUser"], exact: false });
        }
    });

    return {
        cart: cartQuery.data,
        isLoading: cartQuery.isLoading,
        isError: cartQuery.isError,
        cartHistory: cartOrderHistoryQuery.data,
        isLoadingHistory: cartOrderHistoryQuery.isLoading,
        isErrorHistory: cartOrderHistoryQuery.isError,
        addCart: addCartMutation.mutate,
        isCartAdding: addCartMutation.isPending,
        updateCart: updateCartMutation.mutate,
        isCartUpdating: updateCartMutation.isPending,
        removeCart: removeCartMutation.mutate,
        isCartRemoving: removeCartMutation.isPending,
        reserveStockCart: reserveStockCartMutation.mutate,
        isCartReserving: reserveStockCartMutation.isPending,
        orderCart: orderCartMutation.mutate,
        isCartOrdering: orderCartMutation.isPending
    };
};