<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReservation extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'cart_id', 'expired_at', 'status'];

    protected function casts(): array
    {
        return [
            'expired_at' => 'datetime'
        ];
    }
}
