import path from 'path';
import mkdirp from 'mkdirp';

import {
  glob,
  copyFilesToDir,
  fileExistsAndReadable,
  mapPromise,
  logger,
  getUniqueStringBuilderAppend,
} from './common/helpers';

import { getPostFileWriter, getPageRenderer } from './pipelines/posts';

import { getMarkdownRenderer } from './pieces/markdownRenderer';
import { cleanHtml } from './pieces/cleanHtml';

import { collectURIInformation, replaceURIs } from './pipelines/uri';
import { getAssetCreator, getPostAssetMover, getAssetWriter } from './pipelines/assets';

import {
  Asset,
  Config,
  Page,
  URIInformation,
  PageData,
  AppRegistry,
  URIType,
  PageRendererData,
} from './common/types';
import { defaultConfig } from './defaultConfig';

import getNunjucksRenderer from './pieces/nunjucksRenderer';

import { getFolderDataObject } from './pipelines/data';
import { getLessAssetRenderer } from './pieces/lessRenderer';

const appRegistry: AppRegistry = {
  assetRenderers: [getLessAssetRenderer],
  fileRenderers: [getMarkdownRenderer],
  pageRenderer: getNunjucksRenderer,
  postProcessors: [cleanHtml],
};

const postProcessPage = async (page: Page): Promise<Page> => {
  for (const processor of appRegistry.postProcessors) {
    page = await processor(page);
  }
  return page;
};

const renderPages = async (config: Config, rendererData: PageRendererData): Promise<Page[]> => {
  let pages: PageData[] = [];

  const getSlug = getUniqueStringBuilderAppend();

  for (const getRenderer of appRegistry.fileRenderers) {
    const { renderer, getFiles } = await getRenderer(config, getSlug);
    const filesToRender = await getFiles();
    const renderedPages = await mapPromise(filesToRender, renderer);
    pages = [...pages, ...renderedPages];
  }

  pages = rendererData.template.runHook('afterPostsCreated', pages, []);

  const pagesToRender = pages.filter((page) => !page.source?.meta?.noRender);
  const renderedPages = await mapPromise(pagesToRender, rendererData.renderPage);
  return mapPromise(renderedPages, postProcessPage);
};

const writePosts = async (config: Config, posts: Page[]) => {
  return mapPromise(posts, getPostFileWriter(config));
};

const createAssets = async (config: Config, uriInformation: URIInformation[]) => {
  const usedAssetURIs = uriInformation.filter(({ type }) => type === URIType.Asset);
  logger.info('Assets used in pages/files', new Set(usedAssetURIs.map((uri) => uri.body)).size);

  for (const assetURI of usedAssetURIs) {
    const uriFilename = assetURI.body;
    const fileName = path.join(config.paths.assets, uriFilename);
    if (!(await fileExistsAndReadable(fileName))) {
      logger.warn(
        `Asset file ${fileName} not found, used in`,
        assetURI.posts.map((post) => post.source?.file.fileName)
      );
    }
  }

  const assetGlobsRelative = config.assets.map((assetGlob) => path.join(config.paths.assets, assetGlob));
  const assetFilenames = await glob(assetGlobsRelative);
  return mapPromise(assetFilenames, getAssetCreator(config));
};

const renderAssets = async (assets: Asset[], config: Config): Promise<Asset[]> => {
  let renderedAssets = assets;
  for (const renderGetter of appRegistry.assetRenderers) {
    const renderer = await renderGetter(config);
    renderedAssets = await mapPromise(renderedAssets, renderer);
  }
  return renderedAssets;
};

const writeAssets = async (config: Config, assets: Asset[]) => {
  await mkdirp(path.resolve(config.output.path, config.output.assets));
  await mapPromise(assets, getAssetWriter(config));
  return assets;
};

const copyFiles = async (config: Config) => {
  const filesDir = path.resolve(config.output.path, config.output.files);
  await mkdirp(filesDir);
  const files = await copyFilesToDir(path.resolve(config.paths.files, '*'), filesDir);
  logger.info(`Copied ${files.length} files to ${filesDir}`);
};

const render = async (config: Config) => {
  const data = await getFolderDataObject(config.paths.data);
  const pageRenderer = await getPageRenderer(config, appRegistry.pageRenderer, data);
  const renderedPages = await renderPages(config, pageRenderer);

  logger.info('Posts rendered', renderedPages.length);
  const uriInformation = await collectURIInformation(renderedPages);
  logger.info('Uris found', uriInformation.length);

  const assets = await createAssets(config, uriInformation);
  const renderedAssets = await renderAssets(assets, config);
  const assetsInPageFolders = await mapPromise(renderedAssets, getPostAssetMover(uriInformation));
  await writeAssets(config, assetsInPageFolders);

  const pagesWithURIsReplaced = await replaceURIs(renderedPages, config, assetsInPageFolders);

  await writePosts(config, pagesWithURIsReplaced);
  await copyFiles(config);
};


let siteConfig: Config;
try {
  siteConfig = require(path.resolve('./data', 'config.json'));
} catch (e) {
  throw(e);
}

render({ ...defaultConfig, ...(siteConfig as Partial<Config>) });
