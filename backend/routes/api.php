<?php

use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ServiceController;
use App\Http\Middleware\TokenCheck;
use Illuminate\Support\Facades\Route;


Route::post("/login", [AuthController::class, "login"]);
Route::post("/register", [AuthController::class, "register"]);
Route::post("/logout", [AuthController::class, "logout"])->middleware(TokenCheck::class);
Route::get('/appointments/slots', [AppointmentController::class, 'getSlots']);

Route::apiResource('masters', MasterController::class);
Route::apiResource('services', ServiceController::class);
Route::apiResource('appointments', AppointmentController::class);
Route::apiResource('reviews', ReviewController::class);


Route::middleware(TokenCheck::class)->group(function () {
    Route::get('/admin/appointments', [\App\Http\Controllers\Admin\AppointmentController::class, 'index']);
    Route::get('/admin/appointments/{id}', [\App\Http\Controllers\Admin\AppointmentController::class, 'show']);
    Route::put('/admin/appointments/{id}', [App\Http\Controllers\Admin\AppointmentController::class, 'update']);
    Route::get('/admin/schedule/{date}', [AdminAppointmentController::class, 'day']);
Route::post('/admin/appointments', [AdminAppointmentController::class, 'storeAdmin']);

    Route::delete('/admin/appointments/{id}', [\App\Http\Controllers\Admin\AppointmentController::class, 'destroy']);
});


