import { Page } from '../common/types';
import cleaner from 'clean-html';

export const cleanHtml = (page: Page): Promise<Page> =>
  new Promise((resolve, reject) => {
    if (page.source?.meta?.noFormat) {
      resolve(page);
    } else {
      try {
        cleaner.clean(
          page.htmlContent,
          {
            indent: '  ',
            'break-around-tags': [
              'body',
              'blockquote',
              'br',
              'div',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'head',
              'hr',
              'pre',
              'ul',
              'li',
              'link',
              'meta',
              'p',
              'table',
              'title',
              'td',
              'tr',
            ],
          },
          (htmlContent) => {
            resolve({ ...page, htmlContent });
          }
        );
      } catch (e) {
        reject(e);
      }
    }
  });
