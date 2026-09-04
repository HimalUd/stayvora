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
$discount = $input['discount'] ?? null;
$validUntil = $input['valid_until'] ?? null;

if (!$hotelId || !is_numeric($hotelId)) {
    jsonResponse(["message" => "Hotel ID is required"], 422);
}
if (empty($name)) {
    jsonResponse(["message" => "Offer name is required"], 422);
}

$stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
$stmt->execute([$hotelId]);
$hotel = $stmt->fetch();

if (!$hotel) {
    jsonResponse(["message" => "Hotel not found"], 404);
}

if ($hotel['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only add offers to your own hotels"], 403);
}

$stmt = $conn->prepare("INSERT INTO special_offers (hotel_id, name, description, discount, valid_until) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$hotelId, $name, $description, $discount, $validUntil]);

$offerId = $conn->lastInsertId();
$stmt = $conn->prepare("SELECT * FROM special_offers WHERE id = ?");
$stmt->execute([$offerId]);
$offer = $stmt->fetch();

jsonResponse(["message" => "Offer created successfully", "offer" => $offer], 201);