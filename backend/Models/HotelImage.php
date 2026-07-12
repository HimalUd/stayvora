<?php
namespace App\Models;

class HotelImage extends Model
{
    protected static string $table = 'hotel_images';
    protected static string $primaryKey = 'id';

    public function hotel(): ?Hotel
    {
        return Hotel::find($this->hotel_id);
    }
}
