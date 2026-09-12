<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Support;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\BackgroundMotion\BackgroundMotion;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\InteractionMotion;
use EmjeCreative\EmjeMotion\Modules\SmoothScroll\SmoothScroll;
use EmjeCreative\EmjeMotion\Modules\TextMotion\TextMotion;

/**
 * Single source of truth for the motion module list.
 *
 * Legacy HoverReveal + InteractiveCursor modules are retired; old pages
 * keep rendering through InteractionMotion's legacy fallback.
 */
final class ModuleRegistry
{
    /**
     * @return array<int, class-string<ModuleInterface>>
     */
    public static function classes(): array
    {
        return [
            TextMotion::class,
            SmoothScroll::class,
            InteractionMotion::class,
            BackgroundMotion::class,
        ];
    }
}
