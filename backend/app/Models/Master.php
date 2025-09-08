<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Master extends Model
{
    protected $fillable = ['name', 'photo', 'specialization', 'schedule'];

    protected $casts = [
        'schedule' => 'array',
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}

