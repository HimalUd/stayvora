<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\NearbyPlace;
use App\Models\Hotel;

class PlaceController extends Controller
{
    public function index(): void
    {
        $hotelId = (int)($_GET['hotel_id'] ?? 0);
        if ($hotelId <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $places = NearbyPlace::where('hotel_id', $hotelId);
        $this->json(["places" => array_map(fn($p) => $p->toArray(), $places)]);
    }

    public function store(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $hotelId = (int)($input['hotel_id'] ?? 0);
        $hotel = Hotel::find($hotelId);
        if (!$hotel || $hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $place = new NearbyPlace([
            'hotel_id'    => $hotelId,
            'name'        => trim($input['name'] ?? ''),
            'description' => trim($input['description'] ?? ''),
            'distance'    => trim($input['distance'] ?? ''),
            'category'    => trim($input['category'] ?? ''),
        ]);
        $place->save();

        $this->success($place->toArray(), "Place created successfully", 201);
    }

    public function update(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $id = (int)($input['id'] ?? 0);
        $place = NearbyPlace::find($id);
        if (!$place) {
            $this->error("Place not found", 404);
        }

        $hotel = Hotel::find($place->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $place->fill([
            'name'        => trim($input['name'] ?? $place->name),
            'description' => trim($input['description'] ?? $place->description),
            'distance'    => trim($input['distance'] ?? $place->distance),
            'category'    => trim($input['category'] ?? $place->category),
        ]);
        $place->save();

        $this->success($place->toArray(), "Place updated successfully");
    }

    public function destroy(): void
    {
        AuthMiddleware::requireOwner();
        $id = (int)($_GET['id'] ?? 0);

        $place = NearbyPlace::find($id);
        if (!$place) {
            $this->error("Place not found", 404);
        }

        $hotel = Hotel::find($place->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $place->delete();
        $this->success(null, "Place deleted successfully");
    }
}
