<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleId = Role::where("code","admin")->first()->id;

        User::create([
            'name' => 'adminuser',
            'email'=> 'adminuser@mail.com',
            'password'=> bcrypt('adminuser'),
            'role_id' => $roleId
        ]);
    }
}
