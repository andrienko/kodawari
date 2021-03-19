# le fu
This one is a static website generator... Sort of. It is written with sole purpose of being used to generate static
contents for my website, [andrienko.org](https://andrienko.org). After several attempts at creating a website, I came
to realization I need it to be static mostly. After several attempts with different static generators I have decided to
write mine, that would serve the purpose of generating my own website the way I want to see it. I wanted the content
creation to be as easy as possible for me, and this is what it is all about. Once some feature is missing - I implement
it. Not trying to make this thing universal or anything.

Maybe some day it will become something more that just what it is now, maybe an external tool with plugins and stuff,
but definitely not yet. I keep the future in mind while writing it.

## Building

In order to build - you will need [rush](https://rushjs.io/). Get it by `npm i -g @microsoft/rush`
and then do

    rush install
    rush build

That should build everything.

## Content
By default, all the data the website has should be inside the `data` folder. So, different `data` folder means the
different website.

### Pages
Pages (aka URLs) are generated from markdown files + front-matter. In theory, any kinds of data can be used for that
purpose in the future, including web-requests to some headless CMS, but not just yet.

The front-matter can be used to define things like template, language, date. Also, all the front-matter fields are
available as `meta` object in the templates.

### Template
Templating uses nunjucks now. In theory, other engines could be used in the future, but not yet. Template folder has
`page` folder, which actually contains entry points. By default, the `index.njk` is used for all the posts. If you need
the post to use a different template - specify it in `template` field in post's meta (front-matter for the markdown).

Also, nunjucks templates can have the `config.js` file inside, which should contain a "theme loader" callback that will
be called when the renderer is instantiated (before rendering the posts) and can register some hooks (not clear yet
what will these become in the future, currently I use them to transform payload and define some theme-specific
functions)

### Data
The data is an object of strings built from all the json and yml files inside data directory and its subdirectories,
merged together. It may feel unpredictable, as data from files may overlap even with fields from other files,
but actually it is up to user. The idea here is that the used controls all the data.

The data is guaranteed to be non-empty, and its keys (if present) are guaranteed to be objects. Data is passed to
template as `data` field. The objects all have toString method defined that `JSON.stringify`-es them.

### Assets and files
Assets are to be referred using an `asset://` URI.

All the recognized content of assets folder will be copied to website's assets folder. When asset is referred by only
one page - it is moved to that page's folder. Some of these will be processed so, say, LESS files will be compiled to
CSS.

### Slugs
Everything has a slug. The slug is often taken from the filename. For pages, this can be manually overridden using
front-matter `slug` field. If a slug already exists - it will be added a `_1` postfix. This can, in theory, lead to
one page replacing another (as `page://` URIs refer to posts by slug, and slugs are built from filenames (so, say,
page generated from `info.md` can override a page that has `slug: info` in its front-matter.

### URIs
By default, custom URIs are supported. These are deliberately found inside text of rendered pages before writing them
and are replaced. A pretty simple regex is used, so these are not even real URIs (no query parameters supported, only
path, and path can actually be malformed, that is on purpose). Following can be used anywhere, no
matter it is a page or a template:

- `str://email` - will be replaced with `email` value from config's `strings` or `languageSpecificStrings`.
- `asset://style.less` - will be replaced with `style.less` asset relative URL. The file should be preseint inside
  `assets` folder for that.
- `page://slug` - will be replaced by a relative url to the page that has `slug` slug
- `root://files/file.pdf` - will be replaced by an url relative to `file.pdf` at site's files folder url.
