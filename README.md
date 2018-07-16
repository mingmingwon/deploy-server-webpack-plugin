# Introduction
A plugin that deploys webpack bundles to server. It's useful when server ftp/sftp is forbidden or accessing server need pin + dynamic token each time.

# Install
```
npm i deploy-server-webpack-plugin -D
```

# Usage

**Client config**

Modify your webpack config file like below, change the "from" and "dest" fields according to your own project, "from" is based on webpack output dirname, "dest" means the path on server you want to push. token field validation need server side to cooperate.

```js
const path = require('path')
const DeployServerPlugin = require('deploy-server-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    // ...
    new DeployServerPlugin({
      receiver: 'http://1.23.45.678:9999/receiver',
      mapping: { // Object type
        from: path.resolve(__dirname, '../dist'), // absolute path
        dest: '/data/project/front'
      }
    })
  ]
};
```
or

```js
const path = require('path')
const DeployServerPlugin = require('deploy-server-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    // ...
    new DeployServerPlugin({
      receiver: 'http://1.23.45.678:9999/receiver',
      mapping: [ // Array type
        {
          from: path.resolve(__dirname, '../dist/static'),
          dest: '/data/project/public/static',
        },
        {
          from: path.resolve(__dirname, '../dist/index.tpl'),
          dest: '/data/project/views/index.tpl',
        },
        // ...
      ],
      token: '123456789'
    })
  ]
};
```

**Server Config**

Copy ./server folder to you server machine somewhere, init the project and start it.

```
npm i
npm run start
```
Next config your nginx/apache to allow your node service can be accessed.

Try to visit "@your host/receiver" in browser, when you see "Method Not Allowed", it means node server started success, but 'GET' method is not allowed because we only config "POST" router to upload files. Server code is based on Koa, change it according your demand.

# Options

|Name|Type|Required|Description|
|:--:|:--:|:-----:|:----------|
|receiver|String|true|server url used to receive files|
|mapping|Object, Array|true|files will be copied from 'form' to 'dest'|
|token|String|false|for security if needed|

# Others
Sometimes bundle file is too big and uploading appears "504 Gateay Time-out" error, enlarge client_max_body_size value in nginx.conf may solve this problem:
```
client_max_body_size: 10M; #default 1M
```
