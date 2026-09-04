<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/NearbyPlace.php';
require_once __DIR__ . '/../Models/Hotel.php';

class PlaceController extends Controller {
    private NearbyPlace $placeModel;
    private Hotel $hotelModel;

    public function __construct() {
        parent::__construct();
        $this->placeModel = new NearbyPlace();
        $this->hotelModel = new Hotel();
    }

    public function list(): void {
        $hotelId = $this->getQueryParam('hotel_id');
        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $places = $this->placeModel->getPlacesByHotel((int)$hotelId);
        $this->json(["places" => $places]);
    }

    public function create(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();

        $hotelId = $input['hotel_id'] ?? null;
        $name = trim($input['name'] ?? '');

        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 422);
        }
        if (empty($name)) {
            $this->json(["message" => "Place name is required"], 422);
        }

        $hotel = $this->hotelModel->findById((int)$hotelId);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only add places to your own hotels"], 403);
        }

        $placeId = $this->placeModel->createPlace((int)$hotelId, $input);
        $place = $this->placeModel->findById($placeId);
        $this->json(["message" => "Place created successfully", "place" => $place], 201);
    }

    public function update(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Place ID is required"], 400);
        }

        $place = $this->placeModel->getPlaceWithOwner($id);
        if (!$place) {
            $this->json(["message" => "Place not found"], 404);
        }
        if ($place['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update places in your own hotels"], 403);
        }

        $fields = ['name', 'description', 'location_url', 'latitude', 'longitude', 'distance', 'category'];
        $updates = [];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[$field] = $input[$field];
            }
        }

        if (empty($updates)) {
            $this->json(["message" => "No fields to update"], 422);
        }

        $this->placeModel->updatePlace($id, $updates);
        $place = $this->placeModel->findById($id);
        $this->json(["message" => "Place updated successfully", "place" => $place]);
    }

    public function geocode(): void {
        $lat = $this->getQueryParam('lat');
        $lng = $this->getQueryParam('lng');

        if (!$lat || !$lng || !is_numeric($lat) || !is_numeric($lng)) {
            $this->json(["message" => "Valid lat and lng are required"], 400);
        }

        require_once __DIR__ . '/../../config/google.php';

        if (empty(GOOGLE_API_KEY)) {
            $this->json(["message" => "Google API key not configured"], 500);
        }

        $url = "https://maps.googleapis.com/maps/api/geocode/json?latlng={$lat},{$lng}&key=" . GOOGLE_API_KEY;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            $this->json(["message" => "Failed to fetch place details"], 502);
        }

        $data = json_decode($response, true);

        if (empty($data['results'])) {
            $this->json(["message" => "No results found"], 404);
        }

        $result = $data['results'][0];
        $name = '';
        foreach ($result['address_components'] ?? [] as $comp) {
            $types = $comp['types'] ?? [];
            if (in_array('point_of_interest', $types) || in_array('establishment', $types) || in_array('premise', $types)) {
                $name = $comp['long_name'];
                break;
            }
        }
        if (empty($name)) {
            foreach ($result['address_components'] ?? [] as $comp) {
                if (in_array('route', $comp['types'] ?? [])) {
                    $name = $comp['long_name'];
                    break;
                }
            }
        }
        if (empty($name)) {
            $name = $result['address_components'][0]['long_name'] ?? '';
        }

        $this->json([
            "name" => $name,
            "display_name" => $result['formatted_address'] ?? '',
            "latitude" => $result['geometry']['location']['lat'] ?? null,
            "longitude" => $result['geometry']['location']['lng'] ?? null,
        ]);
    }

    public function extract(): void {
        $input = $this->getJsonInput();
        $url = trim($input['url'] ?? '');

        if (empty($url)) {
            $this->json(["message" => "URL is required"], 400);
        }

        require_once __DIR__ . '/../../utils/maps.php';
        $this->json(extractMapUrl($url));
    }

    public function delete(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Place ID is required"], 400);
        }

        $place = $this->placeModel->getPlaceWithOwner($id);
        if (!$place) {
            $this->json(["message" => "Place not found"], 404);
        }
        if ($place['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only delete places in your own hotels"], 403);
        }

        $this->placeModel->delete($id);
        $this->json(["message" => "Place deleted successfully"]);
    }
}
