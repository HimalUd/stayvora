<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../utils/auth_middleware.php';

requireLogin();

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare(
    "SELECT n.*, b.booking_code, h.name as hotel_name
     FROM notifications n
     LEFT JOIN bookings b ON n.booking_id = b.id
     LEFT JOIN hotels h ON b.hotel_id = h.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50"
);
$stmt->execute([$_SESSION['user_id']]);
$notifications = $stmt->fetchAll();

$stmt = $conn->prepare("SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0");
$stmt->execute([$_SESSION['user_id']]);
$unread = $stmt->fetch()['unread'];

jsonResponse([
    "notifications" => $notifications,
    "unread" => (int)$unread,
]);