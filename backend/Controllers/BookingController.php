<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\Booking;
use App\Models\Hotel;

class BookingController extends Controller
{
    public function store(): void
    {
        AuthMiddleware::requireLogin();
        $input = $this->getInput();

        $hotelId = (int)($input['hotel_id'] ?? 0);
        $roomId = (int)($input['room_id'] ?? 0);
        $checkIn = trim($input['check_in'] ?? '');
        $checkOut = trim($input['check_out'] ?? '');
        $guests = (int)($input['guests'] ?? 1);
        $totalPrice = (float)($input['total_price'] ?? 0);

        $errors = [];
        if ($hotelId <= 0) $errors[] = "Hotel is required";
        if ($roomId <= 0) $errors[] = "Room is required";
        if (empty($checkIn)) $errors[] = "Check-in date is required";
        if (empty($checkOut)) $errors[] = "Check-out date is required";
        if ($guests < 1) $errors[] = "At least 1 guest required";
        if ($totalPrice <= 0) $errors[] = "Total price is required";

        if (!empty($errors)) {
            $this->error("Validation failed", 422, $errors);
        }

        $booking = new Booking([
            'user_id'     => AuthMiddleware::getUserId(),
            'hotel_id'    => $hotelId,
            'room_id'     => $roomId,
            'check_in'    => $checkIn,
            'check_out'   => $checkOut,
            'guests'      => $guests,
            'total_price' => $totalPrice,
            'status'      => 'pending',
        ]);
        $booking->save();

        $this->success($booking->toArray(), "Booking created successfully", 201);
    }

    public function listUser(): void
    {
        AuthMiddleware::requireLogin();
        $bookings = Booking::getUserBookings(AuthMiddleware::getUserId());
        $this->json(["bookings" => $bookings]);
    }

    public function listOwner(): void
    {
        AuthMiddleware::requireOwner();
        $bookings = Booking::getOwnerBookings(AuthMiddleware::getUserId());
        $this->json(["bookings" => $bookings]);
    }

    public function confirm(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();
        $id = (int)($input['id'] ?? 0);

        $booking = Booking::find($id);
        if (!$booking) {
            $this->error("Booking not found", 404);
        }

        $hotel = Hotel::find($booking->hotel_id);
        if (!$hotel || $hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $booking->confirm();
        $this->success($booking->toArray(), "Booking confirmed");
    }

    public function cancel(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();
        $id = (int)($input['id'] ?? 0);

        $booking = Booking::find($id);
        if (!$booking) {
            $this->error("Booking not found", 404);
        }

        $hotel = Hotel::find($booking->hotel_id);
        if (!$hotel || $hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $booking->cancel();
        $this->success($booking->toArray(), "Booking cancelled");
    }
}
