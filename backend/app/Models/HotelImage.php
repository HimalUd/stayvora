<?php
require_once __DIR__ . '/../Core/Model.php';

class HotelImage extends Model {
    protected string $table = 'hotel_images';

    public function addImage(int $hotelId, string $imageUrl): int {
        return $this->create([
            'hotel_id' => $hotelId,
            'image_url' => $imageUrl
        ]);
    }

    public function deleteByHotel(int $hotelId): bool {
        return $this->deleteBy('hotel_id', $hotelId);
    }
}
