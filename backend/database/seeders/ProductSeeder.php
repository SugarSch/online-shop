<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'name' => 'ดินสอ',
                'description' => 'ดินสอคุณภาพดี เขียนลื่น ไม่หักง่าย',
                'price'=> 15,
                'stock_number' => 100,
                'status' => 'avalible'
            ],
            [
                'name' => 'ปากกา',
                'description' => 'ปากกาคุณภาพดี เส้นสวย',
                'price'=> 25,
                'stock_number' => 100,
                'status' => 'avalible'
            ],
            [
                'name' => 'สมุดจด',
                'description' => 'สมุดจดขนาดพกพา น่ารัก กระดาษถนอมสายตา',
                'price'=> 69,
                'stock_number' => 100,
                'status' => 'avalible'
            ],
            [
                'name' => 'ยางลบ',
                'description' => 'ยางลบราคาถูก ลบสะอาด',
                'price'=> 5,
                'stock_number' => 100,
                'status' => 'avalible'
            ]
        ];

        foreach ($rows as $r) {
            $statusId = ProductStatus::where('code', $r['status'])->value('id');
        
            $r['status'] = $statusId ?? 1;

            $img_name = Product::count() + 1;
            $r['img_path'] = $img_name . '.jpg';

            Product::create($r);
        }
    }
}
