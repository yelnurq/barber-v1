<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\Master;
use App\Models\Service;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $masters = Master::all();
        $services = Service::all();

        if ($masters->isEmpty() || $services->isEmpty()) {
            $this->command->warn("Сначала заполни таблицы masters и services!");
            return;
        }

        // Генерируем даты: завтра и послезавтра
       $days = [
    Carbon::now()->addDay(),        // Завтра
    Carbon::now()->addDays(2)       // Послезавтра
];
        foreach ($days as $day) {
            foreach ($masters as $master) {
                // Создаем 3 записи на каждый день для каждого мастера
                for ($i = 0; $i < 3; $i++) {
                    $hour = 10 + ($i * 2); // Записи на 10:00, 12:00, 14:00
                    
                    Appointment::create([
                        'master_id'    => $master->id,
                        'service_id'   => $services->random()->id,
                        'client_name'  => 'Тестовый Клиент ' . ($i + 1),
                        'client_phone' => '7707' . rand(1000000, 9999999),
                        'date_time'    => $day->copy()->setHour($hour)->setMinute(0)->setSecond(0),
                        'status'       => 'pending',
                    ]);
                }
            }
        }

        $this->command->info('Сидер записей успешно выполнен на 2 дня вперед!');
    }
}