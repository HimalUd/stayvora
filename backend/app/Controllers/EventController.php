<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Event.php';
require_once __DIR__ . '/../Models/Hotel.php';

class EventController extends Controller {
    private Event $eventModel;
    private Hotel $hotelModel;

    public function __construct() {
        parent::__construct();
        $this->eventModel = new Event();
        $this->hotelModel = new Hotel();
    }

    public function list(): void {
        $hotelId = $this->getQueryParam('hotel_id');
        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $events = $this->eventModel->getEventsByHotel((int)$hotelId);
        $this->json(["events" => $events]);
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
            $this->json(["message" => "Event name is required"], 422);
        }

        $hotel = $this->hotelModel->findById((int)$hotelId);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only add events to your own hotels"], 403);
        }

        $eventId = $this->eventModel->createEvent((int)$hotelId, $input);
        $event = $this->eventModel->findById($eventId);
        $this->json(["message" => "Event created successfully", "event" => $event], 201);
    }

    public function update(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Event ID is required"], 400);
        }

        $event = $this->eventModel->getEventWithOwner($id);
        if (!$event) {
            $this->json(["message" => "Event not found"], 404);
        }
        if ($event['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update events in your own hotels"], 403);
        }

        $fields = ['name', 'description', 'event_date', 'price'];
        $updates = [];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[$field] = $input[$field];
            }
        }

        if (empty($updates)) {
            $this->json(["message" => "No fields to update"], 422);
        }

        $this->eventModel->updateEvent($id, $updates);
        $event = $this->eventModel->findById($id);
        $this->json(["message" => "Event updated successfully", "event" => $event]);
    }

    public function delete(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Event ID is required"], 400);
        }

        $event = $this->eventModel->getEventWithOwner($id);
        if (!$event) {
            $this->json(["message" => "Event not found"], 404);
        }
        if ($event['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only delete events in your own hotels"], 403);
        }

        $this->eventModel->delete($id);
        $this->json(["message" => "Event deleted successfully"]);
    }
}
