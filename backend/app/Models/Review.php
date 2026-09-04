<?php
require_once __DIR__ . '/../Core/Model.php';

class Review extends Model {
    protected string $table = 'reviews';

    public function getByBooking(int $bookingId): ?array {
        return $this->findOneBy('booking_id', $bookingId);
    }

    public function getByHotel(int $hotelId): array {
        return $this->fetchAll(
            "SELECT r.*, u.name as user_name, u.email as user_email
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.hotel_id = ?
             ORDER BY r.created_at DESC",
            [$hotelId]
        );
    }

    public function getByOwner(int $ownerId): array {
        return $this->fetchAll(
            "SELECT r.*, u.name as user_name, u.email as user_email, h.name as hotel_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             JOIN hotels h ON r.hotel_id = h.id
             WHERE h.owner_id = ?
             ORDER BY r.created_at DESC",
            [$ownerId]
        );
    }

    public function getHotelSummary(int $hotelId): array {
        $row = $this->fetchOne(
            "SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as average
             FROM reviews WHERE hotel_id = ?",
            [$hotelId]
        );
        return [
            'count' => (int)($row['count'] ?? 0),
            'average' => round((float)($row['average'] ?? 0), 1),
        ];
    }

    public function updateHotelRating(int $hotelId): void {
        $summary = $this->getHotelSummary($hotelId);
        $this->query(
            "UPDATE hotels SET rating = ? WHERE id = ?",
            [$summary['average'], $hotelId]
        );
    }
}