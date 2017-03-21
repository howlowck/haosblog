+++
date = "2017-03-21T17:02:21-05:00"
title = "Serving Static Assets in Restify"
images = []
banner = ""
menu = ""
description = ""
categories = []
tags = []

+++

# Serving Static Assets in Restify NodeJS

While Restify is branded as a REST Framework, there are instances where we want to put a static html along with the API.  For example, if we want to serve up the API documentation or built a Bot and serve up an UI.

## Four lines of Code

If you are looking to serve up static assets from in the root path, and all your assets are in the `public` directory, these are the four lines of code you need.

```js
server.get(/\/?.*/, restify.serveStatic({
  directory: './public',
  default: 'index.html'
}))
```

The important note is you'll need to **put this code snippet as the very last route registration in your app**, otherwise every single GET request will try to serve the asset request (For example, `/api/messages` will cause restify to look for `index.html` under `public/api/messages/`)
