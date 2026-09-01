<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Controls\InteractionMotionControls;

/**
 * Interaction Motion module — unified Container motion (Hover Reveal + Interactive Cursor).
 * Replaces HoverReveal & InteractiveCursor as single Interaction Motion with Effect select (no both, 1 effect per Container).
 */
final class InteractionMotion implements ModuleInterface
{
    public function getId(): string
    {
        return 'interaction-motion';
    }

    public function register(): void
    {
        (new InteractionMotionControls())->register();
        (new Frontend\InteractionMotionFrontend())->register();
    }
}
