<?php
class Response {
    public static function json($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function error(string $message, int $statusCode = 400): void {
        self::json(["message" => $message], $statusCode);
    }

    public static function success(string $message, $data = [], int $statusCode = 200): void {
        $response = ["message" => $message];
        if (!empty($data)) {
            foreach ($data as $key => $value) {
                $response[$key] = $value;
            }
        }
        self::json($response, $statusCode);
    }
}
