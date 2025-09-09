<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        return Appointment::with(['master', 'service'])->orderBy('date_time', 'desc')->paginate(20);
    }
public function storeAdmin(Request $request)
{
    $validated = $request->validate([
        'client_name'   => 'required|string|max:255',
        'client_phone'  => 'required|string|max:20',
        'master_id'     => 'required|exists:masters,id',
        'service_id'    => 'required|exists:services,id',
        'date_time'     => 'required|date', // ⬅️ без after:now
    ]);

    $dateTime = Carbon::parse($validated['date_time'])->format('Y-m-d H:00');

    // Проверка занятости слота
    $exists = Appointment::where('master_id', $validated['master_id'])
        ->whereRaw("DATE_FORMAT(date_time, '%Y-%m-%d %H:00') = ?", [$dateTime])
        ->exists();

    if ($exists) {
        return response()->json([
            'message' => '❌ Этот слот уже занят. Выберите другое время.'
        ], 422);
    }

    $appointment = Appointment::create($validated);

    return response()->json($appointment, 201);
}

    public function show($id)
    {
        return Appointment::with(['master', 'service'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update($request->all());
        return response()->json(['message' => 'Обновлено']);
    }

    public function destroy($id)
    {
        Appointment::findOrFail($id)->delete();
        return response()->json(['message' => 'Удалено']);
    }

    public function day($date)
{
    $appointments = Appointment::with(['master', 'service'])
        ->whereDate('date_time', $date)
        ->get();

    return $appointments;
}

}
