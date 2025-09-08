<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Атрибуты, которые можно массово заполнять
     */
    protected $fillable = [
        'name',
        'phone',
        'password',
        'role',
    ];

    /**
     * Атрибуты, которые скрываются при сериализации
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Преобразования типов
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Связь: пользователь имеет много токенов
     */
    public function tokens()
    {
        return $this->hasMany(Token::class);
    }

 
}
