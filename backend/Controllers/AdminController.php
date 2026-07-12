<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Models\Hotel;

class AdminController extends Controller
{
    public function hotels(): void
    {
        AuthMiddleware::requireAdmin();
        $hotels = Hotel::getAllWithOwners();
        $this->json(["hotels" => $hotels]);
    }

    public function deleteHotel(): void
    {
        AuthMiddleware::requireAdmin();
        $id = (int)($_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->error("Hotel ID is required", 400);
        }

        $hotel = Hotel::find($id);
        if (!$hotel) {
            $this->error("Hotel not found", 404);
        }

        $hotel->delete();
        $this->success(null, "Hotel deleted successfully");
    }
}
