<?php

namespace Foumtaro\ImageOptimizer;

use Flarum\Extend;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Event\Serializing;
use Flarum\Frontend\Document;

return [
    // Частина 1: Додаємо firstPostImage у відповідь API
    (new Extend\Event())
        ->listen(Serializing::class, function (Serializing $event) {
            if ($event->serializer instanceof DiscussionSerializer) {
                $discussion = $event->model;
                $firstPost = $discussion->firstPost;

                if ($firstPost && $firstPost->content) {
                    preg_match('/<img[^>]+src="([^">]+)"/', $firstPost->content, $matches);

                    if (!empty($matches[1])) {
                        $event->attributes['firstPostImage'] = $matches[1];
                    }
                }
            }
        }),

    // Частина 2: Підключаємо скомпільований JS
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    // Частина 3: CSS (опціонально)
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<style>
                .DiscussionListItem-author .Avatar.has-discussion-image {
                    background-size: cover !important;
                    background-position: center !important;
                    border-radius: 100% !important;
                    display: block !important;
                    width: 32px !important;
                    height: 32px !important;
                }
            </style>';
        }),
];
