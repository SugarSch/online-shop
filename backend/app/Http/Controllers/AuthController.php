<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\SearchFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use SearchFilter;
    public function login(Request $request){

        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Login fail, please try again'
            ], 401);
        }

        // สร้าง plainTextToken
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login success',
            'plainTextToken' => $token,
            'user' => [
                        'id'=> $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role->code,
                        'default_location' => $user->default_location,
                        'search_filter' => [
                                'date_options' => $this->dateFilter('get_option'),
                                'cart_status_options' => $this->StatusOption('get_option', 'cart'),
                                'cart_status_badges' => $this->StatusOption('badge', 'cart'),
                                'product_status_options' => $this->StatusOption('get_option', 'product'),
                                'product_status_badges' => $this->StatusOption('badge', 'product'),
                            ]
                    ]
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required'
        ]);

        $data['password'] = bcrypt($data['password']);

        $roleId = Role::where('code','client')->first()->id;
        $data['role_id'] = $roleId;

        User::create($data);

        return response()->json(['status'=> 'success','message'=> 'Create User']);

    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Log out'
        ]);
    }

    public function getUser()
    {
        $user = auth()->user();
        $data = $user;
        $data['role'] = $user->role->code;
        $data['search_filter'] = [
            'date_options' => $this->dateFilter('get_option'),
            'cart_status_options' => $this->StatusOption('get_option', 'cart'),
            'cart_status_badges' => $this->StatusOption('badge', 'cart'),
            'product_status_options' => $this->StatusOption('get_option', 'product'),
            'product_status_badges' => $this->StatusOption('badge', 'product'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}
