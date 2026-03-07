<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReservation extends Model
{
    use HasFactory;

    protected $table = 'product_reservations';
    protected $fillable = ['product_id', 'cart_id', 'expired_at', 'status', 'quantity'];

    protected function casts(): array
    {
        return [
            'expired_at' => 'datetime'
        ];
    }
}
