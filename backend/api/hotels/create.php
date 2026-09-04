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
$name = trim($input['name'] ?? '');
$description = trim($input['description'] ?? '');
$location = trim($input['location'] ?? '');
$address = trim($input['address'] ?? '');
$city = trim($input['city'] ?? '');
$country = trim($input['country'] ?? '');
$price_range = trim($input['price_range'] ?? '');
$rating = (float)($input['rating'] ?? 0);
$amenities = trim($input['amenities'] ?? '');
$travel_purpose = trim($input['travel_purpose'] ?? '');

if (empty($name)) {
    jsonResponse(["message" => "Hotel name is required"], 422);
}

$stmt = $conn->prepare("INSERT INTO hotels (owner_id, name, description, location, address, city, country, price_range, rating, amenities, travel_purpose)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$_SESSION['user_id'], $name, $description, $location, $address, $city, $country, $price_range, $rating, $amenities, $travel_purpose]);

$hotelId = $conn->lastInsertId();

$stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
$stmt->execute([$hotelId]);
$hotel = $stmt->fetch();

jsonResponse(["message" => "Hotel created successfully", "hotel" => $hotel], 201);