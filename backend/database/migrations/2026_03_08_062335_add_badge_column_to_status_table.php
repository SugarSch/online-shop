<?php

use App\Models\CartStatus;
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
        Schema::table('cart_status', function (Blueprint $table) {
            $table->string('badge', 25)->default('info')->after('label');
        });

        Schema::table('product_status', function (Blueprint $table) {
            $table->string('badge', 25)->default('info')->after('label');
        });

        Schema::table('product_reservations', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_status', function (Blueprint $table) {
            $table->dropColumn('badge');
        });

        Schema::table('product_status', function (Blueprint $table) {
            $table->dropColumn('badge');
        });

        Schema::table('product_reservations', function (Blueprint $table) {
            $table->string('status')->change();
        });
    }
};
