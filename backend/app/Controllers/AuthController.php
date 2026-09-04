<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../../utils/email.php';

class AuthController extends Controller {
    private User $userModel;

    public function __construct() {
        parent::__construct();
        $this->userModel = new User();
    }

    private function generateVerificationCode(): string {
        return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function register(): void {
        $input = $this->getJsonInput();
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $phone = trim($input['phone'] ?? '');
        $role = trim($input['role'] ?? 'traveler');

        $errors = [];
        if (empty($name)) $errors[] = "Name is required";
        if (empty($email)) $errors[] = "Email is required";
        if (empty($password)) $errors[] = "Password is required";
        if (strlen($password) < 8) $errors[] = "Password must be at least 8 characters";
        if (!preg_match('/[A-Z]/', $password)) $errors[] = "Password must include an uppercase letter";
        if (!preg_match('/[a-z]/', $password)) $errors[] = "Password must include a lowercase letter";
        if (!preg_match('/\d/', $password)) $errors[] = "Password must include a number";
        if (!preg_match('/[^A-Za-z0-9]/', $password)) $errors[] = "Password must include a special character";
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
        if (empty($phone)) $errors[] = "Phone number is required";
        if (!preg_match('/^\+94\d{9}$/', preg_replace('/[\s-]/', '', $phone))) $errors[] = "Phone must be a Sri Lanka number in +94 format, e.g. +94 77 123 4567";
        if (!in_array($role, ['traveler', 'owner'])) $errors[] = "Role must be traveler or owner";

        if (!empty($errors)) {
            $this->json(["message" => "Validation failed", "errors" => $errors], 422);
        }

        if ($this->userModel->emailExists($email)) {
            $this->json(["message" => "Email already registered"], 409);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $userId = $this->userModel->createUser($name, $email, $passwordHash, $phone, $role);
        $this->userModel->markEmailVerified($userId);

        $user = $this->userModel->getUserById($userId);
        unset($user['password_hash']);
        unset($user['verification_code']);

        try {
            sendRegistrationEmail($email, $name);
        } catch (Exception $e) {
        }

        $this->json(["message" => "Registration successful. Please login.", "user" => $user], 201);
    }

    public function sendVerification(): void {
        $this->requireLogin();
        $userId = $this->getUserId();
        $user = $this->userModel->getUserById($userId);

        if (!$user) {
            $this->json(["message" => "User not found"], 404);
        }
        if ($this->userModel->isEmailVerified($userId)) {
            $this->json(["message" => "Email already verified"], 400);
        }

        $verificationCode = $this->generateVerificationCode();
        $this->userModel->setVerificationCode($userId, $verificationCode);

        try {
            sendVerificationCode($user['email'], $verificationCode);
        } catch (Exception $e) {
        }

        $this->json(["message" => "Verification code sent"]);
    }

    public function verifyEmail(): void {
        $this->requireLogin();
        $input = $this->getJsonInput();
        $code = trim((string)($input['code'] ?? ''));

        if (empty($code)) {
            $this->json(["message" => "Verification code is required"], 422);
        }

        $userId = $this->getUserId();
        $user = $this->userModel->getUserById($userId);

        if (!$user) {
            $this->json(["message" => "User not found"], 404);
        }
        if ($this->userModel->isEmailVerified($userId)) {
            $this->json(["message" => "Email already verified"], 400);
        }
        if (!hash_equals((string)($user['verification_code'] ?? ''), $code)) {
            $this->json(["message" => "Invalid verification code"], 400);
        }

        $this->userModel->markEmailVerified($userId);

        $updated = $this->userModel->getUserById($userId);
        unset($updated['password_hash']);
        unset($updated['verification_code']);

        $this->json(["message" => "Email verified successfully", "user" => $updated]);
    }

    public function login(): void {
        $input = $this->getJsonInput();
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            $this->json(["message" => "Email and password are required"], 422);
        }

        $user = $this->userModel->findByEmail($email);

        if (!$user || !$this->userModel->verifyPassword($password, $user['password_hash'])) {
            $this->json(["message" => "Invalid email or password"], 401);
        }

        if (isset($user['is_active']) && !(int)$user['is_active']) {
            $this->json(["message" => "Your account has been deactivated. Please contact support."], 403);
        }

        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['email'] = $user['email'];

        try {
            sendLoginAlertEmail($user['email'], $user['name']);
        } catch (Exception $e) {
        }

        unset($user['password_hash']);
        unset($user['verification_code']);
        $this->json(["message" => "Login successful", "user" => $user]);
    }

    public function logout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        $this->json(["message" => "Logged out successfully"]);
    }

    public function checkSession(): void {
        if (!$this->isLoggedIn()) {
            $this->json(["message" => "Not authenticated"], 401);
        }

        $user = $this->userModel->getUserById($this->getUserId());
        if (!$user) {
            session_destroy();
            $this->json(["message" => "User not found"], 401);
        }

        if (isset($user['is_active']) && !(int)$user['is_active']) {
            session_destroy();
            $this->json(["message" => "Your account has been deactivated"], 401);
        }

        unset($user['password_hash']);
        unset($user['verification_code']);
        $this->json(["user" => $user]);
    }
}
