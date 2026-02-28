<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartStatus extends Model
{
    use HasFactory;

    protected $table = 'cart_status';

    protected $fillable = ['code', 'label'];

    public function products()
    {
        return $this->hasMany(
            Product::class,
            'status'
        );
    }
}
