<?php
require_once __DIR__ . '/../Core/Model.php';

class SpecialOffer extends Model {
    protected string $table = 'special_offers';

    public function createOffer(int $hotelId, array $data): int {
        return $this->create([
            'hotel_id' => $hotelId,
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'discount' => $data['discount'] ?? null,
            'valid_until' => $data['valid_until'] ?? null
        ]);
    }

    public function getOffersByHotel(int $hotelId): array {
        return $this->fetchAll(
            "SELECT * FROM special_offers WHERE hotel_id = ? AND (valid_until IS NULL OR valid_until >= CURDATE()) ORDER BY created_at DESC",
            [$hotelId]
        );
    }

    public function getOfferWithOwner(int $offerId): ?array {
        return $this->fetchOne(
            "SELECT o.*, h.owner_id FROM special_offers o JOIN hotels h ON o.hotel_id = h.id WHERE o.id = ?",
            [$offerId]
        );
    }

    public function updateOffer(int $id, array $data): bool {
        return $this->update($id, $data);
    }
}
