<?php

namespace App\Http\Controllers;

use App\Models\Master;
use Illuminate\Http\Request;

class MasterController extends Controller
{
    public function index()
    {
        return Master::all();
    }

    public function store(Request $request)
    {
        return Master::create($request->all());
    }

    public function update(Request $request, Master $master)
    {
        $master->update($request->all());
        return $master;
    }

    public function destroy(Master $master)
    {
        $master->delete();
        return response()->noContent();
    }
}
