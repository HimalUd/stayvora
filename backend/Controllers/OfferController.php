<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\SpecialOffer;
use App\Models\Hotel;

class OfferController extends Controller
{
    public function index(): void
    {
        $hotelId = (int)($_GET['hotel_id'] ?? 0);
        if ($hotelId <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $offers = SpecialOffer::where('hotel_id', $hotelId);
        $this->json(["offers" => array_map(fn($o) => $o->toArray(), $offers)]);
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

        $offer = new SpecialOffer([
            'hotel_id'    => $hotelId,
            'name'        => trim($input['name'] ?? ''),
            'description' => trim($input['description'] ?? ''),
            'discount'    => isset($input['discount']) ? (float)$input['discount'] : null,
            'valid_until' => $input['valid_until'] ?? null,
        ]);
        $offer->save();

        $this->success($offer->toArray(), "Offer created successfully", 201);
    }

    public function update(): void
    {
        AuthMiddleware::requireOwner();
        $input = $this->getInput();

        $id = (int)($input['id'] ?? 0);
        $offer = SpecialOffer::find($id);
        if (!$offer) {
            $this->error("Offer not found", 404);
        }

        $hotel = Hotel::find($offer->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $offer->fill([
            'name'        => trim($input['name'] ?? $offer->name),
            'description' => trim($input['description'] ?? $offer->description),
            'discount'    => isset($input['discount']) ? (float)$input['discount'] : $offer->discount,
            'valid_until' => $input['valid_until'] ?? $offer->valid_until,
        ]);
        $offer->save();

        $this->success($offer->toArray(), "Offer updated successfully");
    }

    public function destroy(): void
    {
        AuthMiddleware::requireOwner();
        $id = (int)($_GET['id'] ?? 0);

        $offer = SpecialOffer::find($id);
        if (!$offer) {
            $this->error("Offer not found", 404);
        }

        $hotel = Hotel::find($offer->hotel_id);
        if ($hotel->owner_id != AuthMiddleware::getUserId()) {
            $this->error("Unauthorized", 403);
        }

        $offer->delete();
        $this->success(null, "Offer deleted successfully");
    }
}
