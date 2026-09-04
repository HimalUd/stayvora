<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Notification.php';

class NotificationController extends Controller {
    private Notification $notificationModel;

    public function __construct() {
        parent::__construct();
        $this->notificationModel = new Notification();
    }

    public function list(): void {
        $this->requireLogin();
        $notifications = $this->notificationModel->getForUser($this->getUserId());
        $unread = $this->notificationModel->getUnreadCount($this->getUserId());
        $this->json([
            "notifications" => $notifications,
            "unread" => $unread,
        ]);
    }

    public function markRead(): void {
        $this->requireLogin();
        $input = $this->getJsonInput();
        $id = $input['id'] ?? null;

        if ($id) {
            if (!is_numeric($id)) {
                $this->error("Invalid notification id", 400);
            }
            $this->notificationModel->markRead((int)$id, $this->getUserId());
        } else {
            $this->notificationModel->markAllRead($this->getUserId());
        }

        $this->json(["message" => "Notification(s) marked as read"]);
    }
}