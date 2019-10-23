# Fractools Node

This Node uses Websockets to build a communication network between several Clients

```shell
# Install Dependencies
npm i

# Run Node in Development Mode with `Nodemon`
npm run dev

# Run Node in Production mode
npm run start
```

> Fractools Fileserver will be installed by default.
> More about that module here on [@fractools/fileserver](https://github.com/fractools/fileserver)

If you want to protect the Node for Crashes, which decrease your runtime, use `Forever` to keep this running with a process id (pid) on your OS.

```shell
# Install Forever globally
[sudo] npm install forever -g

# Run your instance
[sudo] forever start index.js
```
