<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class DiagramController extends Controller
{
    public function show(): View
    {
        return view('diagram');
    }
}
