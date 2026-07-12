<?php
namespace App\Models;

class Hotel extends Model
{
    protected static string $table = 'hotels';
    protected static string $primaryKey = 'id';

    public function owner(): ?User
    {
        return User::find($this->owner_id);
    }

    public function rooms(): array
    {
        return Room::where('hotel_id', $this->getPrimaryKey());
    }

    public function bookings(): array
    {
        return Booking::where('hotel_id', $this->getPrimaryKey());
    }

    public function events(): array
    {
        return Event::where('hotel_id', $this->getPrimaryKey());
    }

    public function offers(): array
    {
        return SpecialOffer::where('hotel_id', $this->getPrimaryKey());
    }

    public function places(): array
    {
        return NearbyPlace::where('hotel_id', $this->getPrimaryKey());
    }

    public function images(): array
    {
        return HotelImage::where('hotel_id', $this->getPrimaryKey());
    }

    public function getMainImage(): ?string
    {
        $images = $this->images();
        return !empty($images) ? $images[0]->image_url : null;
    }

    public function getImageUrls(): array
    {
        return array_map(fn($img) => $img->image_url, $this->images());
    }

    public function getMinRoomPrice(): ?float
    {
        $result = self::rawOne(
            "SELECT MIN(price) as min_price FROM rooms WHERE hotel_id = ? AND is_available = 1",
            [$this->getPrimaryKey()]
        );
        return $result['min_price'] ?? null;
    }

    public static function search(array $filters): array
    {
        $sql = "SELECT h.*, u.name as owner_name
                FROM hotels h
                JOIN users u ON h.owner_id = u.id
                LEFT JOIN rooms r ON r.hotel_id = h.id
                LEFT JOIN events e ON e.hotel_id = h.id
                WHERE h.status = 'active'";
        $params = [];

        if (!empty($filters['search'])) {
            $sql .= " AND (h.name LIKE ? OR h.location LIKE ? OR h.address LIKE ?)";
            $term = "%{$filters['search']}%";
            $params = array_merge($params, [$term, $term, $term]);
        }

        if (!empty($filters['location'])) {
            $sql .= " AND (h.location LIKE ? OR h.address LIKE ? OR h.name LIKE ?)";
            $term = "%{$filters['location']}%";
            $params = array_merge($params, [$term, $term, $term]);
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
            $sql .= " AND e.name LIKE ?";
            $params[] = "%{$filters['event']}%";
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

        $results = self::raw($sql, $params);

        return array_map(function ($row) {
            $hotel = new static($row);
            $row['min_room_price'] = $hotel->getMinRoomPrice();
            $row['image'] = $hotel->getMainImage();
            $row['images'] = $hotel->getImageUrls();
            return $row;
        }, $results);
    }

    public static function getAllWithOwners(): array
    {
        return self::raw(
            "SELECT h.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
                    (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as total_bookings,
                    (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id AND status = 'confirmed') as confirmed_bookings
             FROM hotels h
             JOIN users u ON h.owner_id = u.id
             ORDER BY h.created_at DESC"
        );
    }

    public function toDetailArray(): array
    {
        $data = $this->toArray();
        $data['owner_name'] = $this->owner()?->name;
        $data['min_room_price'] = $this->getMinRoomPrice();
        $data['image'] = $this->getMainImage();
        $data['images'] = $this->getImageUrls();
        $data['rooms'] = array_map(fn($r) => $r->toArray(), $this->rooms());
        $data['events'] = array_map(fn($e) => $e->toArray(), $this->events());
        $data['offers'] = array_map(fn($o) => $o->toArray(), $this->offers());
        $data['places'] = array_map(fn($p) => $p->toArray(), $this->places());
        return $data;
    }

    public static function findByOwnerId(int $ownerId): array
    {
        return self::where('owner_id', $ownerId);
    }

    public static function getCountByLocation(string $location): int
    {
        $result = self::rawOne(
            "SELECT COUNT(*) as count FROM hotels WHERE status = 'active' AND location LIKE ?",
            [$location . '%']
        );
        return (int)($result['count'] ?? 0);
    }
}
