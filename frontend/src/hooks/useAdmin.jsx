import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAdmin = (filters = {}) => {
    const { token } = useContext(AuthContext);
    const queryClient = useQueryClient();

    // ดึงข้อมูลออเดอร์ทั้งหมด
    const orderQuery = useQuery({
        queryKey: ["adminOrders", filters],
        queryFn: async () => {
            try {
                const response = await api.get("/admin/order", {
                    params: {
                        status: filters.status,
                        ordered_at: filters.date,
                        sort_by: filters.sortBy,
                        page: filters.page // ส่งเลขหน้าไปให้ Laravel
                    }
                });
                return response.data.data ? response.data.data : { };
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์");
            }
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 10, // 10 นาที
        retry: false,
        refetchOnWindowFocus: false,
    });

    // แก้ไขข้อมูลออเดอร์
    const updateOrderMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.patch("/admin/order/" + payload.id, payload);
        },
        onSuccess: () => {
            // ล้างข้อมูลออเดอร์เก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
        }
    });

    return {
        orders: orderQuery.data,
        isOrderLoading: orderQuery.isLoading,
        isOrderError: orderQuery.isError,
        updateOrder: updateOrderMutation.mutate
    }
}