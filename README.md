# redash-client

JavaScript Client for [Redash](https://redash.io/) API

[![npm version][npm-image]][npm-url]
![Node.js Version Support][node-version]
[![build status][circleci-image]][circleci-url]
[![dependency status][deps-image]][deps-url]
![License][license]

##### Note: This pacakge requires Node v8+ for async/await

## Install

```console
$ npm install redash-client
```

## Usage

```javascript
const RedashClient = require('redash-client');
const redash = new RedashClient({
  endPoint: 'https://your-redash.com/',
  apiToken: 'abcde12345',
});
redash
  .queryAndWaitResult({
    query: 'select * from actor',
    data_source_id: 1,
  })
  .then(resp => {
    console.log(resp.query_result);
  });
```

## API

See [API document](https://teppeis.github.io/redash-client/)

### Supported REST API

- `#getDataSources()`
- `#getDataSource()`
- `#postQuery()`
- `#getQueries()`
- `#getQuery()`
- `#updateQuery()`
- `#postQueryResult()`
- `#getQueryResult()`
- `#getJob()`

Methods for other REST API are not implemented yet. Help!

### Utility methods

#### `#queryAndWaitResult()`

Internally:

1. `postQueryResult()`
2. Polling `getJob()`
3. Return `getQueryResult()`

## License

MIT License: Teppei Sato &lt;teppeis@gmail.com&gt;

[npm-image]: https://img.shields.io/npm/v/redash-client.svg?logo=npm&style=for-the-badge
[npm-url]: https://npmjs.org/package/redash-client
[npm-downloads-image]: https://img.shields.io/npm/dm/redash-client.svg
[travis-image]: https://img.shields.io/travis/teppeis/redash-client/master.svg?logo=travis&style=for-the-badge
[travis-url]: https://travis-ci.org/teppeis/redash-client
[deps-image]: https://img.shields.io/david/teppeis/redash-client.svg?style=for-the-badge
[deps-url]: https://david-dm.org/teppeis/redash-client
[node-version]: https://img.shields.io/badge/Node.js-v8+-brightgreen.svg?logo=Node.js&style=for-the-badge
[coverage-image]: https://img.shields.io/coveralls/teppeis/redash-client/master.svg
[coverage-url]: https://coveralls.io/github/teppeis/redash-client?branch=master
[license]: https://img.shields.io/npm/l/redash-client.svg?style=for-the-badge
[appveyor-image]: https://ci.appveyor.com/api/projects/status/22nwyfaf5p0yw54j/branch/master?svg=true
[appveyor-url]: https://ci.appveyor.com/project/teppeis/redash-client/branch/master
[circleci-image]: https://img.shields.io/circleci/project/github/teppeis/redash-client/master.svg?logo=circleci&style=for-the-badge
[circleci-url]: https://circleci.com/gh/teppeis/redash-client
