<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Master;
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
  public function daily($date)
    {
        // Получаем всех активных мастеров
        $masters = Master::where('is_active', true)->get();

        $stats = $masters->map(function ($master) use ($date) {
            // Все записи мастера за дату
            $appointments = Appointment::where('master_id', $master->id)
                ->whereDate('date_time', $date)
                ->get();

            $total = $appointments->sum(function ($a) {
                return $a->service?->price ?? 0;
            });

            $confirmed = $appointments->where('status', 'confirmed')
                ->sum(function ($a) {
                    return $a->service?->price ?? 0;
                });

            return [
                'master_id' => $master->id,
                'master_name' => $master->name,
                'total' => $total,
                'confirmed' => $confirmed,
            ];
        });

        return response()->json($stats);
    }
public function total()
{
    // Получаем все записи с сервисами
    $total = \DB::table('appointments')
        ->join('services', 'appointments.service_id', '=', 'services.id')
        ->sum('services.price');

    return response()->json(['total' => $total]);
}


    /**
     * Получение статистики за период (по желанию)
     */
    public function period(Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        $masters = Master::where('is_active', true)->get();

        $stats = $masters->map(function ($master) use ($start, $end) {
            $appointments = Appointment::where('master_id', $master->id)
                ->whereBetween('date_time', [$start, $end])
                ->get();

            $total = $appointments->sum(fn($a) => $a->service?->price ?? 0);
            $confirmed = $appointments->where('status', 'confirmed')
                ->sum(fn($a) => $a->service?->price ?? 0);

            return [
                'master_id' => $master->id,
                'master_name' => $master->name,
                'total' => $total,
                'confirmed' => $confirmed,
            ];
        });

        return response()->json($stats);
    }
}
