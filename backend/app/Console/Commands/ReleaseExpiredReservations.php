<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductReservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReleaseExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservation:release';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'คืนสต็อกสินค้าจากรายการจองที่หมดอายุแล้ว';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // ดึงรายการที่หมดอายุ (expired_at < ตอนนี้) และสถานะยังเป็น pending
        $expiredReservations = ProductReservation::where('status', 'pending')
            ->where('expired_at', '<', now())
            ->get();

        if ($expiredReservations->isEmpty()) {
            $this->info('ไม่มีรายการจองที่หมดอายุ');
            return;
        }

        foreach ($expiredReservations as $reservation) {
            DB::transaction(function () use ($reservation) {
                // คืนค่าสต็อกกลับไปที่ตัวสินค้า
                $product = Product::find($reservation->product_id);
                if ($product) {
                    $product->increment('stock_number', $reservation->quantity);
                }

                // อัปเดตสถานะการจองเป็น expired
                $reservation->update(['status' => 'cancelled']);
                
                $this->info("คืนสต็อกสินค้า ID: {$reservation->product_id} จำนวน {$reservation->quantity} ชิ้น เรียบร้อย");
            });
        }
    }
}
