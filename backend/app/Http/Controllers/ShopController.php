<?php

namespace App\Http\Controllers;

use App\HasStatus;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CartStatus;
use App\Models\Product;
use App\Models\ProductReservation;
use App\Models\ProductStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ShopController extends Controller
{
    use HasStatus;
    public function products(){

        //เอาเฉพาะ available
        $statusId = $this->getStatusIdByCode('product', 'available');
        
        $products = Product::where('status', $statusId)
                    ->select('id', 'name', 'img_path', 'price', 'stock_number','status')
                    ->withSum(['reservations' => function($query) {
                        $query->where('status', 'pending')
                            ->where('expired_at', '>', now());
                    }], 'quantity')
                    ->orderBy('created_at', 'desc')
                    ->paginate(12);

        return response()->json([
            'status' => 'success',
            'message' => 'Get product',
            'data' => $products
        ]);
    }

    public function currentCart(Request $request){
        $userId = auth()->user()->id;
        $statusId = $this->getStatusIdByCode('cart', 'pending');
        $cart = Cart::with(['cartItems.product', 'reservations'])
                    ->where('user_id', $userId)
                    ->where('status', $statusId)
                    ->first();
        $data = [];
        if($cart){
            $totalPrice = 0;
            $data['cart'] = $cart->toArray();
            $data['cartItems'] = [];
            foreach($cart->cartItems as $cartItem){
                $totalPrice += ($cartItem->quantity * $cartItem->product->price);
                $data['cartItems'][] = [
                    'id' => $cartItem->id,
                    'product_id'=> $cartItem->product_id,
                    'name' => $cartItem->product->name,
                    'price' => $cartItem->product->price,
                    'quantity'=> $cartItem->quantity,
                    'total' => $cartItem->product->price * $cartItem->quantity
                ];
            }
            
            $data['total_price'] = $totalPrice;

            //เอา expired การจองสินค้ามาสำหรับโชว์ตอนกำลังชำระเงิน
            $reserve = $cart->reservations->where('status', 'pending')->min('expired_at');

            $data['expired_at'] = $reserve ? $reserve : null ;

        }

        return response()->json([
            'status' => 'success',
            'message' => 'Get cart',
            'data' => $data
        ]);
        
    }

    public function addCart(Request $request){
        $data = $request->validate([
            'product_id' => 'required|exists:products,id', //ต้องเป็น product ที่มีอยู่จริง
            'quantity' => 'required|numeric|gt:0'
        ]);

        //ตรวจสอบว่า user นี้เคยมีตะกร้าที่ค้างอยู่รึเปล่า
        $userId = auth()->user()->id;
        $cartId = $cartItemId = 0;
        $statusId = $this->getStatusIdByCode('cart', 'pending');
        $cart = Cart::where('user_id', $userId)
                    ->where('status', $statusId)
                    ->first();
        //ถ้ามี
        if($cart){
            $cartId = $cart->id;
            //ตรวจสอบว่าในตะกร้าอันนี้มี product นี่อยู่แล้วไหม >>> ถ้ามีอยู่แล้วให้บวกเพิ่มเข้าไป
            foreach($cart->cartItems as $cartItem){
                if($cartItem->product_id == $data['product_id']){
                    $cartItemId = $cartItem->id;
                    $data['quantity'] = $cartItem->quantity + $data['quantity'];
                    break;
                }
            }

        }

        //ตรวจสอบว่าจำนวนไม่มากกว่า stock สินค้าที่มีใช่ไหม
        $product = Product::find( $data['product_id'] );
        if($product->stock_number < $data['quantity']){
            return response()->json([
                'status' => 'fail',
                'message' => 'Cannot order more than stock number'
            ], 400);
        }

        if($cartId){
            $data['cart_id'] = $cartId;
            $newCart = $cart;
            if($cartItemId){
                //มีตะกร้าและ product นั้นอยู่แล้ว >>> อัพเดท cartItem
                $cartItem = CartItem::find($cartItemId);
                $cartItem->quantity = $data['quantity'];
                $cartItem->save();

            }else{
                //มีตะกร้าอยู่แล้วแต่ยังไม่เคยมี product นั้น >>> เพิ่ม cartItem
                CartItem::create($data);
            }
        }else{
            $newCart = Cart::create(['user_id' => $userId, 'status' => $statusId]);
            $data['cart_id'] = $newCart->id;

            CartItem::create($data);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Add cart',
            'data' => $newCart
        ]);
    }

    public function updateCartItem(Request $request, CartItem $cartItem){
        //ตรวจสอบสิทธิก่อน
        Gate::authorize('update', $cartItem);
        
        $data = $request->validate([
            'quantity' => 'required|numeric|gt:0'
        ]);

        //ตรวจสอบว่าจำนวนไม่มากกว่า stock สินค้าที่มีใช่ไหม
        $product = Product::find( $cartItem->product_id );
        if($product->stock_number < $data['quantity']){
            return response()->json([
                'status' => 'fail',
                'message' => 'Cannot order more than stock number'
            ], 400);
        }

        $cartItem->quantity = $data['quantity'];
        $cartItem->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Update cart'
        ]);

    }

    public function removeCartItem(CartItem $cartItem){

        //ตรวจสอบสิทธิก่อน
        Gate::authorize('delete', $cartItem);

        $cart = $cartItem->cart;
        $cartItem->delete();

        //ถ้าในตะกร้าไม่มี item เหลืออยู่เลย >>> ลบตะกร้าทิ้งไปด้วย
        if(!$cart->cartItems){
            $cart->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Remove cart item'
        ]);
    }

    public function reserveStock(Cart $cart){
        //ตรวจสอบสิทธิก่อน
        Gate::authorize('update', $cart);

        //เช็กก่อนว่าเคยจองไว้แล้วยังไม่หมดอายุอยู่ไหม
        $existingReservation = $cart->reservations()
                                    ->where('status', 'pending')
                                    ->where('expired_at', '>', now())
                                    ->orderBy('expired_at', 'asc')
                                    ->get();

        if($existingReservation->isNotEmpty()){
            //ยังมีการจองที่ไม่หมดอายุอยู่ >>> ใช้เวลาหมดอายุเดิม
            $expired_at = $existingReservation->first()->expired_at;
        }else{
            //หมดอายุหลังผ่านไป 30 นาที
            $expired_at = now()->addMinutes(30);
        }

        foreach($cart->cartItems as $cartItem){
            DB::transaction(function () use ($cartItem, $expired_at, $existingReservation) {
                $data = [
                    'cart_id' => $cartItem->cart_id,
                    'product_id' => $cartItem->product_id,
                    'status' => 'pending',
                    'expired_at' => $expired_at,
                    'quantity' => $cartItem->quantity
                ];
                if($existingReservation->isNotEmpty()){
                    //เคยมีการจองที่ไม่หมดอายุอยู่แล้ว >>> อัพเดทการจองเดิม
                    $reservation = $existingReservation->where('product_id', $cartItem->product_id)->first();
                    if($reservation){
                        $reservation->update($data);
                    }
                }else{
                    //ไม่มีการจองที่ไม่หมดอายุอยู่เลย >>> สร้างการจองใหม่
                    ProductReservation::create($data);
                }
            });
        }

        return response()->json([
            'status'=> 'success',
            'data'=> ['expired_at' => $expired_at]
        ]);

    }

    public function orderCart(Request $request, Cart $cart){
        //ตรวจสอบสิทธิก่อน
        Gate::authorize('update', $cart);

        $data = $request->validate([
            'location' => 'required|string'
        ]);

        $statusId = $this->getStatusIdByCode('cart', 'paid');

        $cart->location = $data['location'];
        $cart->status = $statusId;
        $cart->ordered_at = now(); //อัพเดทวันที่ออเดอร์
        $cart->save();

        //เอา stock ที่ reserve ไว้มาตัดจริง
        $reservations = $cart->reservations->where('status', 'pending');
        foreach($reservations as $reservation){
            DB::transaction(function () use ($reservation) {
                // คืนค่าสต็อกกลับไปที่ตัวสินค้า
                $product = Product::find($reservation->product_id);
                if ($product) {
                    $product->decrement('stock_number', $reservation->quantity);

                    //ถ้าสต็อกเหลือน้อยกว่า 0 ให้เปลี่ยนสถานะสินค้าเป็น unavailable
                    if ($product->stock_number <= 0) {
                        $out_of_stock_statusId = $this->getStatusIdByCode('product', 'out_of_stock');
                        $product->status = $out_of_stock_statusId;
                        $product->save();
                    }else if ($product->stock_number < 10 &&$product->stock_number > 0){
                        $less_than_10_statusId = $this->getStatusIdByCode('product', 'less_than_10');
                        $product->status = $less_than_10_statusId;
                        $product->save();
                    }
                }
                // อัปเดตสถานะการจองเป็น completed
                $reservation->update(['status' => 'completed']);
            });
        }

        //snap ราคา
        $cartItems = $cart->cartItems;
        foreach($cartItems as $cartItem){
            DB::transaction(function () use ($cartItem) {
                $cartItem->snap_name = $cartItem->product->name;
                $cartItem->snap_price = $cartItem->product->price;
                $cartItem->save();
            });
        }

        // ล้าง Cache ประวัติการสั่งซื้อของ User คนนี้โดยเฉพาะ
        Cache::forget('user_' . auth()->user()->id . '_history');

        //บันทึกข้อมูลที่อยู่ใน user
        if($request->isCheckLocation){
            $userId = auth()->user()->id;
            $user = User::find($userId);
            $user->default_location = $data['location'];
            $user->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Update cart status'
        ]);
    }

    public function orderHistory(){
        $userId = auth()->user()->id;
        $data = Cache::remember('user_'.$userId.'_history', now()->addDay(), function () {
            $userId = auth()->user()->id;

            $statusId = $this->getStatusIdByCode('cart', 'pending');

            $carts = Cart::with(['cartItems.product']) // ดึง cartItems และ product มาพร้อมกัน
                ->where('user_id', $userId)
                ->where('status', '!=', $statusId)
                ->orderBy('updated_at', 'desc')
                ->get();
            
            return $carts->map(function ($cart) {
                        $items = $cart->cartItems->map(function ($item) {
                            $lineTotal = $item->snap_price * $item->quantity;
                            return [
                                'name'     => $item->snap_name,
                                'quantity' => $item->quantity,
                                'price'    => $item->snap_price,
                                'total'    => $lineTotal
                            ];
                        });

                        return [
                            'date'      => $cart->updated_at,
                            'location'  => $cart->location,
                            'status'    => $cart->status, // เปิดใช้ได้ถ้า Load relationship status มาด้วย
                            'items'     => $items,
                            'total'     => $items->sum('total')
                        ];
                    })->toArray();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'get history',
            'data' => $data
        ]);

    }
}
