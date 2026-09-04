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

$hotelId = 0;
$imageUrl = '';

// Check for file upload
if (!empty($_FILES['image']['tmp_name'])) {
    $hotelId = (int)($_POST['hotel_id'] ?? 0);
    if (!$hotelId) {
        jsonResponse(["message" => "Hotel ID is required"], 400);
    }

    $stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
    $stmt->execute([$hotelId]);
    $hotel = $stmt->fetch();

    if (!$hotel) {
        jsonResponse(["message" => "Hotel not found"], 404);
    }
    if ($hotel['owner_id'] != $_SESSION['user_id']) {
        jsonResponse(["message" => "You can only add images to your own hotels"], 403);
    }

    $file = $_FILES['image'];
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed)) {
        jsonResponse(["message" => "Only JPG, PNG, GIF, and WEBP images are allowed"], 422);
    }

    $uploadDir = __DIR__ . '/../../uploads/hotels/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('hotel_') . '.' . $ext;
    $dest = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        jsonResponse(["message" => "Failed to upload image"], 500);
    }

    $baseUrl = rtrim((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']), '/');
    $imageUrl = $baseUrl . '/uploads/hotels/' . $filename;
} else {
    $input = getInput();
    $hotelId = (int)($input['hotel_id'] ?? 0);
    $imageUrl = trim($input['image_url'] ?? '');

    if (!$hotelId) {
        jsonResponse(["message" => "Hotel ID is required"], 400);
    }

    if (empty($imageUrl)) {
        jsonResponse(["message" => "Image URL is required"], 422);
    }

    $stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
    $stmt->execute([$hotelId]);
    $hotel = $stmt->fetch();

    if (!$hotel) {
        jsonResponse(["message" => "Hotel not found"], 404);
    }

    if ($hotel['owner_id'] != $_SESSION['user_id']) {
        jsonResponse(["message" => "You can only add images to your own hotels"], 403);
    }
}

$stmt = $conn->prepare("INSERT INTO hotel_images (hotel_id, image_url) VALUES (?, ?)");
$stmt->execute([$hotelId, $imageUrl]);

jsonResponse(["message" => "Image added successfully", "id" => (int)$conn->lastInsertId()], 201);