<?php
namespace App\Models;

class Booking extends Model
{
    protected static string $table = 'bookings';
    protected static string $primaryKey = 'id';

    public function user(): ?User
    {
        return User::find($this->user_id);
    }

    public function hotel(): ?Hotel
    {
        return Hotel::find($this->hotel_id);
    }

    public function room(): ?Room
    {
        return Room::find($this->room_id);
    }

    public static function getOwnerBookings(int $ownerId): array
    {
        return self::raw(
            "SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                    h.name as hotel_name, r.room_type, r.price as room_price
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN users u ON b.user_id = u.id
             JOIN rooms r ON b.room_id = r.id
             WHERE h.owner_id = ?
             ORDER BY b.created_at DESC",
            [$ownerId]
        );
    }

    public static function getUserBookings(int $userId): array
    {
        return self::raw(
            "SELECT b.*, h.name as hotel_name, h.location, r.room_type, r.price as room_price,
                    (SELECT image_url FROM hotel_images WHERE hotel_id = h.id LIMIT 1) as hotel_image
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC",
            [$userId]
        );
    }

    public function confirm(): bool
    {
        $this->status = 'confirmed';
        return $this->save();
    }

    public function cancel(): bool
    {
        $this->status = 'cancelled';
        return $this->save();
    }
}
