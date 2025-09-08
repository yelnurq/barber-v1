<?php

namespace App\Http\Controllers;

use App\Models\Token;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Регистрация пользователя
     */
public function register(Request $request)
{
    try {
        $request->validate([
            "name" => "string|max:255|required",
            "phone" => "required|string|max:20|unique:users,phone",
            "password" => "min:8|required",
            "role" => "in:admin,manager|required"
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            "status" => "error",
            "errors" => $e->errors() // тут будет массив ошибок по полям
        ], 422);
    }

    $user = User::create([
        "name" => $request->name,
        "phone" => $request->phone,
        "password" => \Illuminate\Support\Facades\Hash::make($request->password),
        "role" => $request->role ?? 'manager'
    ]);

    return response()->json([
        "status" => "success",
        "user" => $user,
    ]);
}

    /**
     * Авторизация пользователя
     */
public function login(Request $request)
{
    $request->validate([
        "phone" => "required|string",
        "password" => "required|string",
    ]);

    $user = User::where("phone", $request->phone)->first();

    if (!$user) {
        return response()->json([
            "status" => "unsuccess",
            "message" => "Invalid phone"
        ], 401);
    }

    if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
        return response()->json([
            "status" => "unsuccess",
            "message" => "Invalid password"
        ], 401);
    }

    // Создаем или обновляем токен
    $token = \Illuminate\Support\Str::random(60);

    \App\Models\Token::updateOrCreate(
        ["user_id" => $user->id], // условие поиска
        ["token" => $token]       // обновляемый набор данных
    );

    return response()->json([
        "status" => "success",
        "token" => $token,
        "role" => $user->role
    ]);
}


    /**
     * Выход из системы
     */
    public function logout(Request $request)
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token not provided',
                ], 400);
            }

            $tokenRecord = Token::where('token', $token)->first();

            if (!$tokenRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid token',
                ], 401);
            }

            $tokenRecord->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Logout successful',
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during logout. Please try again later.',
            ], 500);
        }
    }
}
