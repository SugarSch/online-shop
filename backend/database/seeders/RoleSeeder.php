<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            ['code' => 'client', 'label' => 'ลูกค้า'],
            ['code' => 'admin', 'label' => 'แอดมิน']
        ];

        foreach ($rows as $r) {
            Role::updateOrCreate(
                ['code' => $r['code']],
                $r
            );
        }
    }
}
