<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TprafDspImp extends Model
{
    protected $table = 'tpraf_dsp_imp';

    protected $fillable = ['key', 'title', 'text'];
}
