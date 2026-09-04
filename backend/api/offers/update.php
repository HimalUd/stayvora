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
    jsonResponse(["message" => "Offer ID is required"], 400);
}

$stmt = $conn->prepare("SELECT o.*, h.owner_id FROM special_offers o JOIN hotels h ON o.hotel_id = h.id WHERE o.id = ?");
$stmt->execute([$id]);
$offer = $stmt->fetch();

if (!$offer) {
    jsonResponse(["message" => "Offer not found"], 404);
}

if ($offer['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only update offers in your own hotels"], 403);
}

$fields = ['name', 'description', 'discount', 'valid_until'];
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
$sql = "UPDATE special_offers SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->execute($params);

$stmt = $conn->prepare("SELECT * FROM special_offers WHERE id = ?");
$stmt->execute([$id]);
$offer = $stmt->fetch();

jsonResponse(["message" => "Offer updated successfully", "offer" => $offer]);