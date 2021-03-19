import path from 'path';
import mkdirp from 'mkdirp';

import { Config, Data, Page, TemplateGetter, PageData, PageRendererData } from '../common/types';

import { getStringsForLanguage, writeFile } from '../common/helpers';

export const getPostFileWriter = (config: Config) => {
  return async (page: Page): Promise<void> => {
    const targetPath = path.join(config.output.path, page.targetPath);
    await mkdirp(targetPath);
    const fileName = path.join(targetPath, config.renderIndexFile);
    await writeFile(fileName, page.htmlContent);
  };
};

export const getPageRenderer = async (
  config: Config,
  getTemplate: TemplateGetter,
  data: Data
): Promise<PageRendererData> => {
  const template = await getTemplate(config, data);
  return {
    template,
    renderPage: async (page: PageData): Promise<Page> => {
      const templateName = page.source?.meta?.template || template.defaultPage;
      const strings = getStringsForLanguage(config, page.language);
      const htmlContent = await template.renderPage(templateName, page, strings);
      return { ...page, htmlContent };
    },
  };
};
