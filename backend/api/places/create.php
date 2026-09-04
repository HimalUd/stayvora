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
$name = trim($input['name'] ?? '');
$description = trim($input['description'] ?? '');
$distance = trim($input['distance'] ?? '');
$category = trim($input['category'] ?? '');

if (!$hotelId || !is_numeric($hotelId)) {
    jsonResponse(["message" => "Hotel ID is required"], 422);
}
if (empty($name)) {
    jsonResponse(["message" => "Place name is required"], 422);
}

$stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
$stmt->execute([$hotelId]);
$hotel = $stmt->fetch();

if (!$hotel) {
    jsonResponse(["message" => "Hotel not found"], 404);
}

if ($hotel['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only add places to your own hotels"], 403);
}

$stmt = $conn->prepare("INSERT INTO nearby_places (hotel_id, name, description, distance, category) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$hotelId, $name, $description, $distance, $category]);

$placeId = $conn->lastInsertId();
$stmt = $conn->prepare("SELECT * FROM nearby_places WHERE id = ?");
$stmt->execute([$placeId]);
$place = $stmt->fetch();

jsonResponse(["message" => "Place created successfully", "place" => $place], 201);