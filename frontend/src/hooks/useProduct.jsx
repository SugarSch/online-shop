import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export const useProduct = (filters = {}) => {
    
    const queryClient = useQueryClient();

    //ดึงข้อมูลสินค้า
    const productQuery = useQuery({
        queryKey: ["product", filters],
        queryFn: async () => {
            const response = await api.get("/products", {
                    params: {
                        name: filters.name,
                        page: filters.page // ส่งเลขหน้าไปให้ Laravel
                    }
                });
            return response.data.data;
        },
        enabled: true, //ดึงได้แม้ไม่มี Token
        staleTime: 1000 * 60 * 20, // ดึงใหม่ ทุก ๆ 20 นาที
        retry: false,
        refetchOnWindowFocus: false,
    });

    // เพิ่ม/ลด stock
    const updateProductMutation = useMutation({
        mutationFn: async (payload) => {
            return await api.patch("/product/update", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product", filters] });
        }
    });

    return {
        product: productQuery.data ?? null,
        isLoading: productQuery.isLoading,
        isError: productQuery.isError,
        updateProduct: updateProductMutation.mutate
    };
};