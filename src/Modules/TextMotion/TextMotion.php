<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;
use EmjeCreative\EmjeMotion\Modules\TextMotion\Controls\TextMotionControls;

/**
 * Text Motion module.
 */
final class TextMotion implements ModuleInterface
{
    /**
     * Register the module.
     */
    public function register(): void
    {
		(new TextMotionControls())->register();
    }
}
