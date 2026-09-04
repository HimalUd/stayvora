<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Hotel.php';
require_once __DIR__ . '/../Models/Booking.php';
require_once __DIR__ . '/../Models/Review.php';
require_once __DIR__ . '/../Models/User.php';

class AdminController extends Controller {
    private Hotel $hotelModel;
    private Booking $bookingModel;
    private Review $reviewModel;
    private User $userModel;

    public function __construct() {
        parent::__construct();
        $this->hotelModel = new Hotel();
        $this->bookingModel = new Booking();
        $this->reviewModel = new Review();
        $this->userModel = new User();
    }

    public function hotels(): void {
        $this->requireAdmin();
        $hotels = $this->hotelModel->getAdminHotelList();
        $this->json(["hotels" => $hotels]);
    }

    public function stats(): void {
        $this->requireAdmin();
        $totalHotels = (int)$this->hotelModel->query("SELECT COUNT(*) as c FROM hotels")->fetch()['c'];
        $totalBookings = (int)$this->hotelModel->query("SELECT COUNT(*) as c FROM bookings")->fetch()['c'];
        $totalReviews = (int)$this->hotelModel->query("SELECT COUNT(*) as c FROM reviews")->fetch()['c'];
        $flagged = $this->hotelModel->query(
            "SELECT COUNT(*) as c FROM hotels WHERE rating < 3"
        )->fetch()['c'];
        $totalUsers = (int)$this->hotelModel->query(
            "SELECT COUNT(*) as c FROM users WHERE role = 'traveler'"
        )->fetch()['c'];

        $this->json([
            "stats" => [
                "total_hotels" => $totalHotels,
                "total_bookings" => $totalBookings,
                "total_reviews" => $totalReviews,
                "flagged_hotels" => (int)$flagged,
                "total_users" => $totalUsers,
            ]
        ]);
    }

    public function bookings(): void {
        $this->requireAdmin();
        $bookings = $this->bookingModel->fetchAll(
            "SELECT b.*, h.name as hotel_name, u.name as user_name
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN users u ON b.user_id = u.id
             ORDER BY b.created_at DESC
             LIMIT 5"
        );
        $this->json(["bookings" => $bookings]);
    }

    public function reviews(): void {
        $this->requireAdmin();
        $reviews = $this->reviewModel->fetchAll(
            "SELECT r.*, h.name as hotel_name, u.name as user_name, u.email as user_email
             FROM reviews r
             JOIN hotels h ON r.hotel_id = h.id
             JOIN users u ON r.user_id = u.id
             ORDER BY r.created_at DESC"
        );
        $this->json(["reviews" => $reviews]);
    }

    public function deleteReview(): void {
        $this->requireAdmin();
        $input = $this->getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;

        if (!$id || !is_numeric($id)) {
            $this->json(["message" => "Review ID is required"], 400);
        }

        $id = (int)$id;
        $review = $this->reviewModel->findById($id);
        if (!$review) {
            $this->json(["message" => "Review not found"], 404);
        }

        try {
            $this->reviewModel->query("DELETE FROM reviews WHERE id = ?", [$id]);
            $this->reviewModel->updateHotelRating((int)$review['hotel_id']);
            $this->json(["message" => "Review removed successfully"]);
        } catch (Exception $e) {
            $this->json(["message" => "Failed to remove review"], 500);
        }
    }

    public function deleteHotel(): void {
        $this->requireAdmin();
        $input = $this->getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;

        if (!$id || !is_numeric($id)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $id = (int)$id;
        $hotel = $this->hotelModel->findById($id);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }

        try {
            $this->hotelModel->beginTransaction();
            $this->hotelModel->query("DELETE FROM hotel_images WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM bookings WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM rooms WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM events WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM special_offers WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM nearby_places WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM hotels WHERE id = ?", [$id]);
            $this->hotelModel->commit();
            $this->json(["message" => "Hotel deleted successfully by admin"]);
        } catch (Exception $e) {
            $this->hotelModel->rollBack();
            $this->json(["message" => "Failed to delete hotel"], 500);
        }
    }

    public function users(): void {
        $this->requireAdmin();
        $users = $this->userModel->fetchAll(
            "SELECT u.id, u.name, u.email, u.phone, u.role, u.email_verified, u.is_active, u.created_at,
                    (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) as bookings_count,
                    (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) as reviews_count
             FROM users u
             WHERE u.role = 'traveler'
             ORDER BY u.created_at DESC"
        );
        $this->json(["users" => $users]);
    }

    public function userDetail(): void {
        $this->requireAdmin();
        $id = $this->getQueryParam('id');
        if (!$id || !is_numeric($id)) {
            $this->json(["message" => "User ID is required"], 400);
        }
        $id = (int)$id;
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->json(["message" => "User not found"], 404);
        }
        if ($user['role'] !== 'traveler') {
            $this->json(["message" => "Not a traveler user"], 400);
        }

        $bookings = $this->bookingModel->fetchAll(
            "SELECT b.id, b.booking_code, b.check_in, b.check_out, b.guests, b.total_price,
                    b.status, b.created_at, b.guest_name, b.guest_email, b.guest_phone,
                    h.name as hotel_name, h.city as hotel_city,
                    r.room_type
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC",
            [$id]
        );

        $reviews = $this->reviewModel->fetchAll(
            "SELECT r.id, r.rating, r.title, r.comment, r.created_at, r.booking_id,
                    h.name as hotel_name
             FROM reviews r
             JOIN hotels h ON r.hotel_id = h.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC",
            [$id]
        );

        unset($user['password_hash'], $user['verification_code']);
        $this->json([
            "user" => $user,
            "bookings_count" => count($bookings),
            "reviews_count" => count($reviews),
            "bookings" => $bookings,
            "reviews" => $reviews,
        ]);
    }

    public function deleteUser(): void {
        $this->requireAdmin();
        $input = $this->getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;

        if (!$id || !is_numeric($id)) {
            $this->json(["message" => "User ID is required"], 400);
        }

        $id = (int)$id;
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->json(["message" => "User not found"], 404);
        }
        if ($user['role'] === 'admin') {
            $this->json(["message" => "Admin users cannot be removed"], 400);
        }
        if ($id === $this->getUserId()) {
            $this->json(["message" => "You cannot remove your own account"], 400);
        }

        try {
            $this->userModel->update($id, ['is_active' => 0]);
            $this->json(["message" => "User removed successfully"]);
        } catch (Exception $e) {
            $this->json(["message" => "Failed to remove user"], 500);
        }
    }
}