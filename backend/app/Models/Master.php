<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Master extends Model
{
    protected $fillable = ['name', 'specialization', 'phone', 'is_active'];


    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}

