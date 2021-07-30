<div align="center">

# repo-template

[![npm][npm-img]][npm-url] [![GitHub Workflow Status][gh-actions-img]][github-actions] [![Coverage][cov-img]][cov-url]

</div>

Unless middleware for tinyhttp that executes a middleware conditionally.

## Install

```sh
pnpm i @tinyhttp/unless
```

## API

### `unless(middleware, (UnlessMiddlewareOptions | CustomUnless))`

The `UnlessMiddlewareOptions` object can include:

- `method` - string or array of strings that describe forbidden http methods such as GET, POST, PUT etc...
- `path` - array of strings, Regex and objects that include `url` and `methods` properties, which will be compared against the request.
- `ext` - string or array of strings that describe forbidden path ends (e.g. in `/user/123` it will check against `/123`).

The `CustomUnless` is a function that receives a Request object and returns a boolean. The result of the function will determine if the execution of the middleware is skipped.

## Example

```ts
import { App } from '@tinyhttp/app'
import { unless } from '@tinyhttp/unless'
import { cors } from '@tinyhttp/cors'

const app = new App()

app
  .use(unless(cors(),  { method: ['GET', 'POST'] }))
  .use(unless(cors(), { ext: '/public' }))
  .use(unless(cors(), (req) => req.method === 'GET')
  .use(unless(cors(), { path: ['/content/public', /user/, { url: '/public', methods: ['GET'] }] })
  .listen(3000)
```

[npm-url]: https://npmjs.com/package/@tinyhttp/unless
[github-actions]: https://github.com/tinyhttp/unless/actions
[gh-actions-img]: https://img.shields.io/github/workflow/status/tinyhttp/unless/CI?style=for-the-badge&logo=github&label=&color=hotpink
[cov-img]: https://img.shields.io/coveralls/github/tinyhttp/unless?style=for-the-badge&color=hotpink
[cov-url]: https://coveralls.io/github/tinyhttp/unless
[npm-img]: https://img.shields.io/npm/dt/@tinyhttp/unless?style=for-the-badge&color=hotpink
