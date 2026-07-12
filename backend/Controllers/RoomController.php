<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\Hotel;
use App\Models\Room;

class RoomController extends Controller
{
    public function index(): void
    {
        $hotelId = (int)($_GET['hotel_id'] ?? 0);
        if ($hotelId <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $rooms = Room::where('hotel_id', $hotelId);
        $this->json(["rooms" => array_map(fn($r) => $r->toArray(), $rooms)]);
    }

    public function store(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $hotelId = (int)($input['hotel_id'] ?? 0);
        $hotel = Hotel::find($hotelId);

        if (!$hotel) {
            $this->error("Hotel not found", 404);
        }
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $room = new Room([
            'hotel_id'     => $hotelId,
            'room_type'    => trim($input['room_type'] ?? ''),
            'price'        => (float)($input['price'] ?? 0),
            'capacity'     => (int)($input['capacity'] ?? 2),
            'description'  => trim($input['description'] ?? ''),
            'is_available' => $input['is_available'] ?? true,
        ]);
        $room->save();

        $this->success($room->toArray(), "Room created successfully", 201);
    }

    public function update(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $id = (int)($input['id'] ?? 0);
        $room = Room::find($id);

        if (!$room) {
            $this->error("Room not found", 404);
        }

        $hotel = Hotel::find($room->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $room->fill([
            'room_type'    => trim($input['room_type'] ?? $room->room_type),
            'price'        => (float)($input['price'] ?? $room->price),
            'capacity'     => (int)($input['capacity'] ?? $room->capacity),
            'description'  => trim($input['description'] ?? $room->description),
            'is_available' => $input['is_available'] ?? $room->is_available,
        ]);
        $room->save();

        $this->success($room->toArray(), "Room updated successfully");
    }

    public function destroy(): void
    {
        AuthMiddleware::requireOwner();
        $id = (int)($_GET['id'] ?? 0);

        $room = Room::find($id);
        if (!$room) {
            $this->error("Room not found", 404);
        }

        $hotel = Hotel::find($room->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $room->delete();
        $this->success(null, "Room deleted successfully");
    }
}
