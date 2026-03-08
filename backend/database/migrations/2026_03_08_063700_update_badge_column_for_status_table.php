<?php

use App\Models\CartStatus;
use App\Models\ProductStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //อัพเดทข้อมูล cart_status
        $cartStatus_data = CartStatus::all();

        foreach($cartStatus_data as $cartStatus){
            if($cartStatus->code == 'completed'){
                $cartStatus->badge = 'success';
                $cartStatus->save();
            } else if($cartStatus->code == 'paid'){
                $cartStatus->badge = 'warning';
                $cartStatus->save();
            }
        }

        //อัพเดทข้อมูล product_status
        $productStatus_data = ProductStatus::all();

        foreach($productStatus_data as $productStatus){
            if($productStatus->code == 'available'){
                $productStatus->badge = 'success';
                $productStatus->save();
            } else if($productStatus->code == 'less_than_10'){
                $productStatus->badge = 'warning';
                $productStatus->save();
            } else if($productStatus->code == 'out_of_stock'){
                $productStatus->badge = 'danger';
                $productStatus->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
