<?php
define('SESSION_TIMEOUT', 3600); // 1 hour of inactivity

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', 86400);
    ini_set('session.use_strict_mode', 1);
    $isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
    session_set_cookie_params([
        'lifetime' => 86400,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    if (!session_start()) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Failed to start session"]);
        exit;
    }
}

function expireSessionCookie() {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

function destroySession() {
    $_SESSION = [];
    expireSessionCookie();
    session_destroy();
}

// Automatic logout after a period of inactivity
if (isset($_SESSION['last_activity']) && (time() - (int)$_SESSION['last_activity']) > SESSION_TIMEOUT) {
    destroySession();
}

// Refresh the activity timestamp for logged-in users
if (session_status() === PHP_SESSION_ACTIVE && isLoggedIn()) {
    $_SESSION['last_activity'] = time();
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isOwner() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'owner';
}

function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized. Please login first."]);
        exit;
    }
}

function requireOwner() {
    requireLogin();
    if (!isOwner()) {
        http_response_code(403);
        echo json_encode(["message" => "Access denied. Owner role required."]);
        exit;
    }
}

function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(["message" => "Access denied. Admin role required."]);
        exit;
    }
}
