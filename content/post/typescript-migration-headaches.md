---
title: "Typescript Migration Headaches"
slug: "ts-migration-headaches"
date: 2017-11-28T17:05:48-06:00
draft: true
images: []
menu: ""
description: ""
categories: []
tags: []
---

I've been learning about Typescript and there are just a lot of issues I'm running into.

## `Cannot redeclare block-scoped variable`

### Issue:

There seems to be a bug where if you change the filename from `.ts` to `.js`, and let VSCode do its intellisense, it will give you the squelly saying that some of your variable cannot be redeclared, EVEN when the variable is at the top of the file. This is caused to you have two variable names being the same in two separate files.

### Solution:

Unfortunate, I don't know why this works, but I had to just change the variable name on one of the files. And save. Then change the variable name back. This should get rid of the error.
