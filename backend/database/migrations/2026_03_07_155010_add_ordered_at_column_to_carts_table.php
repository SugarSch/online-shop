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
        Schema::table('carts', function (Blueprint $table) {
            $table->timestamp('ordered_at')->nullable()->after('status');
        });

        //อัพเดทข้อมูล ordered_at
        $paidStatusId = DB::table('cart_status')->where('code', 'paid')->value('id');
        DB::table('carts')
            ->where('status', $paidStatusId) 
            ->update(['ordered_at' => DB::raw('updated_at')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn('ordered_at');
        });
    }
};
