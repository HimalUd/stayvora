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
require_once __DIR__ . '/../../utils/email.php';

requireLogin();

try {
    $db = new Database();
    $conn = $db->getConnection();

    $input = getInput();
    $hotelId = $input['hotel_id'] ?? null;
    $roomId = $input['room_id'] ?? null;
    $checkIn = $input['check_in'] ?? '';
    $checkOut = $input['check_out'] ?? '';
    $guests = (int)($input['guests'] ?? 1);
    $firstName = trim($input['first_name'] ?? '');
    $lastName = trim($input['last_name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $specialRequests = trim($input['special_requests'] ?? '');

    if (!$hotelId || !$roomId || empty($checkIn) || empty($checkOut)) {
        jsonResponse(["message" => "hotel_id, room_id, check_in, and check_out are required"], 422);
    }

    if ($checkIn >= $checkOut) {
        jsonResponse(["message" => "Check-out date must be after check-in date"], 422);
    }

    $stmt = $conn->prepare("SELECT * FROM rooms WHERE id = ? AND hotel_id = ?");
    $stmt->execute([$roomId, $hotelId]);
    $room = $stmt->fetch();

    if (!$room) {
        jsonResponse(["message" => "Room not found"], 404);
    }

    if (!$room['is_available']) {
        jsonResponse(["message" => "Room is not available"], 400);
    }

    $stmt = $conn->prepare("SELECT * FROM hotels WHERE id = ?");
    $stmt->execute([$hotelId]);
    $hotel = $stmt->fetch();

    if (!$hotel) {
        jsonResponse(["message" => "Hotel not found"], 404);
    }

    $capacity = max(1, (int)($room['capacity'] ?? 2));
    $roomsNeeded = (int)ceil($guests / $capacity);
    $numRooms = isset($input['num_rooms']) && (int)$input['num_rooms'] > 0
        ? max($roomsNeeded, (int)$input['num_rooms'])
        : $roomsNeeded;

    $totalRooms = max(1, (int)($room['total_rooms'] ?? 1));

    $stmt = $conn->prepare("SELECT check_in, check_out, COALESCE(num_rooms, 1) AS num_rooms FROM bookings WHERE room_id = ? AND status IN ('pending', 'confirmed') AND (check_in < ? AND check_out > ?)");
    $stmt->execute([$roomId, $checkOut, $checkIn]);
    $overlappingBookings = $stmt->fetchAll();

    $start = new DateTime($checkIn);
    $end = new DateTime($checkOut);
    $maxBookedOnAnyNight = 0;
    for ($current = clone $start; $current < $end; $current->modify('+1 day')) {
        $dateStr = $current->format('Y-m-d');
        $bookedTonight = 0;
        foreach ($overlappingBookings as $b) {
            if ($b['check_in'] <= $dateStr && $b['check_out'] > $dateStr) {
                $bookedTonight += (int)$b['num_rooms'];
            }
        }
        if ($bookedTonight > $maxBookedOnAnyNight) {
            $maxBookedOnAnyNight = $bookedTonight;
        }
    }

    $availableRooms = max(0, $totalRooms - $maxBookedOnAnyNight);
    if ($numRooms > $availableRooms) {
        $msg = $availableRooms <= 0
            ? "This room is completely booked for the selected dates."
            : "Only {$availableRooms} room(s) available for the selected dates, but {$numRooms} room(s) are required for {$guests} guest(s).";
        jsonResponse(["message" => $msg], 409);
    }

    $checkInDate = new DateTime($checkIn);
    $checkOutDate = new DateTime($checkOut);
    $nights = $checkInDate->diff($checkOutDate)->days;
    if ($nights < 1) $nights = 1;

    $totalPrice = $room['price'] * $nights * $numRooms;
    $bookingCode = 'BKD' . strtoupper(substr(uniqid(), -7));
    $guestName = trim($firstName . ' ' . $lastName);

    $stmt = $conn->prepare("INSERT INTO bookings (user_id, hotel_id, room_id, booking_code, check_in, check_out, guests, num_rooms, total_price, guest_name, guest_email, guest_phone, special_requests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $hotelId, $roomId, $bookingCode, $checkIn, $checkOut, $guests, $numRooms, $totalPrice, $guestName, $email, $phone, $specialRequests]);

    $bookingId = $conn->lastInsertId();

    $stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    $stmt = $conn->prepare(
        "INSERT INTO notifications (user_id, booking_id, type, title, message)
         VALUES (?, ?, 'booking', ?, ?)"
    );
    $stmt->execute([
        $hotel['owner_id'],
        $bookingId,
        "New booking for " . $hotel['name'],
        $guestName . " booked " . $room['room_type'] . " from " . $checkIn . " to " . $checkOut . " (" . $nights . " night(s), $" . $totalPrice . "). Booking code: " . $bookingCode
    ]);

    try {
        $userEmail = $_SESSION['email'] ?? '';
        $roomType = $room['room_type'] ?? '';
        sendBookingPlacedToCustomer($userEmail, $booking, $hotel['name'], $roomType);

        $stmt = $conn->prepare("SELECT email FROM users WHERE id = ?");
        $stmt->execute([$hotel['owner_id']]);
        $owner = $stmt->fetch();
        if ($owner) {
            sendBookingPlacedToOwner($owner['email'], $booking, $hotel['name'], $roomType);
        }
    } catch (Exception $e) {
    }

    jsonResponse(["message" => "Booking created successfully", "booking" => $booking], 201);
} catch (Exception $e) {
    jsonResponse(["message" => "Booking failed: " . $e->getMessage()], 500);
}