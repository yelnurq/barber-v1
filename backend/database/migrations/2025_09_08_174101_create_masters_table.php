<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
Schema::create('masters', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('photo')->nullable();
    $table->string('specialization')->nullable();
    $table->json('schedule')->nullable(); // пример: {"mon":["10:00-20:00"], "tue":[]}
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('masters');
    }
};
