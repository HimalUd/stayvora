<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../utils/auth_middleware.php';

requireOwner();

$db = new Database();
$conn = $db->getConnection();

$input = getInput();
$hotelId = $input['hotel_id'] ?? null;
$roomType = trim($input['room_type'] ?? '');
$price = $input['price'] ?? null;
$capacity = $input['capacity'] ?? 2;
$description = trim($input['description'] ?? '');

if (!$hotelId || !is_numeric($hotelId)) {
    jsonResponse(["message" => "Hotel ID is required"], 422);
}
if (empty($roomType)) {
    jsonResponse(["message" => "Room type is required"], 422);
}
if (!$price || !is_numeric($price) || $price <= 0) {
    jsonResponse(["message" => "Valid price is required"], 422);
}

$stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
$stmt->execute([$hotelId]);
$hotel = $stmt->fetch();

if (!$hotel) {
    jsonResponse(["message" => "Hotel not found"], 404);
}

if ($hotel['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only add rooms to your own hotels"], 403);
}

$stmt = $conn->prepare("INSERT INTO rooms (hotel_id, room_type, price, capacity, description) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$hotelId, $roomType, $price, $capacity, $description]);

$roomId = $conn->lastInsertId();
$stmt = $conn->prepare("SELECT * FROM rooms WHERE id = ?");
$stmt->execute([$roomId]);
$room = $stmt->fetch();

jsonResponse(["message" => "Room created successfully", "room" => $room], 201);