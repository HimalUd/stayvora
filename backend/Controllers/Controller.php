<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\AuthMiddleware;
use App\Views\JsonView;

abstract class Controller
{
    protected \PDO $db;
    protected ?AuthMiddleware $auth;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->auth = new AuthMiddleware();
    }

    protected function json($data, int $status = 200): void
    {
        JsonView::render($data, $status);
    }

    protected function success($data = null, string $message = "Success", int $status = 200): void
    {
        JsonView::success($data, $message, $status);
    }

    protected function error(string $message, int $status = 400, $errors = null): void
    {
        JsonView::error($message, $status, $errors);
    }

    protected function getInput(): ?array
    {
        $input = json_decode(file_get_contents('php://input'), true);
        return $input ?: [];
    }

    protected function getQueryParams(): array
    {
        return $_GET;
    }
}
