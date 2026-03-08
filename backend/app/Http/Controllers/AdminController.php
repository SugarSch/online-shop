<?php

namespace App\Http\Controllers;

use App\HasStatus;
use App\Models\Cart;
use App\Models\Product;
use App\SearchFilter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Image;


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
        $sort_by_seleted = $request->query('sort_by') ?? 'date';
        
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
        if($sort_by_seleted == 'date'){
            $query->orderBy('ordered_at');
        }else{
            $query->orderByRaw('CASE 
                WHEN status = ? THEN 1 
                WHEN status = ? THEN 2
                ELSE 3
            END', [$paid_statusId, $completed_statusId]);
            $query->orderBy('ordered_at');
        }
        

        $orders = $query->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'Get order',
            'data' => $orders
        ]);
        
    }

    public function updateOrder(Request $request, Cart $cart){
        $request->validate([
            'status' => 'required',
        ]);

        $statusId = $this->getStatusIdByCode('cart', $request->status);
        if (!$statusId) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Invalid status'
            ], 400);
        }

        $cart->status = $statusId;
        $cart->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Update order status'
        ]);

    }

    public function getProduct(Request $request){
        // ดึงค่าจาก Query String
        $name_seleted = trim(strtolower($request->query('name')));
        $status_seleted = $request->query('status');

        $query = Product::select('id', 'name', 'img_path', 'price', 'stock_number','status')
                    ->withSum( ['reservations' => function($query) {
                        $query->where('status', 'pending')
                            ->where('expired_at', '>', now());
                    }], 'quantity');
        
        //ช่อง name ใส่ค่ามา
        if ($name_seleted) {
            $query->where('name', 'like', '%' . $name_seleted . '%');
        }

        //ช่อง status ใส่ค่ามา
        if ($status_seleted && $status_seleted !== 'all') {
            $query->where('status', $status_seleted);
        }

        $query->orderBy('name');

        $products = $query->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'Get product',
            'data' => $products
        ]);
    }

    public function getProductDetail(Product $product){

        //เอาค่าจำนวนที่ถูกจองไปแล้วมาแสดงด้วย (เฉพาะที่ยังไม่หมดอายุและยังไม่ถูกยกเลิก)
        $product->loadSum('reservations', 'quantity');

        //สำหรับกราฟยอดขายย้อนหลัง 12 เดือน
        $startDate = Carbon::now()->subMonths(11)->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        $salesData = DB::table('carts')
            ->join('cart_items', 'carts.id', '=', 'cart_items.cart_id')
            ->select(
                // ใช้ to_char เพื่อให้ได้ Format '2025-03' สำหรับจัดกลุ่มและเรียงลำดับ
                DB::raw("to_char(ordered_at, 'YYYY-MM') as month_key"),
                DB::raw("SUM(cart_items.quantity) as total_sales")
            )
            ->where('cart_items.product_id', $product->id)
            ->where('carts.status', 3) // ชำระเงินแล้ว
            ->whereBetween('ordered_at', [$startDate, $endDate])
            ->groupBy(DB::raw("to_char(ordered_at, 'YYYY-MM')"))
            ->orderBy('month_key')
            ->get()
            ->keyBy('month_key'); // เปลี่ยน Collection ให้เรียกใช้ผ่าน Key ได้ง่ายๆ

        // สร้างโครงข้อมูล 12 เดือนให้ครบ (ป้องกันเดือนที่ยอดขายเป็น 0 หายไป)
        $chartData = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $key = $month->format('Y-m'); // '2025-03'
            
            $chartData[] = [
                'name' => $month->translatedFormat('M y'), // เช่น "มี.ค. 25" หรือ "Mar 25"
                'sales' => isset($salesData[$key]) ? (int)$salesData[$key]->total_sales : 0,
            ];
        }

        $data = $product;
        $data->chartData = $chartData;

        return response()->json([
            'status' => 'success',
            'message' => 'Get product detail',
            'data' => $data
        ]);
    }

    public function manageProduct(Request $request){
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock_number' => 'required|numeric|gt:0',
            'img_path' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $product_id = $request->id;
        $existingProduct = null;
        if($product_id){
            $existingProduct = Product::find($product_id);
        }

        $file = $request->file('img_path');
        if($file){
            $fileName = time() . '_' . uniqid() . '.webp';
            $path = 'products/' . $fileName;

            $image = Image::read($file)
                ->cover(300, 300) // ตัดภาพให้พอดี 300x300 (Crop & Resize)
                ->toWebp(80);     // แปลงเป็น WebP คุณภาพ 80%

            // เก็บไฟล์ลงใน storage/app/public/products/
            Storage::disk('public')->put($path, (string) $image);

            //ถ้าเป็นการแก้ไขและมีรูปเดิมอยู่ ให้ลบรูปเดิมออกก่อน
            if($existingProduct && $existingProduct->img_path){
                Storage::disk('public')->delete('products/'.$existingProduct->img_path);
            }

            $data['img_path'] = $fileName;
        }

        if($existingProduct){
            $existingProduct->update($data);
            $product = $existingProduct;
        }else{
            $product = Product::create($data);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product update/added successfully',
            'data' => $product
        ]);
    }

    public function report(Request $request){

    }

    public function reportDetail(Request $request){

    }
    
}
