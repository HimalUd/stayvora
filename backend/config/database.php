<?php
if (!class_exists('Database')) {
    class Database {
        private static ?Database $instance = null;
        private ?PDO $conn = null;
        private string $host;
        private string $db_name;
        private string $username;
        private string $password;

        public function __construct() {
            $this->host = getenv('DB_HOST') ?: 'localhost';
            $this->db_name = getenv('DB_NAME') ?: 'stayvora';
            $this->username = getenv('DB_USER') ?: 'root';
            $this->password = getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : '';
        }

        public static function getInstance(): Database {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance;
        }

        public function getConnection(): PDO {
            if ($this->conn === null) {
                try {
                    $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
                    $this->conn = new PDO($dsn, $this->username, $this->password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]);
                } catch(PDOException $e) {
                    http_response_code(500);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Database connection error: " . $e->getMessage()
                    ]);
                    exit;
                }
            }
            return $this->conn;
        }
    }
}

