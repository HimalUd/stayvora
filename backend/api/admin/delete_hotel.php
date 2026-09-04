<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

$input = getInput();
$id = $input['id'] ?? $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    jsonResponse(["message" => "Hotel ID is required"], 400);
}

$stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
$stmt->execute([$id]);
$hotel = $stmt->fetch();

if (!$hotel) {
    jsonResponse(["message" => "Hotel not found"], 404);
}

$conn->beginTransaction();
try {
    $conn->prepare("DELETE FROM hotel_images WHERE hotel_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM bookings WHERE hotel_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM rooms WHERE hotel_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM events WHERE hotel_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM special_offers WHERE hotel_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM nearby_places WHERE hotel_id = ?")->execute([$id]);
    $conn->prepare("DELETE FROM hotels WHERE id = ?")->execute([$id]);
    $conn->commit();
    jsonResponse(["message" => "Hotel deleted successfully by admin"]);
} catch (Exception $e) {
    $conn->rollBack();
    jsonResponse(["message" => "Failed to delete hotel"], 500);
}