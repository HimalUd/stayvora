<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\Room;

class HotelController extends Controller
{
    public function index(): void
    {
        $search = $_GET['search'] ?? '';

        $filters = [];
        if (!empty($search)) {
            $filters['search'] = $search;
        }

        $hotels = Hotel::search($filters);

        $this->json(["hotels" => $hotels]);
    }

    public function show(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $hotel = Hotel::find($id);
        if (!$hotel) {
            $this->error("Hotel not found", 404);
        }

        $this->json(["hotel" => $hotel->toDetailArray()]);
    }

    public function store(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $name = trim($input['name'] ?? '');
        if (empty($name)) {
            $this->error("Hotel name is required", 422);
        }

        $hotel = new Hotel([
            'owner_id'       => AuthMiddleware::getUserId(),
            'name'           => $name,
            'description'    => trim($input['description'] ?? ''),
            'location'       => trim($input['location'] ?? ''),
            'address'        => trim($input['address'] ?? ''),
            'price_range'    => trim($input['price_range'] ?? ''),
            'amenities'      => trim($input['amenities'] ?? ''),
            'travel_purpose' => trim($input['travel_purpose'] ?? ''),
        ]);
        $hotel->save();

        $this->success($hotel->toArray(), "Hotel created successfully", 201);
    }

    public function update(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $hotel = Hotel::find($id);
        if (!$hotel) {
            $this->error("Hotel not found", 404);
        }

        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized to update this hotel", 403);
        }

        $hotel->fill([
            'name'           => trim($input['name'] ?? $hotel->name),
            'description'    => trim($input['description'] ?? $hotel->description),
            'location'       => trim($input['location'] ?? $hotel->location),
            'address'        => trim($input['address'] ?? $hotel->address),
            'price_range'    => trim($input['price_range'] ?? $hotel->price_range),
            'amenities'      => trim($input['amenities'] ?? $hotel->amenities),
            'travel_purpose' => trim($input['travel_purpose'] ?? $hotel->travel_purpose),
        ]);
        $hotel->save();

        $this->success($hotel->toArray(), "Hotel updated successfully");
    }

    public function destroy(): void
    {
        AuthMiddleware::requireOwner();
        $id = (int)($_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $hotel = Hotel::find($id);
        if (!$hotel) {
            $this->error("Hotel not found", 404);
        }

        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized to delete this hotel", 403);
        }

        $hotel->delete();
        $this->success(null, "Hotel deleted successfully");
    }

    public function locationCounts(): void
    {
        $locations = ['Sigiriya', 'Galle', 'Ella', 'Colombo', 'Mirissa'];
        $counts = [];
        foreach ($locations as $location) {
            $counts[strtolower($location)] = Hotel::getCountByLocation($location);
        }
        $this->json(["locations" => $counts]);
    }

    public function search(): void
    {
        $filters = [
            'location'       => $_GET['location'] ?? '',
            'check_in'       => $_GET['check_in'] ?? '',
            'check_out'      => $_GET['check_out'] ?? '',
            'rooms'          => $_GET['rooms'] ?? '',
            'min_price'      => $_GET['min_price'] ?? '',
            'max_price'      => $_GET['max_price'] ?? '',
            'rating'         => $_GET['rating'] ?? '',
            'travel_purpose' => $_GET['travel_purpose'] ?? '',
            'event'          => $_GET['event'] ?? '',
        ];

        $hotels = Hotel::search($filters);
        $this->json(["hotels" => $hotels]);
    }
}
