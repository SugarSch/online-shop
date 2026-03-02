<?php

namespace Database\Seeders;

use App\Models\CartStatus;
use App\Models\ProductStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $product_rows = [
            ['code' => 'avalible', 'label' => 'เปิดขาย'],
            ['code' => 'out_of_stock', 'label' => 'หมดสต็อก']
        ];

        foreach ($product_rows as $r) {
            ProductStatus::updateOrCreate(
                ['code' => $r['code']],
                $r
            );
        }

        $cart_rows = [
            ['code' => 'pending', 'label' => 'กำลังดำเนินการ'],
            ['code' => 'completed', 'label' => 'สินค้าถูกส่งแล้ว'],
            ['code' => 'paid', 'label' => 'ชำระเรียบร้อย']
        ];

        foreach ($cart_rows as $r) {
            CartStatus::updateOrCreate(
                ['code' => $r['code']],
                $r
            );
        }
    }
}
