<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Jobs\SendTelegramNotification;
use Carbon\Carbon;
use App\Models\Master;
use App\Models\Service;
use Illuminate\Support\Facades\Http;
class AppointmentController extends Controller
{
    public function index()
    {
        return Appointment::with(['master', 'service'])->get();
    }


public function store(Request $request)
{
    $validated = $request->validate([
        'client_name'   => 'required|string|max:255',
        'client_phone'  => 'required|string|max:20',
        'master_id'     => 'required|exists:masters,id',
        'service_id'    => 'required|exists:services,id',
        'date_time'     => 'required|date|after:now',
    ]);

    $dateTime = Carbon::parse($validated['date_time'])->format('Y-m-d H:00');

    $exists = Appointment::where('master_id', $validated['master_id'])
        ->whereRaw("DATE_FORMAT(date_time, '%Y-%m-%d %H:00') = ?", [$dateTime])
        ->exists();

    if ($exists) {
        return response()->json([
            'message' => '❌ Этот слот уже занят. Выберите другое время.'
        ], 422);
    }

    $appointment = Appointment::create($validated);

    // ---------- Подготавливаем данные для уведомления ----------
    $masterName = Master::find($validated['master_id'])->name;
    $serviceName = Service::find($validated['service_id'])->name;
    $formattedDate = Carbon::parse($validated['date_time'])->format('d.m.Y H:i');

    $message = "Новая запись!\n"
             . "Имя: {$validated['client_name']}\n"
             . "Телефон: +{$validated['client_phone']}\n"
             . "Мастер: {$masterName}\n"
             . "Услуга: {$serviceName}\n"
             . "Дата и время: {$formattedDate}";

    $botToken = env('TELEGRAM_BOT_TOKEN');
    $chatId = env('TELEGRAM_CHAT_ID');

    // ---------- Отправка уведомления через очередь ----------
    SendTelegramNotification::dispatch($message, $botToken, $chatId);

    // Возвращаем ответ пользователю сразу
    return response()->json($appointment, 201);
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

    /**
     * Получить занятые слоты по дате и мастеру
     */
/**
 * Получить занятые слоты по дате и мастеру
 */
public function getSlots(Request $request)
{
    $validated = $request->validate([
        'date'      => 'required|date',
        'master_id' => 'required|exists:masters,id',
    ]);

    $date = Carbon::parse($validated['date'])->format('Y-m-d');

    $appointments = Appointment::with('service')
        ->where('master_id', $validated['master_id'])
        ->whereDate('date_time', $date)
        ->get();

    $booked = [];

    foreach ($appointments as $a) {
        $start = Carbon::parse($a->date_time);
        $end   = $start->copy()->addMinutes($a->service->duration);

        // добавляем все часы, которые перекрывает услуга
        while ($start < $end) {
            $booked[] = $start->format('H:00');
            $start->addHour();
        }
    }

    return response()->json([
        'date'   => $date,
        'master' => $validated['master_id'],
        'booked' => array_values(array_unique($booked)), // убираем дубли
    ]);
}

}
