<?php
require_once __DIR__ . '/../Core/Model.php';

class Hotel extends Model {
    protected string $table = 'hotels';

    public function createHotel(int $ownerId, array $data): int {
        return $this->create([
            'owner_id' => $ownerId,
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'location' => $data['location'] ?? '',
            'address' => $data['address'] ?? '',
            'city' => $data['city'] ?? '',
            'country' => $data['country'] ?? '',
            'price_range' => $data['price_range'] ?? '',
            'rating' => $data['rating'] ?? 0,
            'amenities' => $data['amenities'] ?? '',
            'travel_purpose' => $data['travel_purpose'] ?? '',
            'map_url' => $data['map_url'] ?? ''
        ]);
    }

    public function updateHotel(int $id, array $data): bool {
        return $this->update($id, $data);
    }

    public function getHotelWithOwner(int $id): ?array {
        $sql = "SELECT h.*, u.name as owner_name, u.email as owner_email
                FROM hotels h JOIN users u ON h.owner_id = u.id WHERE h.id = ?";
        return $this->fetchOne($sql, [$id]);
    }

    public function getActiveHotelsWithMinPrice(?string $search = null): array {
        $sql = "SELECT h.*, u.name as owner_name,
                (SELECT MIN(price) FROM rooms WHERE hotel_id = h.id AND is_available = 1) as min_room_price
                FROM hotels h
                JOIN users u ON h.owner_id = u.id
                WHERE h.status = 'active'";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (h.name LIKE ? OR h.location LIKE ?)";
            $term = "%{$search}%";
            $params = [$term, $term];
        }

        $sql .= " ORDER BY h.created_at DESC";
        return $this->fetchAll($sql, $params);
    }

    public function getHotelImages(int $hotelId): array {
        $stmt = $this->query("SELECT id, image_url FROM hotel_images WHERE hotel_id = ?", [$hotelId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFirstImage(int $hotelId): ?string {
        $stmt = $this->query("SELECT image_url FROM hotel_images WHERE hotel_id = ? LIMIT 1", [$hotelId]);
        $image = $stmt->fetch();
        return $image ? $image['image_url'] : null;
    }

    public function searchHotels(array $filters): array {
        $sql = "SELECT DISTINCT h.*, u.name as owner_name,
                (SELECT MIN(price) FROM rooms WHERE hotel_id = h.id AND is_available = 1) as min_room_price
                FROM hotels h
                JOIN users u ON h.owner_id = u.id
                LEFT JOIN rooms r ON r.hotel_id = h.id
                LEFT JOIN events e ON e.hotel_id = h.id
                WHERE h.status = 'active'";
        $params = [];

        if (!empty($filters['location'])) {
            $sql .= " AND (h.location LIKE ? OR h.address LIKE ? OR h.name LIKE ?)";
            $term = "%{$filters['location']}%";
            $params[] = $term; $params[] = $term; $params[] = $term;
        }

        if (!empty($filters['min_price'])) {
            $sql .= " AND (SELECT MIN(price) FROM rooms WHERE hotel_id = h.id AND is_available = 1) >= ?";
            $params[] = (float)$filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $sql .= " AND (SELECT MIN(price) FROM rooms WHERE hotel_id = h.id AND is_available = 1) <= ?";
            $params[] = (float)$filters['max_price'];
        }

        if (!empty($filters['rating'])) {
            $sql .= " AND h.rating >= ?";
            $params[] = (float)$filters['rating'];
        }

        if (!empty($filters['travel_purpose'])) {
            $sql .= " AND h.travel_purpose LIKE ?";
            $params[] = "%{$filters['travel_purpose']}%";
        }

        if (!empty($filters['event'])) {
            $events = array_filter(array_map('trim', explode(',', $filters['event'])));
            if (count($events) > 0) {
                $sql .= " AND (";
                $conds = [];
                foreach ($events as $ev) {
                    $conds[] = "e.name LIKE ?";
                    $params[] = "%{$ev}%";
                }
                $sql .= implode(' OR ', $conds) . ")";
            }
        }

        if (!empty($filters['amenity'])) {
            $amenities = array_filter(array_map('trim', explode(',', $filters['amenity'])));
            if (count($amenities) > 0) {
                $sql .= " AND (";
                $conds = [];
                foreach ($amenities as $am) {
                    $conds[] = "h.amenities LIKE ?";
                    $params[] = "%{$am}%";
                }
                $sql .= implode(' OR ', $conds) . ")";
            }
        }

        if (!empty($filters['check_in']) && !empty($filters['check_out'])) {
            $sql .= " AND h.id NOT IN (
                SELECT b.hotel_id FROM bookings b
                WHERE b.status IN ('pending', 'confirmed')
                AND (b.check_in < ? AND b.check_out > ?)
            )";
            $params[] = $filters['check_out'];
            $params[] = $filters['check_in'];
        }

        $sql .= " ORDER BY h.rating DESC, h.created_at DESC";
        return $this->fetchAll($sql, $params);
    }

    public function getFullHotelDetails(int $id): ?array {
        $hotel = $this->getHotelWithOwner($id);
        if (!$hotel) return null;

        $hotel['rooms'] = $this->fetchAll(
            "SELECT * FROM rooms WHERE hotel_id = ? AND is_available = 1",
            [$id]
        );

        $hotel['events'] = $this->fetchAll(
            "SELECT * FROM events WHERE hotel_id = ? ORDER BY event_date",
            [$id]
        );

        $hotel['offers'] = $this->fetchAll(
            "SELECT * FROM special_offers WHERE hotel_id = ? AND (valid_until IS NULL OR valid_until >= CURDATE())",
            [$id]
        );

        $hotel['places'] = $this->fetchAll(
            "SELECT * FROM nearby_places WHERE hotel_id = ?",
            [$id]
        );

        $hotel['images'] = $this->getHotelImages($id);

        return $hotel;
    }

    public function deleteFullHotel(int $id): bool {
        $this->beginTransaction();
        try {
            $this->deleteBy('hotel_id', $id);
            return $this->delete($id);
        } catch (Exception $e) {
            $this->rollBack();
            throw $e;
        }
    }

    public function getHotelsByOwner(int $ownerId): array {
        $sql = "SELECT h.*,
                (SELECT MIN(price) FROM rooms WHERE hotel_id = h.id AND is_available = 1) as min_room_price
                FROM hotels h
                WHERE h.owner_id = ?
                ORDER BY h.created_at DESC";
        $hotels = $this->fetchAll($sql, [$ownerId]);

        foreach ($hotels as &$hotel) {
            $hotel['images'] = $this->getHotelImages($hotel['id']);
        }
        unset($hotel);

        return $hotels;
    }

    public function deleteHotelImage(int $imageId): bool {
        return $this->query("DELETE FROM hotel_images WHERE id = ?", [$imageId])->rowCount() > 0;
    }

    public function getDestinationCounts(array $locations): array {
        $counts = [];
        foreach ($locations as $loc) {
            $sql = "SELECT COUNT(*) as count FROM hotels WHERE status = 'active' AND location LIKE ?";
            $stmt = $this->query($sql, ["%{$loc}%"]);
            $counts[$loc] = (int)$stmt->fetch()['count'];
        }
        return $counts;
    }

    public function getAdminHotelList(): array {
        $sql = "SELECT h.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
                (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as total_bookings,
                (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id AND status = 'confirmed') as confirmed_bookings,
                (SELECT image_url FROM hotel_images WHERE hotel_id = h.id LIMIT 1) as image_url
                FROM hotels h
                JOIN users u ON h.owner_id = u.id
                ORDER BY h.created_at DESC";
        return $this->fetchAll($sql);
    }
}
