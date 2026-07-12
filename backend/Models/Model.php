<?php
namespace App\Models;

use App\Config\Database;

abstract class Model
{
    protected static string $table;
    protected static string $primaryKey = 'id';
    protected \PDO $db;
    protected array $attributes = [];
    protected array $original = [];
    protected bool $exists = false;

    public function __construct(?array $data = null)
    {
        $this->db = Database::getInstance()->getConnection();
        if ($data) {
            $this->fill($data);
            $this->original = $this->attributes;
            if (isset($data[static::$primaryKey])) {
                $this->exists = true;
            }
        }
    }

    public function __get(string $name)
    {
        return $this->attributes[$name] ?? null;
    }

    public function __set(string $name, $value): void
    {
        $this->attributes[$name] = $value;
    }

    public function fill(array $data): void
    {
        foreach ($data as $key => $value) {
            $this->attributes[$key] = $value;
        }
    }

    public function toArray(): array
    {
        return $this->attributes;
    }

    public static function all(): array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM " . static::$table . " ORDER BY created_at DESC");
        return array_map(fn($row) => new static($row), $stmt->fetchAll());
    }

    public static function find($id): ?static
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE " . static::$primaryKey . " = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? new static($row) : null;
    }

    public static function where(string $column, $value): array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE {$column} = ? ORDER BY created_at DESC");
        $stmt->execute([$value]);
        return array_map(fn($row) => new static($row), $stmt->fetchAll());
    }

    public static function firstWhere(string $column, $value): ?static
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE {$column} = ? LIMIT 1");
        $stmt->execute([$value]);
        $row = $stmt->fetch();
        return $row ? new static($row) : null;
    }

    public static function raw(string $sql, array $params = []): array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function rawOne(string $sql, array $params = []): ?array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function save(): bool
    {
        if ($this->exists) {
            return $this->update();
        }
        return $this->insert();
    }

    protected function insert(): bool
    {
        $columns = array_keys($this->attributes);
        $placeholders = rtrim(str_repeat('?,', count($columns)), ',');
        $sql = "INSERT INTO " . static::$table . " (" . implode(',', $columns) . ") VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute(array_values($this->attributes));
        if ($result) {
            $this->attributes[static::$primaryKey] = (int)$this->db->lastInsertId();
            $this->exists = true;
            $this->original = $this->attributes;
        }
        return $result;
    }

    protected function update(): bool
    {
        $columns = array_keys($this->attributes);
        $sets = implode('=?,', $columns) . '=?';
        $sql = "UPDATE " . static::$table . " SET {$sets} WHERE " . static::$primaryKey . " = ?";
        $values = array_values($this->attributes);
        $values[] = $this->original[static::$primaryKey];
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute($values);
        if ($result) {
            $this->original = $this->attributes;
        }
        return $result;
    }

    public function delete(): bool
    {
        if (!$this->exists) return false;
        $stmt = $this->db->prepare("DELETE FROM " . static::$table . " WHERE " . static::$primaryKey . " = ?");
        return $stmt->execute([$this->original[static::$primaryKey]]);
    }

    public function exists(): bool
    {
        return $this->exists;
    }

    public function getPrimaryKey()
    {
        return $this->attributes[static::$primaryKey] ?? null;
    }
}
