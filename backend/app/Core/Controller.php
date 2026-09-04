<?php
class Controller {
    protected Request $request;

    public function __construct() {
        $this->request = new Request();
    }

    protected function json($data, int $statusCode = 200): void {
        Response::json($data, $statusCode);
    }

    protected function error(string $message, int $statusCode = 400): void {
        Response::error($message, $statusCode);
    }

    protected function getJsonInput(): array {
        return $this->request->getBody();
    }

    protected function getParam(string $key, $default = null) {
        return $this->request->get($key, $default);
    }

    protected function getQueryParam(string $key, $default = null) {
        return $this->request->getQuery($key, $default);
    }

    protected function isLoggedIn(): bool {
        return isset($_SESSION['user_id']);
    }

    protected function requireLogin(): void {
        if (!$this->isLoggedIn()) {
            $this->error("Unauthorized. Please login first.", 401);
        }

        require_once __DIR__ . '/../Models/User.php';
        $userModel = new User();
        $user = $userModel->findById((int)$_SESSION['user_id']);
        if (!$user || (isset($user['is_active']) && !(int)$user['is_active'])) {
            session_destroy();
            $this->error("Your account has been deactivated. Please login.", 401);
        }
    }

    protected function isOwner(): bool {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'owner';
    }

    protected function requireOwner(): void {
        $this->requireLogin();
        if (!$this->isOwner()) {
            $this->error("Access denied. Owner role required.", 403);
        }
    }

    protected function isAdmin(): bool {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
    }

    protected function requireAdmin(): void {
        $this->requireLogin();
        if (!$this->isAdmin()) {
            $this->error("Access denied. Admin role required.", 403);
        }
    }

    protected function getUserId(): ?int {
        return $_SESSION['user_id'] ?? null;
    }

    protected function getUserRole(): ?string {
        return $_SESSION['role'] ?? null;
    }

    protected function getNumericId(): ?int {
        $id = $this->getParam('id');
        return ($id && is_numeric($id)) ? (int)$id : null;
    }
}
