<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShopController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//product list
Route::get('/products', [ShopController::class,'products']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    //cart
    Route::post('/cart/add', [ShopController::class, 'addCart']);
    Route::get('/cart', [ShopController::class, 'currentCart']);
    // {cartItem} = id ของ cart_item นั้น
    Route::patch('/cart/{cartItem}', [ShopController::class, 'updateCartItem']);
    Route::delete('/cart/{cartItem}', [ShopController::class, 'removeCartItem']);

    // {cart} = id ของ cart นั้น
    Route::patch('/cart/{cart}', [ShopController::class, 'updateCartStatus']);

});