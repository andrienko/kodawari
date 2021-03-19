type Options = Partial<{
  wrap: number;
  indent: string;
  'replace-nbsp': boolean;
  'break-around-comments': boolean;
  'break-around-tags': string[];
  'remove-attributes': (string | RegExp)[];
  'remove-comments': boolean;
  'remove-empty-tags': (string | RegExp)[];
  'remove-tags': (string | RegExp)[];
  'add-break-around-tags': string[];
  'add-remove-attributes': string[];
  'add-remove-tags': string[];
}>;

declare namespace cleaner {
  function clean(text: string, options: Options, callback: (result: string) => void): void;
  function clean(text: string, callback: (result: string) => void): void;
}

export = cleaner;
