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
                'specialization' => 'Эксперт по классическим стрижкам',
                'phone' => '8-707-167-7785',
            ],
            [
                'name' => 'Нурлан',
                'specialization' => 'Мастер бороды и усов',
                'phone' => '8-700-167-7785',
            ],
            [
                'name' => 'Ержан',
                'specialization' => 'Современные мужские стрижки',
                'phone' => '8-787-167-7785',
            ],
            [
                'name' => 'Азамат',
                'phone' => '8-777-167-7785',
                'specialization' => 'Fade и молодежные стили',
            ],
        ];

        foreach ($masters as $master) {
            Master::create($master);
        }
    }
}
