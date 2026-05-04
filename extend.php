<?php

namespace Custom\ImageOptimizer;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/extension.js'),
    
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),
    
    new Extend\Locales(__DIR__.'/resources/locale'),
];
