<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        //ถ้า user เป็น admin >>> ทำงานต่อ
        if (auth()->check() && auth()->user()->role->code === 'admin') {
            return $next($request);
        }

        // ถ้าไม่ใช่ admin ให้ตอบกลับเป็น 403 Forbidden
        return response()->json([
            'status' => 'fail',
            'message' => 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้'
        ], 403);
    }
}
