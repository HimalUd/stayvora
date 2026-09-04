<?php
class Request {
    private array $body;
    private array $query;
    private array $files;
    private string $method;
    private string $uri;

    public function __construct() {
        $this->body = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->query = $_GET;
        $this->files = $_FILES;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri = $_SERVER['REQUEST_URI'];
    }

    public function getBody(): array {
        return $this->body;
    }

    public function get(string $key, $default = null) {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }

    public function getQuery(string $key, $default = null) {
        return $this->query[$key] ?? $default;
    }

    public function getMethod(): string {
        return $this->method;
    }

    public function getUri(): string {
        return $this->uri;
    }

    public function getFile(string $key) {
        return $this->files[$key] ?? null;
    }
}
