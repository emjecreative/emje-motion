<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use InvalidArgumentException;

/**
 * Simple dependency injection container.
 */
final class Container
{
    /**
     * Registered services.
     *
     * @var array<string, callable>
     */
    private array $bindings = [];

    /**
     * Resolved instances.
     *
     * @var array<string, object>
     */
    private array $instances = [];

    /**
     * Register a service.
     */
    public function set(string $id, callable $factory): void
    {
        $this->bindings[ $id ] = $factory;
    }

    /**
     * Resolve a service.
     *
     * @template T of object
     *
     * @param class-string<T> $id
     *
     * @return T
     */
    public function get(string $id): object
    {
        if (isset($this->instances[ $id ])) {
            /** @var T $cached */
            $cached = $this->instances[ $id ];

            return $cached;
        }

        if (! isset($this->bindings[ $id ])) {
            throw new InvalidArgumentException(
                sprintf('Service [%s] is not registered.', $id),
            );
        }

        /** @var T $service */
        $service = ($this->bindings[ $id ])();

        return $this->instances[ $id ] = $service;
    }
}
