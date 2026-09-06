<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractiveCursor;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\InteractiveCursor\Frontend\InteractiveCursorFrontend;

/**
 * Interactive Cursor module (legacy — frontend only for backward compat).
 */
final class InteractiveCursor implements ModuleInterface
{
    public function getId(): string
    {
        return 'interactive-cursor';
    }

    public function register(): void
    {
        (new InteractiveCursorFrontend())->register();
    }
}
