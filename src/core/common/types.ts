export type File = {
  fileName: string;
  content: string;
  type: string;
};

export type PageSource = {
  file: File;
  meta: RawMeta;
  content: string;
};

export type PageData = {
  source?: PageSource;

  slug: string;
  title: string;
  body: string;
  url: string;

  targetPath: string;

  language: string;
  fileDate: Date;
  rawDate: Date;
  date: string;
};

export type Page = PageData & {
  htmlContent: string;
};

// ---

export type Asset = {
  type: string;
  slug: string;
  fileName: string;
  originalPath: string;
  originalFileName: string;
  targetPath: string;
  content?: string;
  transformed: boolean;
};

export type URIInformation = {
  type: string;
  body: string;
  uri: string;
  posts: PageData[];
};

export enum URIType {
  File = 'file',
  Asset = 'asset',
  String = 'str',
  Page = 'page',
  Root = 'root',
}

// ---

type EngineConfig<L = string> = {
  paths: {
    data: string;
    pages: string;
    assets: string;
    files: string;
    template: string;
  };
  output: {
    path: string;
    assets: string;
    files: string;
  };
  baseUrl: string;
  language: L;
  renderIndexFile: string;
  templateIndex: string;
  assets: string[];
  addIndexToURL: boolean;
  dateFormat: string;
};

export interface KeyValueDeep {
  [key: string]: string | KeyValueDeep;
}

type ContentConfig<ST = KeyValueDeep> = {
  strings: ST;
};

export type Config<L extends string | number | symbol = string, ST = KeyValueDeep> = EngineConfig<L> &
  ContentConfig<ST> & {
    languageSpecificStrings: Record<L, ST>;
  };

export type RawMeta = Record<string, any> &
  Partial<{
    language: string;
    template: string;
    date: string;
    title: string;
    noRender: string;
    noFormat: string;
  }>;

export type RenderPayload = {
  strings: KeyValueDeep;
  page: PageData;
  config: Config;
  template: string;
  meta?: Record<string, any>;
  data: Data;
  md: (str: string) => string;
  [key:string]: any;
};

export interface Template {
  readonly defaultPage: string;
  runHook: (hookName: string, payload: any, args: any[]) => any;
  renderPage: (pageTemplate: string, page: PageData, strings: KeyValueDeep) => Promise<string>;
}

export type TemplateGetter = (config: Config, data: Data) => Promise<Template>;

export type Data = Record<string, any>;
export type RenderPage = (page: PageData) => Promise<Page>

export type PageRendererData = {
  template: Template,
  renderPage: RenderPage
}

export type AppRegistry = {
  assetRenderers: ((config: Config) => Promise<(asset: Asset) => Promise<Asset>>)[];
  fileRenderers: ((
    config: Config,
    getUniqueSlug: (slug: string) => string
  ) => Promise<{
    getFiles: () => Promise<File[]>;
    renderer: (file: File) => Promise<PageData>;
  }>)[];
  pageRenderer: TemplateGetter;
  postProcessors: ((page: Page) => Promise<Page>)[];
}
