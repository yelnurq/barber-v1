<?php

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

Route::apiResource('masters', MasterController::class);
Route::apiResource('services', ServiceController::class);
Route::apiResource('appointments', AppointmentController::class);
Route::apiResource('reviews', ReviewController::class);
