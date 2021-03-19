import { Asset, Config, URIInformation, URIType } from '../common/types';
import mkdirp from 'mkdirp';
import path from 'path';

import {
  baseName,
  copyFile,
  fileExtension,
  getUniqueStringBuilderAppend,
  slugifyFilename,
  writeFile,
} from '../common/helpers';

const buildAssetSlug = getUniqueStringBuilderAppend();

/** Create assets for file */
export const getAssetCreator = (config: Config) => {
  return async (assetFilePath: string): Promise<Asset> => {
    const slug = buildAssetSlug(slugifyFilename(assetFilePath));
    const fileName = baseName(assetFilePath);
    return {
      type: fileExtension(assetFilePath),
      fileName,
      targetPath: config.output.assets,
      originalFileName: fileName,
      originalPath: assetFilePath,
      transformed: false,
      slug,
    };
  };
};

/** Change target filenames for post folders for assets used only by that posts */
export const getPostAssetMover = (URIInfos: URIInformation[]) => {
  const assetUris = URIInfos.filter((uri) => uri.type === URIType.Asset);
  return async (asset: Asset): Promise<Asset> => {
    const assetURI = assetUris.find((uri) => uri.body === asset.fileName);
    if (assetURI && assetURI.posts.length === 1) {
      return {
        ...asset,
        targetPath: assetURI.posts[0].targetPath,
      };
    }
    return asset;
  };
};

/** Write assets to their target paths */
export const getAssetWriter = (config: Config) => {
  return async (asset: Asset) => {
    const target = path.join(config.output.path, asset.targetPath, asset.fileName);
    await mkdirp(path.dirname(target));
    if (asset.content) {
      return writeFile(target, asset.content);
    } else {
      return copyFile(asset.originalPath, target);
    }
  };
};
