<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
$id = $input['id'] ?? $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    jsonResponse(["message" => "Room ID is required"], 400);
}

$stmt = $conn->prepare("SELECT r.*, h.owner_id FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE r.id = ?");
$stmt->execute([$id]);
$room = $stmt->fetch();

if (!$room) {
    jsonResponse(["message" => "Room not found"], 404);
}

if ($room['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only update rooms in your own hotels"], 403);
}

$fields = ['room_type', 'price', 'capacity', 'description', 'is_available'];
$updates = [];
$params = [];

foreach ($fields as $field) {
    if (isset($input[$field])) {
        $updates[] = "$field = ?";
        $params[] = $input[$field];
    }
}

if (empty($updates)) {
    jsonResponse(["message" => "No fields to update"], 422);
}

$params[] = $id;
$sql = "UPDATE rooms SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->execute($params);

$stmt = $conn->prepare("SELECT * FROM rooms WHERE id = ?");
$stmt->execute([$id]);
$room = $stmt->fetch();

jsonResponse(["message" => "Room updated successfully", "room" => $room]);