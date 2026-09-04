<?php
require_once __DIR__ . '/../Core/Model.php';

class Notification extends Model {
    protected string $table = 'notifications';

    public function createForUser(int $userId, ?int $bookingId, string $type, string $title, string $message): int {
        return $this->create([
            'user_id' => $userId,
            'booking_id' => $bookingId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]);
    }

    public function getForUser(int $userId, int $limit = 50): array {
        return $this->fetchAll(
            "SELECT n.*, b.booking_code, h.name as hotel_name
             FROM notifications n
             LEFT JOIN bookings b ON n.booking_id = b.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC
             LIMIT " . (int)$limit,
            [$userId]
        );
    }

    public function getUnreadCount(int $userId): int {
        $stmt = $this->query("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", [$userId]);
        return (int)$stmt->fetch()['count'];
    }

    public function markRead(int $id, int $userId): bool {
        return $this->updateWhere('id', $id, ['is_read' => 1], $userId);
    }

    public function markAllRead(int $userId): bool {
        $stmt = $this->query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [$userId]);
        return $stmt->rowCount() >= 0;
    }

    protected function updateWhere(string $column, $value, array $data, int $userId): bool {
        $sets = implode(", ", array_map(fn($col) => "{$col} = ?", array_keys($data)));
        $params = array_values($data);
        $params[] = $value;
        $params[] = $userId;
        $stmt = $this->query("UPDATE {$this->table} SET {$sets} WHERE {$column} = ? AND user_id = ?", $params);
        return $stmt->rowCount() >= 0;
    }
}