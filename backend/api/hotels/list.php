<?php
require_once __DIR__ . '/../../utils/cors.php';
applyCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/auth_middleware.php';

$db = new Database();
$conn = $db->getConnection();

$search = $_GET['search'] ?? '';

$sql = "SELECT h.*, u.name as owner_name,
        (SELECT MIN(price) FROM rooms WHERE hotel_id = h.id AND is_available = 1) as min_room_price
        FROM hotels h
        JOIN users u ON h.owner_id = u.id
        WHERE h.status = 'active'";

$params = [];

if (!empty($search)) {
    $sql .= " AND (h.name LIKE ? OR h.location LIKE ?)";
    $searchTerm = "%{$search}%";
    $params = [$searchTerm, $searchTerm];
}

$sql .= " ORDER BY h.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$hotels = $stmt->fetchAll();

foreach ($hotels as &$hotel) {
    $imgStmt = $conn->prepare("SELECT image_url FROM hotel_images WHERE hotel_id = ? LIMIT 1");
    $imgStmt->execute([$hotel['id']]);
    $image = $imgStmt->fetch();
    $hotel['image'] = $image ? $image['image_url'] : null;

    $imgStmt = $conn->prepare("SELECT image_url FROM hotel_images WHERE hotel_id = ?");
    $imgStmt->execute([$hotel['id']]);
    $hotel['images'] = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
}
unset($hotel);

jsonResponse(["hotels" => $hotels]);