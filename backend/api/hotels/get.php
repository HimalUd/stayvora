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

$id = $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    jsonResponse(["message" => "Hotel ID is required"], 400);
}

$stmt = $conn->prepare("SELECT h.*, u.name as owner_name, u.email as owner_email
    FROM hotels h JOIN users u ON h.owner_id = u.id WHERE h.id = ?");
$stmt->execute([$id]);
$hotel = $stmt->fetch();

if (!$hotel) {
    jsonResponse(["message" => "Hotel not found"], 404);
}

$stmt = $conn->prepare("SELECT * FROM rooms WHERE hotel_id = ? AND is_available = 1");
$stmt->execute([$id]);
$hotel['rooms'] = $stmt->fetchAll();

$stmt = $conn->prepare("SELECT * FROM events WHERE hotel_id = ? ORDER BY event_date");
$stmt->execute([$id]);
$hotel['events'] = $stmt->fetchAll();

$stmt = $conn->prepare("SELECT * FROM special_offers WHERE hotel_id = ? AND (valid_until IS NULL OR valid_until >= CURDATE())");
$stmt->execute([$id]);
$hotel['offers'] = $stmt->fetchAll();

$stmt = $conn->prepare("SELECT * FROM nearby_places WHERE hotel_id = ?");
$stmt->execute([$id]);
$hotel['places'] = $stmt->fetchAll();

$stmt = $conn->prepare("SELECT image_url FROM hotel_images WHERE hotel_id = ?");
$stmt->execute([$id]);
$hotel['images'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

jsonResponse(["hotel" => $hotel]);