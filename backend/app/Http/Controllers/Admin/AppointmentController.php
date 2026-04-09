<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Master;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index()
    {
        return Appointment::with(['master', 'service'])->orderBy('date_time', 'desc')->paginate(20);
    }
public function storeAdmin(Request $request)
{
    // 1. Валидация входных данных
    $validated = $request->validate([
        'master_id' => 'required|exists:masters,id',
        'service_id' => 'required|exists:services,id',
        'client_name' => 'required|string|max:255',
        'client_phone' => 'required|string',
        'date' => 'required|date_format:Y-m-d',
        'time' => 'required|date_format:H:i',
    ]);

    // 2. Создаем чистую строку даты и времени (Y-m-d H:i:00)
    // Это решит проблему несовместимости функций форматирования БД
    $dateTime = Carbon::parse($validated['date'] . ' ' . $validated['time'])
        ->format('Y-m-d H:i:s');

    // 3. Проверка: не занят ли мастер на это время?
    // Используем обычный where, чтобы работало и в SQLite, и в MySQL
    $exists = Appointment::where('master_id', $validated['master_id'])
        ->where('date_time', $dateTime)
        ->where('status', '!=', 'cancelled') // Отмененные записи не считаются занятыми
        ->exists();

    if ($exists) {
        return response()->json([
            'message' => 'ВНИМАНИЕ: Данный временной слот уже занят этим мастером.'
        ], 422);
    }

    // 4. Создание записи
    try {
        $appointment = Appointment::create([
            'master_id' => $validated['master_id'],
            'service_id' => $validated['service_id'],
            'client_name' => $validated['client_name'],
            'client_phone'  => (string)$validated['client_phone'], // Убедитесь, что это строка
            'date_time' => $dateTime,
            'status' => 'pending', // По умолчанию для админки
        ]);

        return response()->json([
            'message' => 'Запись успешно создана',
            'appointment' => $appointment->load(['master', 'service'])
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Ошибка при сохранении: ' . $e->getMessage()
        ], 500);
    }
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
    $appointment = Appointment::findOrFail($id);
    $appointment->delete();

    return response()->json(['message' => 'Запись удалена']);
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
        $appointments = Appointment::with('service')
            ->where('master_id', $master->id)
            ->whereDate('date_time', $date)
            ->get();

        // Финансовая часть
        $total = $appointments->sum(fn($a) => $a->service?->price ?? 0);
        $confirmed = $appointments->where('status', 'confirmed')
            ->sum(fn($a) => $a->service?->price ?? 0);

        // Количество записей
        $clients = $appointments->count();
        $confirmedClients = $appointments->where('status', 'confirmed')->count();

        return [
            'master_id'          => $master->id,
            'master_name'        => $master->name,
            'total'              => $total,
            'confirmed'          => $confirmed,
            'clients'            => $clients,
            'confirmed_clients'  => $confirmedClients,
        ];
    });

    return response()->json($stats);
}

public function total()
{
    // Общая сумма по всем записям
    $total = \DB::table('appointments')
        ->join('services', 'appointments.service_id', '=', 'services.id')
        ->sum('services.price');

    // Общая сумма только подтверждённых
    $confirmed = \DB::table('appointments')
        ->join('services', 'appointments.service_id', '=', 'services.id')
        ->where('appointments.status', 'confirmed')
        ->sum('services.price');

    // Количество записей
    $clients = Appointment::count();
    $confirmedClients = Appointment::where('status', 'confirmed')->count();

    return response()->json([
        'total'             => $total,
        'confirmed'         => $confirmed,
        'clients'           => $clients,
        'confirmed_clients' => $confirmedClients,
    ]);
}

/**
 * Топ услуг за период (например за день)
 */
public function topServices($date)
{
    $services = \DB::table('appointments')
        ->join('services', 'appointments.service_id', '=', 'services.id')
        ->select('services.name', \DB::raw('COUNT(*) as count'), \DB::raw('SUM(services.price) as revenue'))
        ->whereDate('appointments.date_time', $date)
        ->groupBy('services.id', 'services.name')
        ->orderByDesc('revenue')
        ->limit(5)
        ->get();

    return response()->json($services);
}
    public function summary()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // === Общая статистика ===
        $totalSum = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.status', 'confirmed')
            ->sum('services.price');

        $totalClients = DB::table('appointments')
            ->where('status', 'confirmed')
            ->count();

        $avgCheck = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.status', 'confirmed')
            ->avg('services.price');

        // === Лучшая услуга ===
        $topService = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->select(
                'appointments.service_id',
                'services.name as service_name',
                DB::raw('COUNT(appointments.id) as cnt'),
                DB::raw('SUM(services.price) as total')
            )
            ->where('appointments.status', 'confirmed')
            ->groupBy('appointments.service_id', 'services.name')
            ->orderByDesc('total')
            ->first();

        // === Лучший мастер ===
        $topMaster = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->join('masters', 'appointments.master_id', '=', 'masters.id')
            ->select(
                'appointments.master_id',
                'masters.name as master_name',
                DB::raw('SUM(services.price) as confirmed_sum'),
                DB::raw('COUNT(appointments.id) as confirmed_clients')
            )
            ->where('appointments.status', 'confirmed')
            ->groupBy('appointments.master_id', 'masters.name')
            ->orderByDesc('confirmed_sum')
            ->first();

        // === Сегодня ===
        $todaySum = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->whereDate('appointments.date_time', $today)
            ->where('appointments.status', 'confirmed')
            ->sum('services.price');

        $todayClients = DB::table('appointments')
            ->whereDate('appointments.date_time', $today)
            ->where('status', 'confirmed')
            ->count();

        $todayTopService = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->select(
                'services.name',
                DB::raw('COUNT(appointments.id) as cnt')
            )
            ->whereDate('appointments.date_time', $today)
            ->where('appointments.status', 'confirmed')
            ->groupBy('services.name')
            ->orderByDesc('cnt')
            ->first();

        // === Вчера ===
        $yesterdaySum = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->whereDate('appointments.date_time', $yesterday)
            ->where('appointments.status', 'confirmed')
            ->sum('services.price');

        $yesterdayClients = DB::table('appointments')
            ->whereDate('appointments.date_time', $yesterday)
            ->where('status', 'confirmed')
            ->count();

        // === Сравнение сегодня/вчера ===
        $todayVsYesterday = [
            'sum_change' => $yesterdaySum > 0
                ? round((($todaySum - $yesterdaySum) / $yesterdaySum) * 100, 1) . '%'
                : 'N/A',
            'clients_change' => $yesterdayClients > 0
                ? round((($todayClients - $yesterdayClients) / $yesterdayClients) * 100, 1) . '%'
                : 'N/A',
        ];

        // === Недели ===
        $byWeek = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->select(
                DB::raw('YEARWEEK(appointments.date_time, 1) as yearweek'),
                DB::raw('MIN(DATE(appointments.date_time)) as start_date'),
                DB::raw('MAX(DATE(appointments.date_time)) as end_date'),
                DB::raw('SUM(services.price) as total')
            )
            ->where('appointments.status', 'confirmed')
            ->groupBy('yearweek')
            ->orderBy('yearweek')
            ->get()
            ->map(function ($item) {
                $start = Carbon::parse($item->start_date)->format('d M');
                $end   = Carbon::parse($item->end_date)->format('d M');
                return [
                    'week' => "{$start} – {$end}",
                    'total' => (int) $item->total,
                ];
            });

        // === Месяцы ===
        $byMonth = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->select(
                DB::raw("DATE_FORMAT(appointments.date_time, '%Y-%m') as month"),
                DB::raw('SUM(services.price) as total')
            )
            ->where('appointments.status', 'confirmed')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'total_sum' => (int) $totalSum,
            'total_clients' => $totalClients,
            'avg_check' => round($avgCheck, 0),
            'top_service' => $topService,
            'top_master' => $topMaster,
            'today' => [
                'sum' => (int) $todaySum,
                'clients' => $todayClients,
                'top_service' => $todayTopService ? $todayTopService->name : null,
            ],
            'today_vs_yesterday' => $todayVsYesterday,
            'byWeek' => $byWeek,
            'byMonth' => $byMonth,
        ]);
    }
public function clientBase()
{
   $clients = DB::table('appointments as a')
            ->join('services as s', 'a.service_id', '=', 's.id')
            ->select(
                'a.client_phone',
                DB::raw('MAX(a.client_name) as client_name'),
                DB::raw('COUNT(*) as visits'),
                DB::raw('SUM(s.price) as total_spent'),
                DB::raw('MAX(a.date_time) as last_visit')
            )
            ->where('a.status', 'confirmed') // считаем только подтвержденные визиты
            ->groupBy('a.client_phone')
            ->orderByDesc('last_visit')
            ->get();

        return response()->json($clients);
}



}
