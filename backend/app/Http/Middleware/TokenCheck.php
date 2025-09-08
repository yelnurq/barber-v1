<?php

namespace App\Http\Middleware;

use App\Models\Token;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Symfony\Component\HttpFoundation\Response;

class TokenCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if(!$token || !Token::where("token", $token)->exists()){
            return response()->json([
                "msg"=>"not authorized",
            ], 401);
        }

        $user = Token::where("token", $token)->first()->user;
        FacadesAuth::login($user);
        return $next($request);
    }
}
