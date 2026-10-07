<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use Inertia\Inertia;
use Inertia\Response;

class EmailLogController extends Controller
{
    public function index(): Response
    {
        $emailLogs = EmailLog::orderByDesc('created_at')
            ->paginate(15, ['id', 'to', 'subject', 'created_at'])
            ->withQueryString();

        return Inertia::render('Admin/EmailLogs/Index', [
            'emailLogs' => $emailLogs,
        ]);
    }

    public function show(EmailLog $emailLog): Response
    {
        return Inertia::render('Admin/EmailLogs/Show', [
            'emailLog' => $emailLog,
        ]);
    }
}
