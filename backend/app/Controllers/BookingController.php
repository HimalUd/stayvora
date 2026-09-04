<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Booking.php';
require_once __DIR__ . '/../Models/Hotel.php';
require_once __DIR__ . '/../Models/Room.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/Notification.php';
require_once __DIR__ . '/../../utils/email.php';

class BookingController extends Controller {
    private Booking $bookingModel;
    private Hotel $hotelModel;
    private Room $roomModel;
    private User $userModel;
    private Notification $notificationModel;

    public function __construct() {
        parent::__construct();
        $this->bookingModel = new Booking();
        $this->hotelModel = new Hotel();
        $this->roomModel = new Room();
        $this->userModel = new User();
        $this->notificationModel = new Notification();
    }

    public function create(): void {
        try {
            $this->requireLogin();
            $input = $this->getJsonInput();

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
                $this->json(["message" => "hotel_id, room_id, check_in, and check_out are required"], 422);
            }

            if ($checkIn >= $checkOut) {
                $this->json(["message" => "Check-out date must be after check-in date"], 422);
            }

            $room = $this->roomModel->findById((int)$roomId);
            if (!$room || $room['hotel_id'] != $hotelId) {
                $this->json(["message" => "Room not found"], 404);
            }
            if (!$room['is_available']) {
                $this->json(["message" => "Room is not available"], 400);
            }

            $hotel = $this->hotelModel->findById((int)$hotelId);
            if (!$hotel) {
                $this->json(["message" => "Hotel not found"], 404);
            }

            if ($this->bookingModel->isRoomBooked((int)$roomId, $checkIn, $checkOut)) {
                $this->json(["message" => "Room is already booked for these dates"], 409);
            }

            $checkInDate = new DateTime($checkIn);
            $checkOutDate = new DateTime($checkOut);
            $nights = max($checkInDate->diff($checkOutDate)->days, 1);
            $totalPrice = $room['price'] * $nights;

            $bookingCode = 'BKD' . strtoupper(substr(uniqid(), -7));
            $guestName = trim($firstName . ' ' . $lastName);

            $bookingId = $this->bookingModel->createBooking(
                $this->getUserId(), (int)$hotelId, (int)$roomId,
                $checkIn, $checkOut, $guests, $totalPrice,
                $bookingCode, $guestName, $email, $phone, $specialRequests
            );

            $booking = $this->bookingModel->findById($bookingId);

            $this->notificationModel->createForUser(
                (int)$hotel['owner_id'],
                $bookingId,
                'booking',
                "New booking for " . $hotel['name'],
                $guestName . " booked " . $room['room_type'] . " from " . $checkIn . " to " . $checkOut .
                    " (" . $nights . " night(s), $" . $totalPrice . "). Booking code: " . $bookingCode
            );

            try {
                $userEmail = $_SESSION['email'] ?? '';
                $roomType = $room['room_type'] ?? '';
                sendBookingPlacedToCustomer($userEmail, $booking, $hotel['name'], $roomType);

                $ownerEmail = $this->userModel->getOwnerEmail($hotel['owner_id']);
                if ($ownerEmail) {
                    sendBookingPlacedToOwner($ownerEmail, $booking, $hotel['name'], $roomType);
                }
            } catch (Exception $e) {
            }

            $this->json(["message" => "Booking created successfully", "booking" => $booking], 201);
        } catch (Exception $e) {
            $this->json(["message" => "Booking failed: " . $e->getMessage()], 500);
        }
    }

    public function listUser(): void {
        $this->requireLogin();
        $bookings = $this->bookingModel->getUserBookingsWithImages($this->getUserId());
        $this->json(["bookings" => $bookings]);
    }

    public function listOwner(): void {
        $this->requireOwner();
        $hotelIdParam = $this->getQueryParam('hotel_id');
        $hotelId = ($hotelIdParam !== null && $hotelIdParam !== '') ? (int)$hotelIdParam : null;
        $bookings = $this->bookingModel->getOwnerBookings($this->getUserId(), $hotelId);
        $this->json(["bookings" => $bookings]);
    }

    public function confirm(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Booking ID is required"], 400);
        }

        $booking = $this->bookingModel->getBookingWithOwner($id);
        if (!$booking) {
            $this->json(["message" => "Booking not found"], 404);
        }
        if ($booking['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only confirm bookings for your own hotels"], 403);
        }
        if ($booking['status'] !== 'pending') {
            $this->json(["message" => "Only pending bookings can be confirmed"], 400);
        }

        $this->bookingModel->confirmBooking($id);
        $updatedBooking = $this->bookingModel->findById($id);
        sendBookingStatusUpdate($booking['user_email'], $updatedBooking, 'confirmed', $booking['hotel_name'], $booking['room_type'] ?? '');

        $this->json(["message" => "Booking confirmed successfully", "booking" => $updatedBooking]);
    }

    public function cancel(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Booking ID is required"], 400);
        }

        $booking = $this->bookingModel->getBookingWithOwner($id);
        if (!$booking) {
            $this->json(["message" => "Booking not found"], 404);
        }
        if ($booking['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only cancel bookings for your own hotels"], 403);
        }
        if ($booking['status'] === 'cancelled') {
            $this->json(["message" => "Booking is already cancelled"], 400);
        }

        $this->bookingModel->cancelBooking($id);
        $updatedBooking = $this->bookingModel->findById($id);
        sendBookingStatusUpdate($booking['user_email'], $updatedBooking, 'cancelled', $booking['hotel_name'], $booking['room_type'] ?? '');

        $this->json(["message" => "Booking cancelled successfully", "booking" => $updatedBooking]);
    }

    public function cancelUser(): void {
        $this->requireLogin();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Booking ID is required"], 400);
        }

        $booking = $this->bookingModel->getBookingWithOwner($id);
        if (!$booking) {
            $this->json(["message" => "Booking not found"], 404);
        }
        if ($booking['user_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only cancel your own bookings"], 403);
        }
        if ($booking['status'] !== 'pending') {
            $this->json(["message" => "Only pending bookings can be cancelled. The hotel owner has already responded to this booking."], 400);
        }

        $this->bookingModel->cancelBooking($id);
        $updatedBooking = $this->bookingModel->findById($id);

        $this->notificationModel->createForUser(
            $booking['owner_id'],
            $id,
            'booking',
            "Booking " . $updatedBooking['booking_code'] . " cancelled by customer",
            "The booking for " . $booking['hotel_name'] . " (" . $updatedBooking['booking_code'] . ") was cancelled by the customer."
        );

        sendBookingStatusUpdate($booking['user_email'], $updatedBooking, 'cancelled', $booking['hotel_name'], $booking['room_type'] ?? '');

        $this->json(["message" => "Booking cancelled successfully", "booking" => $updatedBooking]);
    }
}
