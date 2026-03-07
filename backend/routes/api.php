<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShopController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//product list
Route::get('/products', [ShopController::class,'products']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //cart
    Route::post('/cart/add', [ShopController::class, 'addCart']);
    Route::get('/cart', [ShopController::class, 'currentCart']);
    // {cartItem} = id ของ cart_item นั้น
    Route::patch('/cart/{cartItem}', [ShopController::class, 'updateCartItem']);
    Route::delete('/cart/{cartItem}', [ShopController::class, 'removeCartItem']);

    // {cart} = id ของ cart นั้น
    Route::patch('/cart/order/{cart}', [ShopController::class, 'orderCart']);
    Route::patch('/cart/reserve/{cart}', [ShopController::class, 'reserveStock']);
    Route::get('/cart/order/history', [ShopController::class, 'orderHistory']);

});


//ฝั่ง admin
Route::middleware(['auth:sanctum', EnsureUserIsAdmin::class])->group(function () {
    
    // ทุก Route ที่อยู่ในนี้จะถูกเช็กสิทธิ์ Admin อัตโนมัติ
    Route::get('/admin/report', [AdminController::class, 'report']);
    Route::get('/admin/order', [AdminController::class, 'getOrder']);
    Route::get('/admin/product', [AdminController::class, 'getProduct']);
    
});

//cache for image
// Route::get('/storage/{path}', function ($path) {
//   return response()->file(storage_path("app/public/{$path}"))
//     ->withHeaders([
//       'Cache-Control' => 'public, max-age=604800, immutable',
//     ]);
// })->where('path', '.*');