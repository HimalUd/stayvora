<?php
class Model {
    protected static ?PDO $db = null;
    protected string $table;
    protected string $primaryKey = 'id';

    protected static function getDB(): PDO {
        if (self::$db === null) {
            self::$db = Database::getInstance()->getConnection();
        }
        return self::$db;
    }

    public function __construct() {
        self::getDB();
    }

    public function findById(int $id): ?array {
        $stmt = self::$db->prepare("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findAll(?string $orderBy = null): array {
        $sql = "SELECT * FROM {$this->table}";
        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy}";
        }
        $stmt = self::$db->query($sql);
        return $stmt->fetchAll();
    }

    public function findBy(string $column, $value, ?string $orderBy = null): array {
        $sql = "SELECT * FROM {$this->table} WHERE {$column} = ?";
        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy}";
        }
        $stmt = self::$db->prepare($sql);
        $stmt->execute([$value]);
        return $stmt->fetchAll();
    }

    public function findOneBy(string $column, $value): ?array {
        $stmt = self::$db->prepare("SELECT * FROM {$this->table} WHERE {$column} = ? LIMIT 1");
        $stmt->execute([$value]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int {
        $columns = implode(", ", array_keys($data));
        $placeholders = implode(", ", array_fill(0, count($data), "?"));
        $stmt = self::$db->prepare("INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})");
        $stmt->execute(array_values($data));
        return (int)self::$db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $sets = implode(", ", array_map(fn($col) => "{$col} = ?", array_keys($data)));
        $params = array_values($data);
        $params[] = $id;
        $stmt = self::$db->prepare("UPDATE {$this->table} SET {$sets} WHERE {$this->primaryKey} = ?");
        return $stmt->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = self::$db->prepare("DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?");
        return $stmt->execute([$id]);
    }

    public function deleteBy(string $column, $value): bool {
        $stmt = self::$db->prepare("DELETE FROM {$this->table} WHERE {$column} = ?");
        return $stmt->execute([$value]);
    }

    public function countBy(string $column, $value): int {
        $stmt = self::$db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE {$column} = ?");
        $stmt->execute([$value]);
        return (int)$stmt->fetch()['count'];
    }

    public function beginTransaction(): void {
        self::$db->beginTransaction();
    }

    public function commit(): void {
        self::$db->commit();
    }

    public function rollBack(): void {
        if (self::$db->inTransaction()) {
            self::$db->rollBack();
        }
    }

    public function query(string $sql, array $params = []): PDOStatement {
        $stmt = self::$db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll(string $sql, array $params = []): array {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetchOne(string $sql, array $params = []): ?array {
        $result = $this->query($sql, $params)->fetch();
        return $result ?: null;
    }

    public function getLastInsertId(): int {
        return (int)self::$db->lastInsertId();
    }
}
