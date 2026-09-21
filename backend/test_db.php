<?php
require_once __DIR__ . '/utils/cors.php';
applyCors();

if (!headers_sent()) {
    header('Content-Type: application/json; charset=UTF-8');
}

require_once __DIR__ . '/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
    $serverVersion = $conn->getAttribute(PDO::ATTR_SERVER_VERSION);
    
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $tableCounts = [];
    foreach ($tables as $table) {
        $count = $conn->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
        $tableCounts[$table] = (int)$count;
    }
    
    echo json_encode([
        "status" => "success",
        "message" => "Backend successfully connected to MySQL database",
        "database" => $dbName,
        "mysql_version" => $serverVersion,
        "total_tables" => count($tables),
        "tables" => $tableCounts
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to connect to database: " . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
