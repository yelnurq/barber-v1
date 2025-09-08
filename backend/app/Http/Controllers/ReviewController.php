<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        return Review::latest()->get();
    }

    public function store(Request $request)
    {
        return Review::create($request->all());
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->noContent();
    }
}
