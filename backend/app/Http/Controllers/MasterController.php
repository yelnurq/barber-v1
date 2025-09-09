<?php

namespace App\Http\Controllers;

use App\Models\Master;
use Illuminate\Http\Request;

class MasterController extends Controller
{
    public function index()
    {
        // Возвращаем только активных мастеров
        return Master::where('is_active', true)->get();
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $data['is_active'] = true; // по умолчанию активный
        return Master::create($data);
    }

    public function update(Request $request, Master $master)
    {
        $master->update($request->all());
        return $master;
    }

    public function destroy(Master $master)
    {
        // Вместо удаления делаем "скрытие"
        $master->update(['is_active' => false]);
        return response()->noContent();
    }
}
