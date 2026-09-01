<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\TextMotion\Controls\TextMotionControls;
use EmjeCreative\EmjeMotion\Modules\TextMotion\Frontend\TextMotionFrontend;

/**
 * Text Motion module.
 */
final class TextMotion implements ModuleInterface
{
    public function getId(): string
    {
        return 'text-motion';
    }

    /**
     * Register the module.
     */
    public function register(): void
    {
        (new TextMotionControls())->register();
        (new TextMotionFrontend())->register();
    }
}
