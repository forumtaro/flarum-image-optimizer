import { extend } from 'flarum/common/extend';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Avatar from 'flarum/common/components/Avatar';
import Discussion from 'flarum/common/models/Discussion';

// Додаємо атрибут firstPostImage до моделі дискусії
Discussion.prototype.firstPostImage = Discussion.prototype.attribute('firstPostImage');

// Розширюємо DiscussionListItem
extend(DiscussionListItem.prototype, 'view', function(vdom) {
  const discussion = this.attrs.discussion;
  const imageUrl = discussion.firstPostImage();

  if (imageUrl) {
    const optimizedUrl = getOptimizedUrl(imageUrl);
    
    // Знаходимо аватар у вже згенерованому vdom
    if (vdom && vdom.children) {
      const authorSection = vdom.children.find(child => child && child.attrs && child.attrs.className && child.attrs.className.includes('DiscussionListItem-author'));
      
      if (authorSection && authorSection.children) {
        const avatarIndex = authorSection.children.findIndex(child => child && child.tag === Avatar);
        
        if (avatarIndex !== -1) {
          // Замінюємо Avatar на наш div із зображенням
          authorSection.children[avatarIndex] = m('div', {
            className: 'Avatar has-discussion-image',
            style: {
              backgroundImage: `url(${optimizedUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '100%',
              display: 'block',
              width: '32px',
              height: '32px'
            }
          });
        }
      }
    }
  }
});

// Функція оптимізації URL
function getOptimizedUrl(url) {
  if (!url) return null;
  if (url.endsWith('.webp')) return url;
  if (url.includes('wsrv.nl')) return url;
  return 'https://wsrv.nl/?url=' + encodeURIComponent(url) + '&output=webp&q=75&w=40&h=40&fit=cover';
}
