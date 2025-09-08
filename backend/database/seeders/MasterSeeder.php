<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Master;

class MasterSeeder extends Seeder
{
    public function run(): void
    {
        $masters = [
            [
                'name' => 'Арман',
                'photo' => '/images/masters/arman.jpg',
                'specialization' => 'Эксперт по классическим стрижкам',
            ],
            [
                'name' => 'Нурлан',
                'photo' => '/images/masters/nurlan.jpg',
                'specialization' => 'Мастер бороды и усов',
            ],
            [
                'name' => 'Ержан',
                'photo' => '/images/masters/yerzhan.jpg',
                'specialization' => 'Современные мужские стрижки',
            ],
            [
                'name' => 'Азамат',
                'photo' => '/images/masters/azamat.jpg',
                'specialization' => 'Fade и молодежные стили',
            ],
        ];

        foreach ($masters as $master) {
            Master::create($master);
        }
    }
}
