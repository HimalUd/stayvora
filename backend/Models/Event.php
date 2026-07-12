<?php
namespace App\Models;

class Event extends Model
{
    protected static string $table = 'events';
    protected static string $primaryKey = 'id';

    public function hotel(): ?Hotel
    {
        return Hotel::find($this->hotel_id);
    }
}
