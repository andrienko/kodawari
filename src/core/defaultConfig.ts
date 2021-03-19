import { Config } from './common/types';

export const defaultConfig: Config = {
  paths: {
    pages: './data/pages',
    assets: './data/assets',
    files: './data/files',
    data: './data/data',
    template: './data/template',
  },
  baseUrl: '',
  assets: ['*.svg', '*.png', '*.jpg', '*.less', '*.ico'],
  output: {
    path: 'result',
    assets: 'assets',
    files: 'files',
  },
  language: 'en',
  renderIndexFile: 'index.html',
  templateIndex: 'page/index.njk',
  addIndexToURL: true,
  strings: {},
  languageSpecificStrings: {},
  dateFormat: 'MMMM do, yyyy',
};
