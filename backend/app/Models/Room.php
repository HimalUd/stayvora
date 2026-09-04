<?php
require_once __DIR__ . '/../Core/Model.php';

class Room extends Model {
    protected string $table = 'rooms';

    public function createRoom(int $hotelId, array $data): int {
        return $this->create([
            'hotel_id' => $hotelId,
            'room_type' => $data['room_type'],
            'price' => $data['price'],
            'capacity' => $data['capacity'] ?? 2,
            'description' => $data['description'] ?? ''
        ]);
    }

    public function getRoomsByHotel(int $hotelId): array {
        return $this->findBy('hotel_id', $hotelId, 'price ASC');
    }

    public function getRoomWithOwner(int $roomId): ?array {
        return $this->fetchOne(
            "SELECT r.*, h.owner_id FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE r.id = ?",
            [$roomId]
        );
    }

    public function updateRoom(int $id, array $data): bool {
        return $this->update($id, $data);
    }

    public function deleteRoomWithBookings(int $roomId): bool {
        $this->deleteBy('room_id', $roomId); // delete bookings
        return $this->delete($roomId);
    }
}
