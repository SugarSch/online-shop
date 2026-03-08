<?php

namespace App\Http\Controllers;

use App\HasStatus;
use App\Models\Cart;
use App\Models\Product;
use App\SearchFilter;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use HasStatus, SearchFilter;

    public function getOrder(Request $request){

        $pending_statusId = $this->getStatusIdByCode('cart', 'pending');
        $paid_statusId = $this->getStatusIdByCode('cart', 'paid');
        $completed_statusId = $this->getStatusIdByCode('cart', 'completed');

        // ดึงค่าจาก Query String
        $status_seleted = $request->query('status');
        $ordered_at_seleted = $request->query('ordered_at');
        
        $query = Cart::with('user', 'cartItems.product')->whereHas('cartItems'); // ดึงเฉพาะ order ที่มีสินค้าใน cart เท่านั้น

        //ช่อง status ใส่ค่ามา
        if ($status_seleted && $status_seleted !== 'all') {
            $query->where('status', $status_seleted);
        }else{
            $query->where('status', '!=', $pending_statusId);
        }

        $options = $this->dateFilter('get_option');

        //ช่องวันที่ (ดูที่ ordered_at)
        if ($ordered_at_seleted && in_array($ordered_at_seleted, array_keys($options))) {
            $dateQuery = $this->dateFilter('search', $ordered_at_seleted);
            $query->whereBetween('ordered_at', [$dateQuery['start_at'], $dateQuery['end_at']]);
        }

        //ให้ order ที่จ่ายเงินแล้วแต่ยังไม่ส่ง โชว์ก่อนเสมอ
        $query->orderByRaw('CASE 
                WHEN status = ? THEN 1 
                WHEN status = ? THEN 2
                ELSE 3
            END', [$paid_statusId, $completed_statusId]);
        $query->orderBy('ordered_at');

        $orders = $query->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'Get order',
            'data' => $orders
        ]);
        
    }

    public function updateOrder(Request $request){

    }

    public function getProduct(Request $request){

    }

    public function getProductDetail(Product $product){

    }

    public function addProduct(Request $request){

    }

    public function updateProduct(Request $request){

    }

    public function report(Request $request){

    }

    public function reportDetail(Request $request){

    }
    
}
