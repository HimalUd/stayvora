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
require_once __DIR__ . '/../../utils/email.php';

requireOwner();

$db = new Database();
$conn = $db->getConnection();

$input = getInput();
$id = $input['id'] ?? $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    jsonResponse(["message" => "Booking ID is required"], 400);
}

$stmt = $conn->prepare(
    "SELECT b.*, h.name as hotel_name, h.owner_id, r.room_type, u.email as user_email
     FROM bookings b
     JOIN hotels h ON b.hotel_id = h.id
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = ?"
);
$stmt->execute([$id]);
$booking = $stmt->fetch();

if (!$booking) {
    jsonResponse(["message" => "Booking not found"], 404);
}

if ($booking['owner_id'] != $_SESSION['user_id']) {
    jsonResponse(["message" => "You can only confirm bookings for your own hotels"], 403);
}

if ($booking['status'] !== 'pending') {
    jsonResponse(["message" => "Only pending bookings can be confirmed"], 400);
}

$stmt = $conn->prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?");
$stmt->execute([$id]);

$stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ?");
$stmt->execute([$id]);
$updatedBooking = $stmt->fetch();

$stmt = $conn->prepare(
    "INSERT INTO notifications (user_id, booking_id, type, title, message)
     VALUES (?, ?, 'booking', ?, ?)"
);
$stmt->execute([
    $booking['owner_id'],
    $id,
    "Booking " . $updatedBooking['booking_code'] . " confirmed",
    "You confirmed the booking for " . $booking['hotel_name'] . " (" . $updatedBooking['booking_code'] . ")."
]);

sendBookingStatusUpdate($booking['user_email'], $updatedBooking, 'confirmed', $booking['hotel_name'], $booking['room_type'] ?? '');

jsonResponse(["message" => "Booking confirmed successfully", "booking" => $updatedBooking]);