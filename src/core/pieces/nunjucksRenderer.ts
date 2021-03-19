import { Config, Data, KeyValueDeep, PageData, RenderPayload, Template, TemplateGetter } from '../common/types';

import { ConfigureOptions, Environment, FileSystemLoader } from 'nunjucks';
import { fileExistsAndReadable, formatDate, logger, renderMarkdownString } from '../common/helpers';
import * as helpers from '../common/helpers';

import path from 'path';

type Hooks = Record<string, ((...args: any[]) => any)[]>;

class NunjucksRenderer implements Template {
  constructor(private env: Environment, private config: Config, private data: Data, private hooks: Hooks) {}
  public defaultPage: string = 'index';

  runHook(hookName: string, payload: any, args: any[] = []) {
    let newPayload = payload;
    if(this.hooks[hookName]){
      this.hooks[hookName].forEach((callback) => {
        newPayload = callback(payload, ...args);
      });
    }
    return newPayload;
  }

  renderPage(pageTemplate: string, page: PageData, strings: KeyValueDeep) {
    let payload: RenderPayload = {
      strings,
      page,
      template: pageTemplate,
      meta: page.source?.meta,
      config: this.config,
      data: this.data,
      md: renderMarkdownString
    };

    payload = this.runHook('payload', payload, [this.config]);

    /*
    TODO: Check and rid of this
    if (this.hooks.payload) {
      this.hooks.payload.forEach((callback) => {
        const result = callback(payload, this.config);
        if (result) {
          payload = result;
        }
      });
    }
    */

    return new Promise<string>((resolve, reject) => {
      this.env.render(`page/${pageTemplate}.njk`, payload, (err, res) => {
        if (err || !res) reject(err);
        else resolve(res);
      });
    });
  }
}

const getTemplate: TemplateGetter = async (config: Config, data: Data) => {
  const settings: ConfigureOptions = {
    autoescape: false,
  };

  const hooks: Hooks = {};

  const templatePath = path.resolve(config.paths.template);

  const loaderFile = path.join(templatePath, 'config.js');
  if (await fileExistsAndReadable(loaderFile)) {
    let loader;

    try {
      const { default: l } = await import(loaderFile);
      loader = l;
    } catch (e){
      throw(e);
    }
    if (typeof loader === 'function') {
      logger.info('Theme loader found', loaderFile);
      loader({
        on: (event: string, method: () => any) => {
          hooks[event] = hooks[event] || [];
          hooks[event].push(method);
        },
        data,
        config,
        helpers
      });
    }
  } else {
    logger.info('No loader for theme');
  }
  const env = new Environment(new FileSystemLoader(templatePath), settings);

  env.addFilter('postDate', (pageData: PageData, passedFormat?: string) => {
    const usedFormat = passedFormat || config.dateFormat;
    return formatDate(pageData.rawDate, usedFormat, pageData.language);
  });

  return new NunjucksRenderer(env, config, data, hooks);
};

export default getTemplate;
