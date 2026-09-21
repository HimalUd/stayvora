<?php
require_once __DIR__ . '/../Core/Model.php';

class Booking extends Model {
    protected string $table = 'bookings';

    public function createBooking(int $userId, int $hotelId, int $roomId, string $checkIn, string $checkOut, int $guests, float $totalPrice, string $bookingCode = '', string $guestName = '', string $guestEmail = '', string $guestPhone = '', string $specialRequests = '', int $numRooms = 1): int {
        return $this->create([
            'user_id' => $userId,
            'hotel_id' => $hotelId,
            'room_id' => $roomId,
            'booking_code' => $bookingCode,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => $guests,
            'num_rooms' => max(1, $numRooms),
            'total_price' => $totalPrice,
            'guest_name' => $guestName,
            'guest_email' => $guestEmail,
            'guest_phone' => $guestPhone,
            'special_requests' => $specialRequests
        ]);
    }

    public function getAvailableRoomsCount(int $roomId, string $checkIn, string $checkOut): int {
        $stmt = $this->query("SELECT total_rooms FROM rooms WHERE id = ?", [$roomId]);
        $room = $stmt->fetch();
        if (!$room) {
            return 0;
        }
        $totalRooms = max((int)($room['total_rooms'] ?? 1), 1);

        $stmt = $this->query(
            "SELECT check_in, check_out, COALESCE(num_rooms, 1) AS num_rooms 
             FROM bookings 
             WHERE room_id = ? 
               AND status IN ('pending', 'confirmed')
               AND (check_in < ? AND check_out > ?)",
            [$roomId, $checkOut, $checkIn]
        );
        $bookings = $stmt->fetchAll();

        if (empty($bookings)) {
            return $totalRooms;
        }

        try {
            $start = new DateTime($checkIn);
            $end = new DateTime($checkOut);
        } catch (Exception $e) {
            return 0;
        }

        $maxBookedOnAnyNight = 0;
        for ($current = clone $start; $current < $end; $current->modify('+1 day')) {
            $dateStr = $current->format('Y-m-d');
            $bookedTonight = 0;
            foreach ($bookings as $b) {
                if ($b['check_in'] <= $dateStr && $b['check_out'] > $dateStr) {
                    $bookedTonight += (int)$b['num_rooms'];
                }
            }
            if ($bookedTonight > $maxBookedOnAnyNight) {
                $maxBookedOnAnyNight = $bookedTonight;
            }
        }

        return max(0, $totalRooms - $maxBookedOnAnyNight);
    }

    public function isRoomBooked(int $roomId, string $checkIn, string $checkOut, int $requestedRooms = 1): bool {
        return $this->getAvailableRoomsCount($roomId, $checkIn, $checkOut) < max(1, $requestedRooms);
    }

    public function getUserBookings(int $userId): array {
        return $this->fetchAll(
            "SELECT b.*, h.name as hotel_name, h.location as hotel_location,
                    r.room_type, r.price as room_price, r.capacity as room_capacity, r.total_rooms
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC",
            [$userId]
        );
    }

    public function getOwnerBookings(int $ownerId, ?int $hotelId = null): array {
        return $this->fetchAll(
            "SELECT b.*, h.name as hotel_name, r.room_type, r.capacity as room_capacity, r.total_rooms,
                    u.name as user_name, u.email as user_email, u.phone as user_phone
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN rooms r ON b.room_id = r.id
             JOIN users u ON b.user_id = u.id
             WHERE h.owner_id = ? AND (? IS NULL OR b.hotel_id = ?)
             ORDER BY b.created_at DESC",
            [$ownerId, $hotelId, $hotelId]
        );
    }

    public function getBookingWithOwner(int $bookingId): ?array {
        return $this->fetchOne(
            "SELECT b.*, h.name as hotel_name, h.owner_id, r.room_type, r.capacity as room_capacity, r.total_rooms, u.email as user_email
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN rooms r ON b.room_id = r.id
             JOIN users u ON b.user_id = u.id
             WHERE b.id = ?",
            [$bookingId]
        );
    }

    public function confirmBooking(int $id): bool {
        return $this->update($id, ['status' => 'confirmed']);
    }

    public function cancelBooking(int $id): bool {
        return $this->update($id, ['status' => 'cancelled']);
    }

    public function getBookingWithImage(int $bookingId): ?array {
        $booking = $this->findById($bookingId);
        if (!$booking) return null;

        $imgStmt = $this->query(
            "SELECT image_url FROM hotel_images WHERE hotel_id = ? LIMIT 1",
            [$booking['hotel_id']]
        );
        $image = $imgStmt->fetch();
        $booking['hotel_image'] = $image ? $image['image_url'] : null;
        return $booking;
    }

    public function getUserBookingsWithImages(int $userId): array {
        $bookings = $this->getUserBookings($userId);
        foreach ($bookings as &$booking) {
            $imgStmt = $this->query(
                "SELECT image_url FROM hotel_images WHERE hotel_id = ? LIMIT 1",
                [$booking['hotel_id']]
            );
            $image = $imgStmt->fetch();
            $booking['hotel_image'] = $image ? $image['image_url'] : null;
        }
        return $bookings;
    }
}
