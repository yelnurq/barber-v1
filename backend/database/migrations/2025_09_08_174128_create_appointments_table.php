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
Schema::create('appointments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('master_id')->constrained('masters')->onDelete('cascade');
    $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
    $table->string('client_name');
    $table->string('client_phone');
    $table->dateTime('date_time');
    $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
