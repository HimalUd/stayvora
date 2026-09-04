<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../utils/auth_middleware.php';

if (!isLoggedIn()) {
    jsonResponse(["message" => "Not authenticated"], 401);
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    session_destroy();
    jsonResponse(["message" => "User not found"], 401);
}

jsonResponse(["user" => $user]);