<?php
namespace App\Models;

class SpecialOffer extends Model
{
    protected static string $table = 'special_offers';
    protected static string $primaryKey = 'id';

    public function hotel(): ?Hotel
    {
        return Hotel::find($this->hotel_id);
    }
}
