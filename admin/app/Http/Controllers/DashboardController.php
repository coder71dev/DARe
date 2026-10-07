<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\TprafView;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'pages' => Page::count(),
                'publishedPages' => Page::where('status', 'published')->count(),
                'diagrams' => TprafView::count(),
                'admins' => User::where('is_admin', true)->count(),
            ],
        ]);
    }
}
