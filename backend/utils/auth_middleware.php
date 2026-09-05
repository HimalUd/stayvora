<?php
require_once __DIR__ . '/../config/session.php';

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}
