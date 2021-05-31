# @kingsway-digital/craftercms-react

Convenient React utilities for working with Crafter CMS

This package contains convenience utilities
for working with Crafter CMS, over and above
the SDK provided by Crafter.

This is a very new package. More items will be
added over time.

## Installation

### ES6 via npm

```sh
npm install @kingsway/craftercms-react
```

### ES6 via yarn

```sh
yarn add @kingsway/craftercms-react
```

## Usage

###`extractConfigFromFreemarker( param , elementId = "root")`
Grabs the param from the dataset attribute in the
specified element ID and returns it.

This function is designed to ignore values that
begin with `${` and end with `}` - it will return
null in those cases. This effectively ignores
freemarker includes that aren't populated.

Given the following html:

```html
<body>
  <div id="root" data-site="${siteName}" data-flag2="a flag value" />
</body>
```

The following will retrieve the data attributes:

```ts
import { extractConfigFromFreemarker } from "@kingsway/craftercms-react";

const site = extractConfigFromFreemarker("site"); // if set in freemarker, will resolve, otherwise null
const flag2 = extractConfigFromFreemarker("flag2"); // "a flag value"
```

More coming soon.
