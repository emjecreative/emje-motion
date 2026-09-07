<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls\BackgroundMotionControls;
use EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Frontend\BackgroundMotionFrontend;

/**
 * Background Motion module — ambient Container backgrounds.
 * Effects: ascii (v1) + aurora (name placeholder, spec later).
 */
final class BackgroundMotion implements ModuleInterface
{
    public function getId(): string
    {
        return 'background-motion';
    }

    public function register(): void
    {
        (new BackgroundMotionControls())->register();
        (new BackgroundMotionFrontend())->register();
    }
}
