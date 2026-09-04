<?php
require_once __DIR__ . '/../Core/Model.php';

class NearbyPlace extends Model {
    protected string $table = 'nearby_places';

    public function createPlace(int $hotelId, array $data): int {
        return $this->create([
            'hotel_id' => $hotelId,
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'location_url' => $data['location_url'] ?? '',
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'distance' => $data['distance'] ?? '',
            'category' => $data['category'] ?? ''
        ]);
    }

    public function getPlacesByHotel(int $hotelId): array {
        return $this->findBy('hotel_id', $hotelId);
    }

    public function getPlaceWithOwner(int $placeId): ?array {
        return $this->fetchOne(
            "SELECT p.*, h.owner_id FROM nearby_places p JOIN hotels h ON p.hotel_id = h.id WHERE p.id = ?",
            [$placeId]
        );
    }

    public function updatePlace(int $id, array $data): bool {
        return $this->update($id, $data);
    }
}
