<?php

function logEmail($userEmail, $subject, $message) {
    $logEntry = date('Y-m-d H:i:s') . " - TO: $userEmail - SUBJECT: $subject - MESSAGE: " . str_replace("\n", " ", $message) . PHP_EOL;
    $logFile = __DIR__ . '/../logs/emails.log';
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

function sendMail($userEmail, $subject, $message) {
    $headers = "From: StayVora <noreply@stayvora.com>\r\n";
    $headers .= "Reply-To: support@stayvora.com\r\n";

    logEmail($userEmail, $subject, $message);

    if (filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        @mail($userEmail, $subject, $message, $headers);
    }
}

function buildBookingSummary($booking, $hotelName = '', $roomType = '', $extraLines = []) {
    $b = $booking;
    $lines = [];
    $lines[] = "Booking ID: " . ($b['booking_code'] ?? $b['id'] ?? '-');
    if ($hotelName !== '') $lines[] = "Hotel: " . $hotelName;
    if ($roomType !== '') $lines[] = "Room Type: " . $roomType;
    $lines[] = "Check-in: " . ($b['check_in'] ?? '-');
    $lines[] = "Check-out: " . ($b['check_out'] ?? '-');
    $lines[] = "Guests: " . ($b['guests'] ?? 1);
    $lines[] = "Total Price: Rs. " . number_format((float)($b['total_price'] ?? 0), 2);
    if (!empty($b['special_requests'])) $lines[] = "Special Requests: " . $b['special_requests'];
    foreach ($extraLines as $line) $lines[] = $line;
    return implode("\n", $lines);
}

function sendVerificationCode($userEmail, $code) {
    $subject = "Verify Your Email - StayVora";
    $message = "Your email verification code is: " . $code . "\n\n";
    $message .= "Enter this code on the verification page to activate your account.\n";
    $message .= "This code expires in 10 minutes.\n\n";
    $message .= "If you did not request this, you can safely ignore this email.\n\n";
    $message .= "Thank you for choosing StayVora!";
    sendMail($userEmail, $subject, $message);
}

function sendRegistrationEmail($userEmail, $name) {
    $subject = "Welcome to StayVora - Registration Successful";
    $message = "Hi " . $name . ",\n\n";
    $message .= "Welcome to StayVora! Your account has been created successfully.\n\n";
    $message .= "You can now log in and start exploring and booking amazing hotels across Sri Lanka.\n\n";
    $message .= "Thank you for choosing StayVora!";
    sendMail($userEmail, $subject, $message);
}

function sendLoginAlertEmail($userEmail, $name) {
    $subject = "New Login to Your StayVora Account";
    $message = "Hi " . $name . ",\n\n";
    $message .= "We noticed a new login to your StayVora account.\n\n";
    $message .= "If this was you, you do not need to take any action.\n";
    $message .= "If this was NOT you, please contact our support team immediately to secure your account.\n\n";
    $message .= "Thank you for choosing StayVora!";
    sendMail($userEmail, $subject, $message);
}

function sendBookingPlacedToCustomer($userEmail, $booking, $hotelName, $roomType = '') {
    $subject = "Booking Request Received - " . $hotelName;
    $name = $booking['guest_name'] ?? 'there';
    $message = "Hi " . $name . ",\n\n";
    $message .= "Your booking request for " . $hotelName . " has been received successfully. The hotel owner has been notified and your booking is currently pending confirmation.\n\n";
    $message .= "Booking Details:\n";
    $message .= buildBookingSummary($booking, $hotelName, $roomType) . "\n\n";
    $message .= "You will receive an email once the hotel owner responds to your booking.\n\n";
    $message .= "Thank you for choosing StayVora!";
    sendMail($userEmail, $subject, $message);
}

function sendBookingPlacedToOwner($ownerEmail, $booking, $hotelName, $roomType = '') {
    $subject = "New Booking Received - " . $hotelName;
    $guestName = $booking['guest_name'] ?? 'A customer';
    $message = "Hello,\n\n";
    $message .= "A new booking has just been placed by " . $guestName . " for your hotel " . $hotelName . ". Please review and respond to this booking.\n\n";
    $message .= "Order Details:\n";
    $message .= buildBookingSummary($booking, $hotelName, $roomType, [
        "Guest Name: " . $guestName,
        "Guest Email: " . ($booking['guest_email'] ?? '-'),
        "Guest Phone: " . ($booking['guest_phone'] ?? '-'),
    ]) . "\n\n";
    $message .= "Log in to your hotel owner dashboard to confirm or cancel this booking.\n\n";
    $message .= "Thank you for using StayVora!";
    sendMail($ownerEmail, $subject, $message);
}

function sendBookingStatusUpdate($userEmail, $bookingDetails, $status, $hotelName = '', $roomType = '') {
    if ($status === 'confirmed') {
        $subject = "Booking Confirmed - " . ($hotelName !== '' ? $hotelName : 'StayVora');
        $message = "Good news! Your booking has been confirmed by the hotel owner.\n\n";
    } elseif ($status === 'cancelled') {
        $subject = "Booking Cancelled - " . ($hotelName !== '' ? $hotelName : 'StayVora');
        $message = "We're sorry, but your booking has been cancelled.\n\n";
    } else {
        $subject = "Booking Status Update - StayVora";
        $message = "Your booking status has been updated to " . strtoupper($status) . ".\n\n";
    }

    $message .= "Booking Details:\n";
    $message .= buildBookingSummary($bookingDetails, $hotelName, $roomType) . "\n\n";
    $message .= "Thank you for choosing StayVora!";
    sendMail($userEmail, $subject, $message);
}

function sendBookingConfirmation($userEmail, $bookingDetails, $hotelName) {
    sendBookingPlacedToCustomer($userEmail, $bookingDetails, $hotelName);
}