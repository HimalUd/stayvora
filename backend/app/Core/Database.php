<?php
class Database {
    private static ?Database $instance = null;
    private ?PDO $conn = null;
    private string $host = "localhost";
    private string $db_name = "stayvora";
    private string $username = "root";
    private string $password = "";

    private function __construct() {}

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Database connection error"]);
                exit;
            }
        }
        return $this->conn;
    }
}
