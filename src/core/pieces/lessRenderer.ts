import { Asset } from '../common/types';
import { fileNameWithoutExtension, loadFileContents } from '../common/helpers';
import less from "less";

const renderLessAsset = async (asset: Asset): Promise<Asset> => {
  if (asset.type === 'less') {
    const filePath = asset.originalPath;
    const sourceContent = await loadFileContents(filePath);
    const rendered = await less.render(sourceContent, { filename: filePath });
    return {
      ...asset,
      type: 'css',
      fileName: `${fileNameWithoutExtension(asset.originalFileName)}.css`,
      content: rendered.css,
      transformed: true,
    };
  }
  return asset;
};

export const getLessAssetRenderer = async () => renderLessAsset;
