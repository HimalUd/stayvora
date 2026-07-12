<?php
namespace App\Models;

class NearbyPlace extends Model
{
    protected static string $table = 'nearby_places';
    protected static string $primaryKey = 'id';

    public function hotel(): ?Hotel
    {
        return Hotel::find($this->hotel_id);
    }
}
