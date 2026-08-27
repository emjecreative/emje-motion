<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\HoverReveal;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\HoverReveal\Controls\HoverRevealControls;
use EmjeCreative\EmjeMotion\Modules\HoverReveal\Frontend\HoverRevealFrontend;

/**
 * Hover Reveal module.
 */
final class HoverReveal implements ModuleInterface
{
    public function getId(): string
    {
        return 'hover-reveal';
    }

    public function register(): void
    {
        (new HoverRevealControls())->register();
        (new HoverRevealFrontend())->register();
    }
}
