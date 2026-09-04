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

requireAdmin();

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare(
    "SELECT h.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
            (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as total_bookings,
            (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id AND status = 'confirmed') as confirmed_bookings
     FROM hotels h
     JOIN users u ON h.owner_id = u.id
     ORDER BY h.created_at DESC"
);
$stmt->execute();
$hotels = $stmt->fetchAll();

jsonResponse(["hotels" => $hotels]);