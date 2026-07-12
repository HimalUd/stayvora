<?php
namespace App\Models;

class Room extends Model
{
    protected static string $table = 'rooms';
    protected static string $primaryKey = 'id';

    public function hotel(): ?Hotel
    {
        return Hotel::find($this->hotel_id);
    }
}
