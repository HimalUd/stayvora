<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/SpecialOffer.php';
require_once __DIR__ . '/../Models/Hotel.php';

class OfferController extends Controller {
    private SpecialOffer $offerModel;
    private Hotel $hotelModel;

    public function __construct() {
        parent::__construct();
        $this->offerModel = new SpecialOffer();
        $this->hotelModel = new Hotel();
    }

    public function list(): void {
        $hotelId = $this->getQueryParam('hotel_id');
        if (!$hotelId || !is_numeric($hotelId)) {
            $this->json(["message" => "Hotel ID is required"], 400);
        }

        $offers = $this->offerModel->getOffersByHotel((int)$hotelId);
        $this->json(["offers" => $offers]);
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
            $this->json(["message" => "Offer name is required"], 422);
        }

        $hotel = $this->hotelModel->findById((int)$hotelId);
        if (!$hotel) {
            $this->json(["message" => "Hotel not found"], 404);
        }
        if ($hotel['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only add offers to your own hotels"], 403);
        }

        $offerId = $this->offerModel->createOffer((int)$hotelId, $input);
        $offer = $this->offerModel->findById($offerId);
        $this->json(["message" => "Offer created successfully", "offer" => $offer], 201);
    }

    public function update(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Offer ID is required"], 400);
        }

        $offer = $this->offerModel->getOfferWithOwner($id);
        if (!$offer) {
            $this->json(["message" => "Offer not found"], 404);
        }
        if ($offer['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only update offers in your own hotels"], 403);
        }

        $fields = ['name', 'description', 'discount', 'valid_until'];
        $updates = [];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[$field] = $input[$field];
            }
        }

        if (empty($updates)) {
            $this->json(["message" => "No fields to update"], 422);
        }

        $this->offerModel->updateOffer($id, $updates);
        $offer = $this->offerModel->findById($id);
        $this->json(["message" => "Offer updated successfully", "offer" => $offer]);
    }

    public function delete(): void {
        $this->requireOwner();
        $input = $this->getJsonInput();
        $id = $this->getNumericId();

        if (!$id) {
            $this->json(["message" => "Offer ID is required"], 400);
        }

        $offer = $this->offerModel->getOfferWithOwner($id);
        if (!$offer) {
            $this->json(["message" => "Offer not found"], 404);
        }
        if ($offer['owner_id'] != $this->getUserId()) {
            $this->json(["message" => "You can only delete offers in your own hotels"], 403);
        }

        $this->offerModel->delete($id);
        $this->json(["message" => "Offer deleted successfully"]);
    }
}
