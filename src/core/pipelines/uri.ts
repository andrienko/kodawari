import { Asset, Config, Page, URIInformation, URIType } from '../common/types';
import { getStringsForLanguage, relativePath, logger } from '../common/helpers';
import { get } from 'lodash';

const getURIRegex = (): RegExp => {
  const supportedUriTypes: URIType[] = [URIType.Root, URIType.Asset, URIType.File, URIType.Page, URIType.String];
  return new RegExp(`\(${supportedUriTypes.join('|')}\)\:\\\/\\\/\(\[\\w\-\.\]\+\)`, 'gm');
};

export const collectURIInformation = async (posts: Page[]): Promise<URIInformation[]> => {
  const uriInformationByURI: Record<string, URIInformation> = {};
  posts.forEach((file) =>
    file.htmlContent.replace(getURIRegex(), (uri: string, type: string, body: string) => {
      const uriInformation: URIInformation = uriInformationByURI[uri] || {
        uri,
        type,
        body,
        posts: [],
      };
      uriInformationByURI[uri] = uriInformation;
      uriInformation.posts.push(file);
      return uri;
    })
  );
  return Object.values(uriInformationByURI);
};

export const replaceURIs = async (files: Page[], config: Config, assets: Asset[]): Promise<Page[]> => {
  const pagesBySlug: Record<string, Page> = files.reduce((pages, page) => ({ ...pages, [page.slug]: page }), {});

  return files.map((page) => {
    const strings = getStringsForLanguage(config, page.language);

    const htmlContent = page.htmlContent.replace(
      getURIRegex(),
      (uri: string, uriType: string, uriBody: string): string => {
        if (uriType === URIType.Asset) {
          const asset = assets.find((asset) => asset.originalFileName === uriBody);
          if (!asset) {
            logger.warn(`${page.source?.file.fileName} - Asset ${uriBody} not found`);
            return uri;
          } else {
            const assetUrl = config.baseUrl + '/' + asset.targetPath + '/' + asset.fileName;
            return relativePath(assetUrl, page.url);
          }
        }

        if (uriType === URIType.String) {
          const item = get(strings, uriBody.split('.'))
          if (typeof item === 'string') {
            return item as string;
          } else {
            logger.warn(`String for ${uriBody} not found for ${page.source?.file.fileName}`);
          }
        }

        if (uriType === URIType.Page) {
          if (pagesBySlug[uriBody]) {
            const addition = config.addIndexToURL ? '/' + config.renderIndexFile : '';
            return relativePath(pagesBySlug[uriBody].url + addition, page.url);
          } else {
            logger.warn(`Page with slug ${uriBody} not found`);
          }
        }

        if (uriType === URIType.Root) {
          const rootFileURL = config.baseUrl + '/' + uriBody;
          return relativePath(rootFileURL, page.url);
        }

        return uri;
      }
    );

    return {
      ...page,
      htmlContent,
    };
  });
};
