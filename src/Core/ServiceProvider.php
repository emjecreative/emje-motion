<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

abstract class ServiceProvider
{
    /**
     * Service container.
     */
    protected Container $container;

    /**
     * Constructor.
     */
    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * Register services.
     */
    abstract public function register(): void;
}
