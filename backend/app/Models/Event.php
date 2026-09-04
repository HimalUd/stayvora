<?php
require_once __DIR__ . '/../Core/Model.php';

class Event extends Model {
    protected string $table = 'events';

    public function createEvent(int $hotelId, array $data): int {
        return $this->create([
            'hotel_id' => $hotelId,
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'event_date' => $data['event_date'] ?? null,
            'price' => $data['price'] ?? null
        ]);
    }

    public function getEventsByHotel(int $hotelId): array {
        return $this->findBy('hotel_id', $hotelId, 'event_date ASC');
    }

    public function getEventWithOwner(int $eventId): ?array {
        return $this->fetchOne(
            "SELECT e.*, h.owner_id FROM events e JOIN hotels h ON e.hotel_id = h.id WHERE e.id = ?",
            [$eventId]
        );
    }

    public function updateEvent(int $id, array $data): bool {
        return $this->update($id, $data);
    }
}
