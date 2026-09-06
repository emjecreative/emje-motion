<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\HoverReveal;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\HoverReveal\Frontend\HoverRevealFrontend;

/**
 * Hover Reveal module (legacy — frontend only for backward compat).
 */
final class HoverReveal implements ModuleInterface
{
    public function getId(): string
    {
        return 'hover-reveal';
    }

    public function register(): void
    {
        (new HoverRevealFrontend())->register();
    }
}
