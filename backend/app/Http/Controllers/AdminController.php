<?php

namespace App\Http\Controllers;

use App\HasStatus;
use App\Models\Cart;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use HasStatus;

    public function getOrder(Request $request){

        $pending_statusId = $this->getStatusIdByCode('cart', 'pending');
        $paid_statusId = $this->getStatusIdByCode('cart', 'paid');
        $completed_statusId = $this->getStatusIdByCode('cart', 'completed');
        
        $query = Cart::query();

        //ช่อง status ใส่ค่ามา
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        //ช่องวันที่ (ดูที่ ordered_at)
        
    }

    public function getProduct(Request $request){

    }

    public function report(Request $request){

    }

    public function reportDetail(Request $request){

    }
    
}
