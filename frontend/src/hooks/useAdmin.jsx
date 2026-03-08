import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


export const useAdminOrder = (filters = {}) => {
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
        updateOrder: updateOrderMutation.mutate,
    }
};

export const useAdminProduct = (filters = {}) => {
    const { token } = useContext(AuthContext);

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

    return {
        products: productQuery.data,
        isProductLoading: productQuery.isLoading,
        isProductError: productQuery.isError
    }
}

export const useAdminProductDetail = (productId = null) => {

    const { token } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const productDetailQuery = useQuery({
        queryKey: ["adminProductDetail", productId],
        queryFn: async () => {
            try {
                const response = await api.get("/admin/product/" + productId);
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

    //จัดการข้อมูลสินค้า
    const manageProductMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) { // ถ้ามี id แปลว่าเป็นการแก้ไขข้อมูลสินค้า
                return await api.put("/admin/product/", payload);
            } else {
                return await api.post("/admin/product/add", payload);
            }
        },
        onSuccess: () => {
            // ล้างข้อมูลสินค้าเก่าเพื่อให้ React query ดึงตัวใหม่
            queryClient.invalidateQueries({ queryKey: ["adminProducts", "adminProductDetail"] });
        }
    });

    return {
        manageProduct: manageProductMutation.mutate,
        product: productDetailQuery.data,
        isProductDetailLoading: productDetailQuery.isLoading,
        isProductDetailError: productDetailQuery.isError,
    }
}