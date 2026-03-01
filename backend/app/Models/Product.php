<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'price', 'stock_number', 'status'];

    protected $appends = ['img_path']; // เพิ่มตัวนี้เพื่อให้ img_path แสดงใน JSON อัตโนมัติ

    protected function imgPath(): Attribute // เปลี่ยนเป็น CamelCase (แนะนำ)
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['img_path'] // เปลี่ยนเป็นชื่อ column จริงใน DB
                ? '/storage/products/' . $attributes['img_path'] 
                : '/storage/product_placeholder.jpg',
        );
    }

    public function status(){
        return $this->belongsTo(ProductStatus::class,'status','id');
    }
}
