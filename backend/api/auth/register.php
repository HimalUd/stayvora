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

$db = new Database();
$conn = $db->getConnection();

$input = getInput();
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? '');
$role = trim($input['role'] ?? 'traveler');

$errors = [];
if (empty($name)) $errors[] = "Name is required";
if (empty($email)) $errors[] = "Email is required";
if (empty($password)) $errors[] = "Password is required";
if (strlen($password) < 8) $errors[] = "Password must be at least 8 characters";
if (!preg_match('/[A-Z]/', $password)) $errors[] = "Password must include an uppercase letter";
if (!preg_match('/[a-z]/', $password)) $errors[] = "Password must include a lowercase letter";
if (!preg_match('/\d/', $password)) $errors[] = "Password must include a number";
if (!preg_match('/[^A-Za-z0-9]/', $password)) $errors[] = "Password must include a special character";
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
if (empty($phone)) $errors[] = "Phone number is required";
if (!preg_match('/^\+94\d{9}$/', preg_replace('/[\s-]/', '', $phone))) $errors[] = "Phone must be a Sri Lanka number in +94 format, e.g. +94 77 123 4567";
if (!in_array($role, ['traveler', 'owner'])) $errors[] = "Role must be traveler or owner";

if (!empty($errors)) {
    jsonResponse(["message" => "Validation failed", "errors" => $errors], 422);
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(["message" => "Email already registered"], 409);
}

$password_hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password_hash, phone, role, email_verified) VALUES (?, ?, ?, ?, ?, 1)");
$stmt->execute([$name, $email, $password_hash, $phone, $role]);
$userId = $conn->lastInsertId();

$stmt = $conn->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

jsonResponse(["message" => "Registration successful. Please login.", "user" => $user], 201);