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
        // เพิ่ม index ให้ price เพื่อช่วยให้ query ตอนหาสินค้าไวขึ้น
        Schema::table('products', function (Blueprint $table) {
            $table->index('price');
        });

        //เพิ่มคอลัมด์ snap_price, snap_name ไว้เก็บข้อมูลสินค้า
        Schema::table('cart_items', function (Blueprint $table) {
            $table->decimal('snap_price')->nullable()->after('product_id');
            $table->string('snap_name')->nullable()->after('snap_price');
        });

        //เพิ่มตารางจอง stock สินค้า
        Schema::create('product_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained();
            $table->foreignId('product_id')->constrained();
            //pending (ระหว่างจอง), cancelled (ยกเลิกเมื่อผ่าน expired), completed (ลูกค้าชำระเงินสำเร็จแล้วเข้าไปตัด stock จริง)
            $table->string('status');
            $table->timestamp('expired_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['price']);
        });

         Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('snap_price');
             $table->dropColumn('snap_name');
        });

        Schema::dropIfExists('product_reservations');
    }
};
