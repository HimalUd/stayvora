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
    "SELECT b.*, h.name as hotel_name, h.location as hotel_location,
            r.room_type, r.price as room_price
     FROM bookings b
     JOIN hotels h ON b.hotel_id = h.id
     JOIN rooms r ON b.room_id = r.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC"
);
$stmt->execute([$_SESSION['user_id']]);
$bookings = $stmt->fetchAll();

foreach ($bookings as &$booking) {
    $imgStmt = $conn->prepare("SELECT image_url FROM hotel_images WHERE hotel_id = ? LIMIT 1");
    $imgStmt->execute([$booking['hotel_id']]);
    $image = $imgStmt->fetch();
    $booking['hotel_image'] = $image ? $image['image_url'] : null;
}
unset($booking);

jsonResponse(["bookings" => $bookings]);