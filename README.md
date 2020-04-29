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

If you want to protect the Node for Crashes, which decrease your runtime, use `Forever` to keep this running with a process id (pid) on your OS.

```shell
# Install Forever globally
[sudo] npm install forever -g

# Run your instance
[sudo] forever start index.js
```

## Concept

This Backend is made for NuxtJS Clients. You can find the Plugin over here:

[NuxtJS-Plugin]('https://github.com/fractools/NuxtJS-Plugin')

## Infrastructure

The fallowing descripes the modules and its functionality.

### Intersection
> `/index`
> `/sockets/index`

The `intersection` is the 'network handler', which provides the connectivity between clients and node via websockets. It has the 'router' job.
Every client, which connects with the node gets a token by the `tokenizer` module, so the network know the clients identity.

### Monitor
> `/lib/monitor`
> `/lib/logger`

`Monitor` and its `Logger` Module help monitoring the state of the system including a database for logs. It requires the `dbmanager`

### Tokenizer
> `/lib/tokenizer`

The `tokenizer` is a keygenerator for enccrypting passwords and tokens for clients and its user. It needs the `dbmanager`.

### Authmanager
> `/sockets/auth`

The `authmanager` manages user authentification. It can 'login' vie crendentials or token. It needs the `dbmanager`.

### DBmanager
> `/sockets/dbmanagement`

Is for managing Databases like adding and removing, monitor doccounts and revisions

### Docmanager
> `/sockets/docmanagemenet`

### Usermanager
> `/sockets/usermanagement`

Here you can register and remove user and check or renew passwords. Roles are managable.
