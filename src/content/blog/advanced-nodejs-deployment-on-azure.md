---
heroImage: "../../assets/blog/azure-node.jpg"
title: "Custom NodeJs Deployment on Azure Web App"
description: ""
pubDate: '2017-03-24T17:05:17-05:00'
---

One of the advantages of using Azure Web App is how easy it is to deploy a NodeJS app. If you have an app as simple as [this one](https://github.com/howlowck/simplest-restify-on-azure), Azure Web App will pick it up, install all the node dependencies, and serve the app on port 80. And you are done!!!

Unfortunately, a lot of times, you might want to venture outside the comfort of auto-deploy land, and do some customization. Maybe your public directory isn't called `/public`, or if you want to install `yarn` package manager, or install dev-dependencies to build your client-side code.

## Azure Deployment Magic (Kudu)

When you deploy a project on Azure Web App, it is using the Azure's deployment engine called Kudu. Kudu will look at a couple of things to determine how to deploy your app. If you have a `package.json`, Kudu will think you have a Node App.

### Overall Process

1. `repository` directory changes, Kudu process is triggered
1. Kudu determines that it's a node app
1. If there is no `web.config` or `iisnode.yml` in your repo, Kudu tries to generate it
1. Kudu tries to figure out the Node version you want
1. If there is no `.deployment` in your repo, Kudu generates and runs `deploy.cmd`

### The `web.config` file

The `web.config` file configures the IIS server. With this XML-formatted file, your IIS server knows how to handle a request that hits it. The most important part of the config file for the Node app is the entry file.

If you already have a `web.config` file in your repo, Kudu will not try to generate a new one, and just load your `web.config` file.

However, if you don't have a `web.config`, Kudu will try to generate one for you. In order to do that, Kudu needs to know where is the entry file. Kudu tries to find your entry file in these steps:

1. Looks for `"scripts":{"start":command}` in your `package.json`. Kudu [assumes](https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js#L153) your command is `node filename`, so if you are using more robust tools like [better-npm-run](https://www.npmjs.com/package/better-npm-run), this heuristic will break. The script checks to see if the file exists, if it does not, goes to the next step.
2. Looks for `app.js` or `server.js`, if either exists in the root repo path, Kudu sets it has the entry file.

Once Kudu found the entry file, it generates the `web.config` file using [this template](https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/iisnode.config.template). Notice that it is simply putting the file path into the `{NodeStartFile}` string in the template, and letting the `iisnode` module handling the request.

### The `iisnode.yml` file

The iisnode.yml is a configuration file that set various settings for the iisnode module. For the whole list of options you can set [See this blog post on iisnode.yml](https://tomasz.janczuk.org/2012/05/yaml-configuration-support-in-iisnode.html).

The important setting is `nodeProcessCommandLine` which sets the exact path to the node executable. [see this example](https://github.com/howlowck/train-faces/blob/master/iisnode.yml)

If you don't have a `iisnode.yml` file, then Kudu will try to determine your Node Version

### Node Version for your app

Kudu needs to know which version of node you want to run your app and deployment. It will try to find the version you want by following these steps.
If not satisfied, goes to the next step:

1. If there is a `iisnode.yml` and `nodeProcessCommandLine` property inside: it will run that exact path of node.
2. If in your `package.json`, there is an `"engines":{"node":version}` specification, Azure will use the specified version
3. In Application Settings on the Azure portal, you have `WEBSITE_NODE_DEFAULT_VERSION` set as one of the environment variables
4. The default Node version for Azure. The exact version changes over time.

### The `.deployment` and `deploy.cmd` file

`deploy.cmd` is the script that Kudu runs to "build" your project.

If you don't have a `.deployment` file in your repo, Kudu will assume you want to use the default deployment script for your application.
This is the [Node Deployment Script (deploy.cmd)](https://github.com/projectkudu/kudu-deployment-scripts/blob/master/scripts/deploy-node.cmd) that will run.

The part of the script we care about is [the Deployment section](https://github.com/projectkudu/kudu-deployment-scripts/blob/master/scripts/deploy-node.cmd#L88-L107).

> **_Note:_** The npm install command in the script is `npm install --production`, but even if you delete the `--production` flag, NPM will still ignore your dev-dependencies. This is because when `npm install` runs, it looks at your "NODE_ENV" environment variable, and if it's "prod" or "production", NPM will ignore your dev-dependencies. Kudu sets your "NODE_ENV" to "production" by default.

If you want to change your deployment process, you will need to add a `.deployment` file with a "command" config value ([See example](https://github.com/howlowck/train-faces/blob/master/.deployment)), and a `deploy.cmd` file ([See example](https://github.com/howlowck/train-faces/blob/master/deploy.cmd)).

## Common Deployment Tweaks

### Change Node Version

1. Add `"engines":{"node":version}` to your package.json file.

### Change public directory

1. Create a `web.config` file, ([See Example of a web.config](https://github.com/howlowck/train-faces/blob/master/web.config)).
2. Change the `url` property of the `action` node under `StaticContent`

### Change Entry File

1. Create a `web.config` file, ([See Example of a web.config](https://github.com/howlowck/train-faces/blob/master/web.config)).
2. Change `path` property under the `handlers` node
3. Change `url` property under the `rule name="NodeInspector"` node
4. Change `url` property under the `rule name="DynamicContent"` node

**OR** if you don't want to create a custom `web.config`

1. change your `start` script in your `package.json` to `node example.js` (replace example.js with your entry file)

### Install dev dependencies

1. Create a [`.deployment` file](https://github.com/howlowck/train-faces/blob/master/.deployment)
2. Duplicate a [`deploy.cmd` file](https://github.com/projectkudu/kudu-deployment-scripts/blob/master/scripts/deploy-node.cmd), and find the line  
   `call :ExecuteCmd !NPM_CMD! install --production`.
3. Add `call :ExecuteCmd !NPM_CMD! install --only=dev` right after that line.

## TL;DR

- Azure Web App uses [Kudu](https://github.com/projectkudu/kudu) to deploy your app (when using git CI)
- Kudu **does not** run your `npm start` script. It might look like it is if your `start` script is `node server.js`
- If you don't have a `web.config`, Kudu will try to generate a `web.config` for you with the following steps to get the starter file.
  - Kudu tries to extract the entry file path from your `npm start` script
  - Kudu looks for either a `server.js` or `app.js` in the root of your repository if `npm start` extraction wasn't successful.

## Useful Code References

- [Default deploy.cmd](https://github.com/howlowck/train-faces/blob/master/deploy.cmd)
- [JS Script that generates your web.config](https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js)
- [Deployment Controller](https://github.com/projectkudu/kudu/blob/master/Kudu.Services/Deployment/DeploymentController.cs)
- [Node Detector](https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Deployment/Generator/NodeSiteEnabler.cs)
