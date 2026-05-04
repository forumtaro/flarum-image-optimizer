<?php

namespace Foumtaro\ImageOptimizer;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/extension.js'),
    
    new Extend\Locales(__DIR__.'/resources/locale'),
];
