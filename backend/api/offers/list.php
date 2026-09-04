<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/auth_middleware.php';

$db = new Database();
$conn = $db->getConnection();

$hotelId = $_GET['hotel_id'] ?? null;
if (!$hotelId || !is_numeric($hotelId)) {
    jsonResponse(["message" => "Hotel ID is required"], 400);
}

$stmt = $conn->prepare("SELECT * FROM special_offers WHERE hotel_id = ? AND (valid_until IS NULL OR valid_until >= CURDATE()) ORDER BY created_at DESC");
$stmt->execute([$hotelId]);
$offers = $stmt->fetchAll();

jsonResponse(["offers" => $offers]);