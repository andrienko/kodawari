import matter from 'gray-matter';
import marked from 'marked';
import path from 'path';

import { Config, File, PageData } from '../common/types';

import {
  fileStats,
  formatDate,
  glob,
  mapPromise,
  slugifyFilename,
  loadFile, parseDate
} from '../common/helpers';

export const getMarkdownRenderer = async (config: Config, getUniqueSlug: (originalSlug: string) => string) => {
  const renderer = async (file: File): Promise<PageData> => {
    const { content, data: meta } = matter(file.content);
    const body = marked(content);

    const title = meta.title || '';
    const language = meta.language || config.language;

    const slug = getUniqueSlug(meta?.slug || slugifyFilename(file.fileName));
    const targetPath = slug === 'index' ? '.' : slug;
    const url = path.normalize(config.baseUrl + '/' + targetPath);

    const stats = await fileStats(file.fileName);
    const fileDate = new Date(stats.ctime);
    const rawDate = parseDate(meta?.date) || fileDate;
    const date = formatDate(rawDate, config.dateFormat, language);

    return {
      body,
      title,
      language,
      slug,
      url,
      source: { file, content, meta },
      targetPath,
      fileDate,
      date,
      rawDate,
    };
  };

  const getFiles = async () => {
    const fileNames = await glob(config.paths.pages + '/**/*.md');
    return await mapPromise(fileNames, loadFile);
  };

  return { getFiles, renderer };
};
