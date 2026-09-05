<?php $raw = file_get_contents("php://input"); header("Content-Type: application/json"); echo json_encode(["raw" => $raw, "post" => $_POST, "json" => json_decode($raw, true)]);
