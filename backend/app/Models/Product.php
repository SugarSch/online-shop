<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'price', 'stock_number', 'status'];

    protected function img_path(): Attribute {
        return Attribute::make(get: function($value) {
            return $value ? '/storage/products/'.$value : '/product_placeholeder.jpg';
        });
    }

    public function status(){
        return $this->belongsTo(ProductStatus::class,'status','id');
    }
}
