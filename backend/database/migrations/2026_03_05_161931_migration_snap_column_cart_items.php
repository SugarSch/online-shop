<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //migrate เอาข้อมูลสินค้ามาใส่ใน cart_items เดิม
        DB::statement("
            UPDATE cart_items
            SET 
                snap_name = products.name,
                snap_price = products.price
            FROM products, carts, cart_status
            WHERE cart_items.product_id = products.id
            AND cart_items.cart_id = carts.id
            AND carts.status = cart_status.id
            AND cart_status.code IN ('paid', 'completed');
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
