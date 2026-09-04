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

requireLogin();

$db = new Database();
$conn = $db->getConnection();

$input = getInput();
$id = $input['id'] ?? null;

if ($id) {
    if (!is_numeric($id)) {
        jsonResponse(["message" => "Invalid notification id"], 400);
    }
    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
} else {
    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
}

jsonResponse(["message" => "Notification(s) marked as read"]);