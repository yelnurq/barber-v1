<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        return Appointment::with(['master', 'service'])->get();
    }

    public function store(Request $request)
    {
        $appointment = Appointment::create($request->all());

        // здесь можно добавить отправку уведомления (email/telegram)
        
        return $appointment;
    }

    public function update(Request $request, Appointment $appointment)
    {
        $appointment->update($request->all());
        return $appointment;
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->noContent();
    }
}
