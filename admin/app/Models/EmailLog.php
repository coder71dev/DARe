<?php

namespace App\Models;

use Database\Factories\EmailLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    /** @use HasFactory<EmailLogFactory> */
    use HasFactory;

    protected $fillable = ['to', 'subject', 'body'];
}
