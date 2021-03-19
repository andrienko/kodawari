import path from 'path';
import getGlob, { IOptions } from 'glob';
import fs from 'fs';
import { merge as lodashMerge } from 'lodash';
import slugify from 'slugify';
import { format } from 'date-fns';
import marked from 'marked';

import { Config, File } from './types';

const log = (msg: string, data?: any) => (data === undefined ? console.log(msg) : console.log(msg + ':', data));

export const logger = {
  info: log,
  warn: log,
  err: log,
};

const encoding = 'utf-8';

export const baseName = (fileName: string) => path.basename(fileName);
export const fileNameWithoutExtension = (fileName: string) => baseName(fileName).replace(/\..*$/, '');

export const fileExtension = (filename: string) => {
  const extname = path.extname(filename);
  const words = extname.split('.');
  return words[words.length - 1].toLowerCase();
};

export const merge = lodashMerge;

export const singleGlob = (pattern: string, options?: IOptions): Promise<string[]> =>
  new Promise((resolve, reject) =>
    getGlob(pattern, options || {}, (err, matches) => {
      if (err) reject(err);
      else resolve(matches);
    })
  );

export const slugifyFilename = (filename: string) => slugify(fileNameWithoutExtension(filename));

export const glob = async (patterns: string | string[], options?: IOptions): Promise<string[]> => {
  const globs = Array.isArray(patterns) ? patterns : [patterns];
  const items = await Promise.all(globs.map((glob) => singleGlob(glob, options)));
  return [].concat.apply([], items as any);
};

export const loadFileContents = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, { encoding }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    })
  );

export const fileStats = (fileName: string): Promise<fs.Stats> =>
  new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stats) => {
      if (err) reject(err);
      else resolve(stats);
    });
  });

export const fileAccess = (fileName: string, access: number): Promise<boolean> =>
  new Promise((resolve) => fs.access(fileName, access, (err) => resolve(!err)));

export const fileExistsAndReadable = (filename: string): Promise<boolean> =>
  fileAccess(filename, fs.constants.F_OK | fs.constants.R_OK);

export const writeFile = (fileName: string, data: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, { encoding }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const copyFile = (from: string, to: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.copyFile(from, to, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

// TODO: Maybe optimize in future; nor worth the effort at this point
export const getUniqueStringBuilder = () => {
  const uniqueStrings: string[] = [];

  return (nextString: (index: number) => string): string => {
    let index: number = 0;
    let str = nextString(index);
    while (uniqueStrings.includes(str)) {
      index += 1;
      str = nextString(index);
    }
    uniqueStrings.push(str);
    return str;
  };
};

export const getUniqueStringBuilderAppend = () => {
  const buildString = getUniqueStringBuilder();
  return (short: string) => buildString((index: number) => (index ? `${short}_${index}` : short));
};

export const copyFilesToDir = async (filesGlob: string | string[], target: string) => {
  const files = await glob(filesGlob);
  await Promise.all(files.map((file) => copyFile(file, path.resolve(target, path.basename(file)))));
  return files;
};

export const getStringsForLanguage = (config: Config, language?: string) => {
  return {
    ...config.strings,
    ...config.languageSpecificStrings[config.language],
    ...(language && language !== config.language ? config.languageSpecificStrings[language] : {}),
  };
};

export function mapPromise<IT, RIT>(items: IT[], prF: (items: IT) => Promise<RIT>): Promise<RIT[]> {
  return Promise.all(items.map(prF)) as Promise<RIT[]>;
}

export const relativePath = (targetAbsolutePath: string, thisAbsolutePath: string) => {
  return path.relative(thisAbsolutePath, targetAbsolutePath);
};

export const parseDate = (dateAsString?: string): Date | null => {
  if (!dateAsString) return null;
  try {
    return new Date(dateAsString);
  } catch (e) {
    logger.warn('Unable to parse date', dateAsString);
  }
  return null;
};

export const renderMarkdownString = marked

export const formatDate = (date: Date, formatString: string, _locale?: string) => format(date, formatString);

export const loadFile = (fileName: string): Promise<File> =>
  loadFileContents(fileName).then((content) => ({
    fileName,
    content,
    type: fileExtension(fileName),
  }));
