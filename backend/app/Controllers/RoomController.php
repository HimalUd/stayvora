<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Room.php';
require_once __DIR__ . '/../Models/Hotel.php';

class RoomController extends Controller {
    private Room $roomModel;
    private Hotel $hotelModel;

    public function __construct() {
        parent::__construct();
        $this->roomModel = new Room();
        $this->hotelModel = new Hotel();
    }

    public function list(): void {
        $hotelId = $this->getQueryParam('hotel_id');
        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $rooms = $this->roomModel->getRoomsByHotel((int)$hotelId);
        $this->json(["rooms" => $rooms]);
    }

    public function create(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();

        $hotelId = $input['hotel_id'] ?? null;
        $roomType = trim($input['room_type'] ?? '');
        $price = $input['price'] ?? null;
        $capacity = $input['capacity'] ?? 2;
        $totalRooms = isset($input['total_rooms']) ? max(1, (int)$input['total_rooms']) : 1;
        $description = trim($input['description'] ?? '');

        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 422);
        }
        if (empty($roomType)) {
            $this->json(["message" => "Room type is required"], 422);
        }
        if (!$price || !is_numeric($price) || $price <= 0) {
            $this->json(["message" => "Valid price is required"], 422);
        }

        $hotel = $this->hotelModel->findById((int)$hotelId);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only add rooms to your own hotels"], 403);
        }

        $roomId = $this->roomModel->createRoom((int)$hotelId, [
            'room_type' => $roomType,
            'price' => $price,
            'capacity' => $capacity,
            'total_rooms' => $totalRooms,
            'description' => $description
        ]);

        $room = $this->roomModel->findById($roomId);
        $this->json(["message" => "Room created successfully", "room" => $room], 201);
    }

    public function update(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Room ID is required"], 400);
        }

        $room = $this->roomModel->getRoomWithOwner($id);
        if (!$room) {
            $this->json(["message" => "Room not found"], 404);
        }
        if ($room['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update rooms in your own hotels"], 403);
        }

        $fields = ['room_type', 'price', 'capacity', 'total_rooms', 'description', 'is_available'];
        $updates = [];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                if ($field === 'total_rooms') {
                    $updates[$field] = max(1, (int)$input[$field]);
                } else {
                    $updates[$field] = $input[$field];
                }
            }
        }

        if (empty($updates)) {
            $this->json(["message" => "No fields to update"], 422);
        }

        $this->roomModel->updateRoom($id, $updates);
        $room = $this->roomModel->findById($id);
        $this->json(["message" => "Room updated successfully", "room" => $room]);
    }

    public function availability(): void {
        $roomId = $this->getQueryParam('room_id');
        $checkIn = $this->getQueryParam('check_in');
        $checkOut = $this->getQueryParam('check_out');

        if (!$roomId || !is_numeric($roomId)) {
            $this->json(["message" => "Room ID is required"], 400);
        }

        $room = $this->roomModel->findById((int)$roomId);
        if (!$room) {
            $this->json(["message" => "Room not found"], 404);
        }

        $totalRooms = max(1, (int)($room['total_rooms'] ?? 1));

        if (empty($checkIn) || empty($checkOut)) {
            $this->json([
                "room_id" => (int)$roomId,
                "total_rooms" => $totalRooms,
                "available_rooms" => $room['is_available'] ? $totalRooms : 0,
                "capacity" => (int)$room['capacity'],
                "is_available" => (bool)$room['is_available']
            ]);
            return;
        }

        require_once __DIR__ . '/../Models/Booking.php';
        $bookingModel = new Booking();
        $availableRooms = $room['is_available'] ? $bookingModel->getAvailableRoomsCount((int)$roomId, $checkIn, $checkOut) : 0;

        $this->json([
            "room_id" => (int)$roomId,
            "total_rooms" => $totalRooms,
            "available_rooms" => $availableRooms,
            "capacity" => (int)$room['capacity'],
            "is_available" => $availableRooms > 0 && (bool)$room['is_available']
        ]);
    }

    public function delete(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Room ID is required"], 400);
        }

        $room = $this->roomModel->getRoomWithOwner($id);
        if (!$room) {
            $this->json(["message" => "Room not found"], 404);
        }
        if ($room['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only delete rooms in your own hotels"], 403);
        }

        $this->roomModel->deleteRoomWithBookings($id);
        $this->json(["message" => "Room deleted successfully"]);
    }
}
