<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Review.php';
require_once __DIR__ . '/../Models/Booking.php';
require_once __DIR__ . '/../Models/Hotel.php';
require_once __DIR__ . '/../Models/Notification.php';

class ReviewController extends Controller {
    private Review $reviewModel;
    private Booking $bookingModel;
    private Hotel $hotelModel;
    private Notification $notificationModel;

    public function __construct() {
        parent::__construct();
        $this->reviewModel = new Review();
        $this->bookingModel = new Booking();
        $this->hotelModel = new Hotel();
        $this->notificationModel = new Notification();
    }

    public function add(): void {
        try {
            $this->requireLogin();
            $input = $this->getJsonInput();

            $hotelId = (int)($input['hotel_id'] ?? 0);
            $bookingId = (int)($input['booking_id'] ?? 0);
            $rating = (float)($input['rating'] ?? 0);
            $title = trim($input['title'] ?? '');
            $comment = trim($input['comment'] ?? '');

            if (!$hotelId || !$bookingId) {
                $this->json(["message" => "hotel_id and booking_id are required"], 422);
            }

            if ($rating < 1 || $rating > 5) {
                $this->json(["message" => "Rating must be between 1 and 5"], 422);
            }

            if ($comment === '') {
                $this->json(["message" => "Please write a review comment"], 422);
            }

            $hotel = $this->hotelModel->findById($hotelId);
            if (!$hotel) {
                $this->json(["message" => "Hotel not found"], 404);
            }

            $booking = $this->bookingModel->findById($bookingId);
            if (!$booking) {
                $this->json(["message" => "Booking not found"], 404);
            }
            if ((int)$booking['user_id'] !== $this->getUserId()) {
                $this->json(["message" => "You can only review your own bookings"], 403);
            }
            if ($booking['hotel_id'] != $hotelId) {
                $this->json(["message" => "Booking does not match this hotel"], 422);
            }
            if ($booking['status'] !== 'confirmed') {
                $this->json(["message" => "You can only review confirmed bookings"], 400);
            }

            $existing = $this->reviewModel->getByBooking($bookingId);
            if ($existing) {
                $this->reviewModel->update((int)$existing['id'], [
                    'rating' => $rating,
                    'title' => $title ?: null,
                    'comment' => $comment,
                ]);
                $this->reviewModel->updateHotelRating($hotelId);
                $review = $this->reviewModel->findById((int)$existing['id']);
                $this->json(["message" => "Review updated successfully", "review" => $review]);
            }

            $reviewId = $this->reviewModel->create([
                'hotel_id' => $hotelId,
                'user_id' => $this->getUserId(),
                'booking_id' => $bookingId,
                'rating' => $rating,
                'title' => $title ?: null,
                'comment' => $comment,
            ]);

            $this->notificationModel->createForUser(
                (int)$hotel['owner_id'],
                null,
                'review',
                "New review for " . $hotel['name'],
                ($_SESSION['name'] ?? 'A guest') . " rated " . $hotel['name'] . " " . (int)$rating . "/5" .
                    ($title !== '' ? " — \"" . $title . "\"" : "") . ": " . $comment
            );

            $this->reviewModel->updateHotelRating($hotelId);
            $review = $this->reviewModel->findById($reviewId);
            $this->json(["message" => "Review submitted successfully", "review" => $review], 201);
        } catch (Exception $e) {
            $this->json(["message" => "Review failed: " . $e->getMessage()], 500);
        }
    }

    public function list(): void {
        $hotelId = (int)($this->getQueryParam('hotel_id', 0));
        if (!$hotelId) {
            $this->json(["message" => "hotel_id is required"], 422);
        }

        $reviews = $this->reviewModel->getByHotel($hotelId);
        $summary = $this->reviewModel->getHotelSummary($hotelId);
        $this->json(["reviews" => $reviews, "summary" => $summary]);
    }

    public function owner(): void {
        $this->requireOwner();
        $reviews = $this->reviewModel->getByOwner($this->getUserId());
        $this->json(["reviews" => $reviews]);
    }

    public function mine(): void {
        $this->requireLogin();
        $bookingId = (int)($this->getQueryParam('booking_id', 0));
        if (!$bookingId) {
            $this->json(["message" => "booking_id is required"], 422);
        }

        $review = $this->reviewModel->getByBooking($bookingId);
        if ($review && (int)$review['user_id'] !== $this->getUserId()) {
            $this->json(["message" => "Access denied"], 403);
        }
        $this->json(["review" => $review]);
    }
}