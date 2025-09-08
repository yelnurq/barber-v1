<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Мужская стрижка',
                'price' => 5000,
                'duration' => 40,
            ],
            [
                'name' => 'Стрижка бороды',
                'price' => 3000,
                'duration' => 30,
            ],
            [
                'name' => 'Стрижка + Борода',
                'price' => 7000,
                'duration' => 60,
            ],
            [
                'name' => 'Детская стрижка',
                'price' => 4000,
                'duration' => 35,
            ],
            [
                'name' => 'Камуфляж седины',
                'price' => 6000,
                'duration' => 45,
            ],
            [
                'name' => 'Королевское бритьё опасной бритвой',
                'price' => 4500,
                'duration' => 40,
            ],
            [
                'name' => 'VIP-уход (стрижка + борода + уход за лицом)',
                'price' => 12000,
                'duration' => 90,
            ],
            [
                'name' => 'Стрижка машинкой (одна насадка)',
                'price' => 2500,
                'duration' => 20,
            ],
            [
                'name' => 'Укладка волос',
                'price' => 2000,
                'duration' => 15,
            ],
            [
                'name' => 'Коррекция усов',
                'price' => 1500,
                'duration' => 10,
            ],
            [
                'name' => 'Комплекс «Отец + сын»',
                'price' => 9000,
                'duration' => 70,
            ],
            [
                'name' => 'Мужской спа-уход за лицом',
                'price' => 8000,
                'duration' => 50,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
