<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

final class Container
{
    /**
     * Registered services.
     *
     * @var array<string, object>
     */
    private array $services = [];

    /**
     * Register a service.
     */
    public function set(string $id, object $service): void
    {
        $this->services[$id] = $service;
    }

    /**
     * Get a registered service.
     */
    public function get(string $id): ?object
    {
        return $this->services[$id] ?? null;
    }

    /**
     * Check whether a service exists.
     */
    public function has(string $id): bool
    {
        return isset($this->services[$id]);
    }
}
