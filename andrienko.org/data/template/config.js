module.exports = ({ on, data }) => {
  on('payload', (payload) => {
    const pageTitle = payload.meta && payload.meta.title ? payload.meta.title : '';
    return {
      ...payload,
      menu: (template, language) => {
        return data.nav[template === 'index' ? 'main' : 'single'][language];
      },
      pageTitle,
    };
  });
  on('afterPostsCreated', (pages) => {

    const buildPage = (slug, title, language, template, meta = {}) => {
      return {
        slug,
        title,
        body: '',
        url: '/' + slug,
        source: {
          meta: {
            template,
            ...meta
          }
        },
        language,
        targetPath: slug,
        fileDate: new Date(),
        rawDate: new Date(),
        date: 'October 20th, 2020'
      }
    }

    return [
      ...pages,
      buildPage('debug', 'Debug', 'ru', 'debug', {noFormat: true})
    ];
  });
};
