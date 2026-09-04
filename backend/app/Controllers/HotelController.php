<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Hotel.php';

class HotelController extends Controller {
    private Hotel $hotelModel;

    public function __construct() {
        parent::__construct();
        $this->hotelModel = new Hotel();
    }

    public function list(): void {
        $search = $this->getQueryParam('search', '');
        $hotels = $this->hotelModel->getActiveHotelsWithMinPrice($search);

        foreach ($hotels as &$hotel) {
            $hotel['image'] = $this->hotelModel->getFirstImage($hotel['id']);
            $hotel['images'] = $this->hotelModel->getHotelImages($hotel['id']);
        }
        unset($hotel);

        $this->json(["hotels" => $hotels]);
    }

    public function get(): void {
        $id = $this->getQueryParam('id');
        if (!$id || !is_numeric($id)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $hotel = $this->hotelModel->getFullHotelDetails((int)$id);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }

        $this->json(["hotel" => $hotel]);
    }

    public function create(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();

        $name = trim($input['name'] ?? '');
        if (empty($name)) {
            $this->json(["message" => "Hotel name is required"], 422);
        }

        $hotelId = $this->hotelModel->createHotel($this->getUserId(), $input);
        $hotel = $this->hotelModel->findById($hotelId);

        $this->json(["message" => "Hotel created successfully", "hotel" => $hotel], 201);
    }

    public function extractAddress(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $url = trim($input['url'] ?? '');

        if (empty($url)) {
            $this->json(["message" => "Google Maps URL is required"], 400);
        }

        require_once __DIR__ . '/../../utils/maps.php';
        $this->json(extractMapUrl($url));
    }

    public function update(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $hotel = $this->hotelModel->findById($id);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update your own hotels"], 403);
        }

        $fields = ['name', 'description', 'location', 'address', 'city', 'country', 'price_range', 'amenities', 'travel_purpose', 'status', 'map_url'];
        $updates = [];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[$field] = $input[$field];
            }
        }

        if (empty($updates)) {
            $this->json(["message" => "No fields to update"], 422);
        }

        $this->hotelModel->updateHotel($id, $updates);
        $hotel = $this->hotelModel->findById($id);
        $this->json(["message" => "Hotel updated successfully", "hotel" => $hotel]);
    }

    public function addAmenity(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $hotelId = $input['hotel_id'] ?? null;
        $amenity = trim($input['amenity'] ?? '');

        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }
        if (empty($amenity)) {
            $this->json(["message" => "Amenity name is required"], 422);
        }

        $hotel = $this->hotelModel->findById((int)$hotelId);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update your own hotels"], 403);
        }

        $current = array_filter(array_map('trim', explode(',', $hotel['amenities'] ?? '')));
        if (!in_array($amenity, $current)) {
            $current[] = $amenity;
        }

        $updated = implode(', ', $current);
        $this->hotelModel->updateHotel((int)$hotelId, ['amenities' => $updated]);
        $hotel = $this->hotelModel->findById((int)$hotelId);

        $this->json(["message" => "Amenity added successfully", "hotel" => $hotel]);
    }

    public function deleteAmenity(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $hotelId = $input['hotel_id'] ?? null;
        $amenity = trim($input['amenity'] ?? '');

        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }
        if (empty($amenity)) {
            $this->json(["message" => "Amenity name is required"], 422);
        }

        $hotel = $this->hotelModel->findById((int)$hotelId);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update your own hotels"], 403);
        }

        $current = array_filter(array_map('trim', explode(',', $hotel['amenities'] ?? '')));
        $updated = implode(', ', array_values(array_filter($current, fn($a) => $a !== $amenity)));
        $this->hotelModel->updateHotel((int)$hotelId, ['amenities' => $updated]);
        $hotel = $this->hotelModel->findById((int)$hotelId);

        $this->json(["message" => "Amenity removed successfully", "hotel" => $hotel]);
    }

    public function delete(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $hotel = $this->hotelModel->findById($id);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only delete your own hotels"], 403);
        }

        try {
            $this->hotelModel->beginTransaction();
            $this->hotelModel->query("DELETE FROM hotel_images WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM rooms WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM events WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM special_offers WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM nearby_places WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM bookings WHERE hotel_id = ?", [$id]);
            $this->hotelModel->query("DELETE FROM hotels WHERE id = ?", [$id]);
            $this->hotelModel->commit();
            $this->json(["message" => "Hotel deleted successfully"]);
        } catch (Exception $e) {
            $this->hotelModel->rollBack();
            $this->json(["message" => "Failed to delete hotel"], 500);
        }
    }

    public function my(): void {
        $this->requireOwner();
        $hotels = $this->hotelModel->getHotelsByOwner($this->getUserId());
        $this->json(["hotels" => $hotels]);
    }

    public function addImage(): void {
        $this->requireOwner();

        $hotelId = 0;
        $imageUrl = '';

        // Check for file upload
        if (!empty($_FILES['image']['tmp_name'])) {
            $hotelId = (int)($_POST['hotel_id'] ?? 0);
            if (!$hotelId) {
                $this->json(["message" => "Hotel ID is required"], 400);
            }

            $hotel = $this->hotelModel->findById($hotelId);
            if (!$hotel || $hotel['owner_id'] != $this->getUserId()) {
                $this->json(["message" => "Hotel not found or access denied"], 404);
            }

            $file = $_FILES['image'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $this->json(["message" => "Upload failed. Please try again"], 400);
            }
            if ($file['size'] > 5 * 1024 * 1024) {
                $this->json(["message" => "Image must be 5MB or smaller"], 422);
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
            $mimeExt = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
            ];
            if (!isset($mimeExt[$mime])) {
                $this->json(["message" => "Only JPG, PNG, GIF, and WEBP images are allowed"], 422);
            }

            $uploadDir = __DIR__ . '/../../uploads/hotels/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $filename = uniqid('hotel_') . '.' . $mimeExt[$mime];
            $dest = $uploadDir . $filename;

            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                $this->json(["message" => "Failed to upload image"], 500);
            }

            $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
            $imageUrl = $baseUrl . '/uploads/hotels/' . $filename;
        } else {
            // Fall back to JSON URL input
            $input = $this->getJsonInput();
            $hotelId = (int)($input['hotel_id'] ?? 0);

            if (!$hotelId) {
                $this->json(["message" => "Hotel ID is required"], 400);
            }

            $hotel = $this->hotelModel->findById($hotelId);
            if (!$hotel || $hotel['owner_id'] != $this->getUserId()) {
                $this->json(["message" => "Hotel not found or access denied"], 404);
            }

            $imageUrl = trim($input['image_url'] ?? '');
            if (empty($imageUrl)) {
                $this->json(["message" => "Image URL is required"], 422);
            }
            if (!preg_match('/^https?:\/\//i', $imageUrl)) {
                $this->json(["message" => "Image URL must start with http:// or https://"], 422);
            }
        }

        require_once __DIR__ . '/../Models/HotelImage.php';
        $imageModel = new HotelImage();
        $imageId = $imageModel->addImage($hotelId, $imageUrl);
        $this->json(["message" => "Image added successfully", "id" => $imageId], 201);
    }

    public function deleteImage(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Image ID is required"], 400);
        }

        require_once __DIR__ . '/../Models/HotelImage.php';
        $imageModel = new HotelImage();
        $image = $imageModel->findById($id);

        if (!$image) {
            $this->json(["message" => "Image not found"], 404);
        }

        $hotel = $this->hotelModel->findById($image['hotel_id']);
        if (!$hotel || $hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "Access denied"], 403);
        }

        $imageModel->delete($id);

        if (strpos($image['image_url'], '/uploads/hotels/') !== false) {
            $filename = basename(parse_url($image['image_url'], PHP_URL_PATH));
            $filePath = __DIR__ . '/../../uploads/hotels/' . $filename;
            if (is_file($filePath)) {
                @unlink($filePath);
            }
        }

        $this->json(["message" => "Image deleted successfully"]);
    }

    public function destinationCounts(): void {
        $locationsParam = $this->getQueryParam('locations', '');
        $locations = array_filter(array_map('trim', explode(',', $locationsParam)));

        if (empty($locations)) {
            $this->json(["message" => "locations parameter is required"], 400);
        }

        $counts = $this->hotelModel->getDestinationCounts(array_values($locations));
        $this->json(["counts" => $counts]);
    }

    public function search(): void {
        $filters = [
            'location' => $this->getQueryParam('location', ''),
            'check_in' => $this->getQueryParam('check_in', ''),
            'check_out' => $this->getQueryParam('check_out', ''),
            'min_price' => $this->getQueryParam('min_price', ''),
            'max_price' => $this->getQueryParam('max_price', ''),
            'rating' => $this->getQueryParam('rating', ''),
            'travel_purpose' => $this->getQueryParam('travel_purpose', ''),
            'event' => $this->getQueryParam('event', ''),
            'amenity' => $this->getQueryParam('amenity', '')
        ];

        $hotels = $this->hotelModel->searchHotels($filters);

        foreach ($hotels as &$hotel) {
            $hotel['image'] = $this->hotelModel->getFirstImage($hotel['id']);
        }
        unset($hotel);

        $this->json(["hotels" => $hotels]);
    }
}
