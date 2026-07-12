<?php
namespace App\Controllers;

use App\Config\Session;
use App\Models\User;
use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\Event;
use App\Models\NearbyPlace;

class AuthController extends Controller
{
    public function register(): void
    {
        $input = $this->getInput();
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $phone = trim($input['phone'] ?? '');
        $role = trim($input['role'] ?? 'traveler');

        $errors = [];
        if (empty($name)) $errors[] = "Name is required";
        if (empty($email)) $errors[] = "Email is required";
        if (empty($password)) $errors[] = "Password is required";
        if (strlen($password) < 6) $errors[] = "Password must be at least 6 characters";
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
        if (!in_array($role, ['traveler', 'owner'])) $errors[] = "Role must be traveler or owner";

        if (!empty($errors)) {
            $this->error("Validation failed", 422, $errors);
        }

        if (User::findByEmail($email)) {
            $this->error("Email already registered", 409);
        }

        $user = User::createUser([
            'name'     => $name,
            'email'    => $email,
            'password' => $password,
            'phone'    => $phone,
            'role'     => $role,
        ]);

        Session::set([
            'user_id' => $user->getPrimaryKey(),
            'role'    => $role,
            'name'    => $name,
            'email'   => $email,
        ]);

        $this->success($user->toArray(), "Registration successful", 201);
    }

    public function registerOwner(): void
    {
        $input = $this->getInput();
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $phone = trim($input['phone'] ?? '');
        $hotelName = trim($input['hotelName'] ?? '');
        $description = trim($input['description'] ?? '');
        $address = trim($input['address'] ?? '');
        $location = trim(($input['city'] ?? '') . ', ' . ($input['country'] ?? ''), ', ');
        $rating = (float)($input['rating'] ?? 0);
        $amenities = trim($input['amenities'] ?? '');
        $events = $input['events'] ?? [];
        $destinations = $input['destinations'] ?? [];
        $images = $input['images'] ?? [];

        $errors = [];
        if (empty($name)) $errors[] = "Owner name is required";
        if (empty($email)) $errors[] = "Email is required";
        if (empty($password)) $errors[] = "Password is required";
        if (strlen($password) < 6) $errors[] = "Password must be at least 6 characters";
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
        if (empty($hotelName)) $errors[] = "Hotel name is required";

        if (!empty($errors)) {
            $this->error("Validation failed", 422, $errors);
        }

        if (User::findByEmail($email)) {
            $this->error("Email already registered", 409);
        }

        try {
            $this->db->beginTransaction();

            $user = User::createUser([
                'name'     => $name,
                'email'    => $email,
                'password' => $password,
                'phone'    => $phone,
                'role'     => 'owner',
            ]);

            $hotel = new Hotel([
                'owner_id'   => $user->getPrimaryKey(),
                'name'       => $hotelName,
                'description' => $description,
                'location'   => $location,
                'address'    => $address,
                'rating'     => $rating,
                'amenities'  => $amenities,
                'status'     => 'active',
            ]);
            $hotel->save();

            foreach ($images as $imageUrl) {
                $img = new HotelImage([
                    'hotel_id'  => $hotel->getPrimaryKey(),
                    'image_url' => trim($imageUrl),
                ]);
                $img->save();
            }

            foreach ($events as $event) {
                $ev = new Event([
                    'hotel_id'    => $hotel->getPrimaryKey(),
                    'name'        => trim($event['name'] ?? ''),
                    'description' => trim($event['description'] ?? ''),
                    'event_date'  => $event['date'] ?? null,
                ]);
                $ev->save();
            }

            foreach ($destinations as $place) {
                $pl = new NearbyPlace([
                    'hotel_id'    => $hotel->getPrimaryKey(),
                    'name'        => trim($place['name'] ?? ''),
                    'description' => trim($place['description'] ?? ''),
                    'distance'    => trim($place['distance'] ?? ''),
                ]);
                $pl->save();
            }

            $this->db->commit();

            Session::set([
                'user_id' => $user->getPrimaryKey(),
                'role'    => 'owner',
                'name'    => $name,
                'email'   => $email,
            ]);

            $hotelData = $hotel->toArray();
            $hotelData['images'] = array_map(fn($i) => $i->image_url, $hotel->images());

            $this->success([
                'user'  => $user->toArray(),
                'hotel' => $hotelData,
            ], "Hotel owner registration successful", 201);

        } catch (\Exception $e) {
            $this->db->rollBack();
            $this->error("Registration failed: " . $e->getMessage(), 500);
        }
    }

    public function login(): void
    {
        $input = $this->getInput();
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            $this->error("Email and password are required", 422);
        }

        $user = User::findByEmail($email);
        if (!$user || !$user->verifyPassword($password)) {
            $this->error("Invalid email or password", 401);
        }

        Session::set([
            'user_id' => $user->getPrimaryKey(),
            'role'    => $user->role,
            'name'    => $user->name,
            'email'   => $user->email,
        ]);

        $this->success($user->toArray(), "Login successful");
    }

    public function logout(): void
    {
        Session::destroy();
        $this->success(null, "Logged out successfully");
    }

    public function checkSession(): void
    {
        if (!Session::isLoggedIn()) {
            $this->json(["logged_in" => false]);
            return;
        }

        $user = User::find(Session::getUserId());
        if (!$user) {
            Session::destroy();
            $this->json(["logged_in" => false]);
            return;
        }

        $this->json([
            "logged_in" => true,
            "user"      => $user->toArray(),
        ]);
    }
}
