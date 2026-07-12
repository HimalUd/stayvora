<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\Event;
use App\Models\Hotel;

class EventController extends Controller
{
    public function index(): void
    {
        $hotelId = (int)($_GET['hotel_id'] ?? 0);
        if ($hotelId <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $events = Event::where('hotel_id', $hotelId);
        $this->json(["events" => array_map(fn($e) => $e->toArray(), $events)]);
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

        $event = new Event([
            'hotel_id'    => $hotelId,
            'name'        => trim($input['name'] ?? ''),
            'description' => trim($input['description'] ?? ''),
            'event_date'  => $input['event_date'] ?? null,
            'price'       => isset($input['price']) ? (float)$input['price'] : null,
        ]);
        $event->save();

        $this->success($event->toArray(), "Event created successfully", 201);
    }

    public function update(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $id = (int)($input['id'] ?? 0);
        $event = Event::find($id);
        if (!$event) {
            $this->error("Event not found", 404);
        }

        $hotel = Hotel::find($event->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $event->fill([
            'name'        => trim($input['name'] ?? $event->name),
            'description' => trim($input['description'] ?? $event->description),
            'event_date'  => $input['event_date'] ?? $event->event_date,
            'price'       => isset($input['price']) ? (float)$input['price'] : $event->price,
        ]);
        $event->save();

        $this->success($event->toArray(), "Event updated successfully");
    }

    public function destroy(): void
    {
        AuthMiddleware::requireOwner();
        $id = (int)($_GET['id'] ?? 0);

        $event = Event::find($id);
        if (!$event) {
            $this->error("Event not found", 404);
        }

        $hotel = Hotel::find($event->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $event->delete();
        $this->success(null, "Event deleted successfully");
    }
}
