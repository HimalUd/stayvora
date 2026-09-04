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
    jsonResponse(["message" => "Event ID is required"], 400);
}

$stmt = $conn->prepare("SELECT e.*, h.owner_id FROM events e JOIN hotels h ON e.hotel_id = h.id WHERE e.id = ?");
$stmt->execute([$id]);
$event = $stmt->fetch();

if (!$event) {
    jsonResponse(["message" => "Event not found"], 404);
}

if ($event['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only update events in your own hotels"], 403);
}

$fields = ['name', 'description', 'event_date', 'price'];
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
$sql = "UPDATE events SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->execute($params);

$stmt = $conn->prepare("SELECT * FROM events WHERE id = ?");
$stmt->execute([$id]);
$event = $stmt->fetch();

jsonResponse(["message" => "Event updated successfully", "event" => $event]);