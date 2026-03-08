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


    // ดึงข้อมูล product ทั้งหมด
    const productQuery = useQuery({
        queryKey: ["adminProducts", filters],
        queryFn: async () => {
            try {
                const response = await api.get("/admin/product", {
                    params: {
                        name: filters.name,
                        status: filters.status,
                        page: filters.page // ส่งเลขหน้าไปให้ Laravel
                    }
                });
                return response.data.data ? response.data.data : { };
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
            }
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 10, // 10 นาที
        retry: false,
        refetchOnWindowFocus: false,
    });

    const productDetailQuery = useQuery({
        queryKey: ["adminProductDetail"],
        queryFn: async (payload) => {
            try {
                const response = await api.get("/admin/product/" + payload.id);
                return response.data.data ? response.data.data : { };
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
            }
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 10, // 10 นาที
        retry: false,
        refetchOnWindowFocus: false,
    });

    //เพิ่มส้นค้าใหม่
    const manageProductMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return await api.put("/admin/product/", payload);
            } else {
                return await api.post("/admin/product/add", payload);
            }
        },
        onSuccess: () => {
            // ล้างข้อมูลสินค้าเก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
        }
    });

    return {
        orders: orderQuery.data,
        isOrderLoading: orderQuery.isLoading,
        isOrderError: orderQuery.isError,
        updateOrder: updateOrderMutation.mutate,
        products: productQuery.data,
        isProductLoading: productQuery.isLoading,
        isProductError: productQuery.isError,
        manageProduct: manageProductMutation.mutate,
        productDetail: productDetailQuery.data,
        isProductDetailLoading: productDetailQuery.isLoading,
        isProductDetailError: productDetailQuery.isError,
    }
}