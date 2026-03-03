<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartStatus;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ShopController extends Controller
{
    public function products(){
        $products = Product::all();

        return response()->json([
            'status' => 'success',
            'message' => 'Get product',
            'data' => $products
        ]);
    }

    public function currentCart(Request $request){
        $userId = auth()->user()->id;
        $statusId = CartStatus::where('code','pending')->first()->id;
        $cart = Cart::where('user_id', $userId)
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
        $statusId = CartStatus::where('code','pending')->first()->id;
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
            ]);
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
            ]);
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

    public function updateCartStatus(Request $request, Cart $cart){
        //ตรวจสอบสิทธิก่อน
        Gate::authorize('update', $cart);

        $data = $request->validate([
            'status' => 'required|exists:cart_status,id',
            'location' => 'required|string'
        ]);

        $cart->status = $data['status'];

        return response()->json([
            'status' => 'success',
            'message' => 'Update cart status'
        ]);
    }
}
