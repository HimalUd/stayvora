<?php
namespace App\Models;

class User extends Model
{
    protected static string $table = 'users';
    protected static string $primaryKey = 'id';

    public function hotels(): array
    {
        return Hotel::where('owner_id', $this->getPrimaryKey());
    }

    public function bookings(): array
    {
        return Booking::where('user_id', $this->getPrimaryKey());
    }

    public static function findByEmail(string $email): ?self
    {
        return self::firstWhere('email', $email);
    }

    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->attributes['password_hash']);
    }

    public static function createUser(array $data): self
    {
        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        unset($data['password']);
        $user = new self($data);
        $user->save();
        return $user;
    }
}
