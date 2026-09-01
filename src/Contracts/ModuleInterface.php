<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Contracts;

/**
 * Defines the contract for all plugin modules.
 */
interface ModuleInterface
{
    /**
     * Get module ID.
     */
    public function getId(): string;

    /**
     * Register the module.
     */
    public function register(): void;
}
