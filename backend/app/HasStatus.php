<?php

namespace App;

use Illuminate\Support\Facades\Cache;
trait HasStatus
{
    public function getStatusIdByCode($type, $code) {
        $modelName = "App\\Models\\" . ucfirst($type) . "Status";
        return Cache::rememberForever("status_{$type}_{$code}_id", function () use ($modelName, $code) {
            return $modelName::where('code', $code)->value('id');
        });
    }
}
