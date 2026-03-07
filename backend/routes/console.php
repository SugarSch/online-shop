<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// รันคำสั่งคืนสต็อกทุกๆ 1 นาที
Schedule::command('reservation:release')->everyMinute();
