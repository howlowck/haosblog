---
title: "Rethinking Code Generators"
date: 2023-03-26T12:00:06-05:00
draft: true
---

As developers, we **love** using code generators. They represent something exciting. These tools seem to magically lay the foundation to the projects that we want to create. They provide a way for us to stay consistent and utilize best practices without friction. However, when it's time for us to create our own template projects, we quickly realize the work involved.

This blog post will highlight the issues with the current state of "generating a new project" using code generators and example code projects, and propose a different approach to generating code.

## Current State of the World: Code Generators

Before we start diving into the world of code generators, let's define some terms:

- **Code Generators**: Software that will take a template project and create a new project with it. Examples of code generators are [Yeoman](https://yeoman.io/) and [Cookiecutter](https://www.cookiecutter.io/).
- **Template Project**: A project that is meant to utilize a code generator to generate new projects. For examples, [vscode-generator-code](https://github.com/Microsoft/vscode-generator-code) is a template project which utilizes Yeoman to generate a new VSCode Extension and [cookiecutter-flask](https://github.com/cookiecutter-flask/cookiecutter-flask) is template project that utilizes Cookiecutter to generate a new flask app. Typically template projects has a manifest file that defines the project, generator integration code, and actual template code.
- **Integration Code**: Code that is used to integrate with the code generator. This often is the code that invokes the prompting functions of the code generator tool which displays the UI for the users to input their options. [Here is some integration code](https://github.com/microsoft/vscode-generator-code/blob/main/generators/app/generate-command-ts.js) that asks the user for information then calls Yeoman to generate the code.
- **Template Code**: Template code is code that is meant to be fed into a template engine. [This `package.json` file in the vscode-generator-code repo](https://github.com/microsoft/vscode-generator-code/blob/main/generators/app/templates/ext-command-ts/package.json) is an example of a template code. Template code is usually a domain-specific-language only a particular template engine can understand, which means it can't be understood by the target language.
- **Template Engine**: Template engine takes the template code and values gathered from the user to generate new code. Sometimes code generators use their own template engine (like Yeoman does), but sometimes code generators will use an existing template engine to help with adaptability (like Cookiecutter uses Jinja2 for its template engine).

Let's take a look at what is all involved in creating our own template project:

0. You want to create a template project to help you save time in the future.
1. You start with an empty project or if the generator requires a lot of boilerplate, you use a code generate to generate a fresh template project (like using [Yeoman's `generator-generator`](https://github.com/yeoman/generator-generator)).
2. You write the custom template code or adopt existing code into template code.
3. You write the code generator integration code.
4. You use the code generator to test to see if the integration code and template code is working by running it through the code generator.
5. Now you have the generated code, you visually inspect to see if the code is generated correctly.
6. You run or compiles the generated code, to see if it runs and has the functionality you want.
7. Then you repeat step 2-6 until you have the right combination of generator integration code and template code that will generate the project you want.

Once the template project is complete, you use it and it still feels like magic (so you still feel the sweat and tears you put into the template project is still worth it)! However, as soon as you, or someone else realize that the template project needs to be updated, the dread sinks in, because it would mean that they have to go back into template land and repeat the tedious process of writing custom template code, visually check the generated code, and then check the generated code's functionality all over again. This cycle just isn't how we typically develop an application. In my personal experience, my handful of well-intentioned template projects quickly get abandoned.

There are also some inherent issues with a template project. The biggest of which is that template code is not executable code. This means we can't run static code analysis on the template code, or automate the process of regularly checking for outdated dependencies.

## Current State of the World: Example Code

Because of the tedious dev loop of developing our own template project, and other shortcomings, we sometimes would take a different approach: Example code projects. For example, here is [the Azure code samples page](https://learn.microsoft.com/en-us/samples/browse/) which has thousands of code example projects that can help you get started on building essentially anything you want on Azure.

So what would you have to do to develop an example code repo?

0. You have an idea of an example code that you want to replicate in the future.
1. You create a new project (probably from a well-maintained template project).
2. You write the code.
3. You validate the functionality by running the app.
4. You repeat step 2 and 3 until you have the features you want.

It is so much easier to develop an example code project than a template project. However, the friction comes when it's time to use the example code project. You would need to copy the example code, than follow some written instruction to manually change the code to adopt it. This is not fun. There is no magic. And if it doesn't immediately work after you've made the changes, you wouldn't be sure if you made a mistake changing the code or if the wasn't working in the first place.

The nice thing about example code though is that because it's the same code as your "generated" code, if there is a point you'd like to update the example code, it's no mental hurdle because you are updating in the same language as the code you've been writing.

## Recap of the Current State of the World

To recap the pros and cons between Code Generators and Example Code

| Code Generators                  | Example Code          |
| -------------------------------- | --------------------- |
| ✅ Fun to Use (Feels like Magic) | ✅ Fun to Develop     |
| ✅ No manual edits               | ✅ Easy to Validate   |
| ✅ Not Error-Prone               | ✅ Easy to Update     |
| ⛔ Not Fun to Develop            | ✅ Can use dependabot |
| ⛔ Difficult to Validate         | ⛔ Not Magical        |
| ⛔ Difficult to Update           | ⛔ Manual Edits       |
| ⛔ Can’t use dependabot          | ⛔ Error Prone        |

The pros and cons between are perfect inverse of each other. Why can't we have the best of both worlds?

| What if ?               |
| ----------------------- |
| ✅ Fun to Develop       |
| ✅ Easy to Validate     |
| ✅ Easy to Update       |
| ✅ Can use dependabot   |
| ✅ No manual edits      |
| ✅ Not Error-Prone      |
| ✅ Is Language Agnostic |
| ✅ Feels like magic!    |

## A Different Approach

I want to introduce a tool that I created called [UnGen](https://github.com/howlowck/ungen).

This tool gives your line comments a superpower: the ability to change your code.

Simply by tagging your line comments with `UNGEN:` (like you would with a `TODO:`), you've just made your executable code into a living template code.

Here is an example of an UnGen command:

```js
// UNGEN: replace "World" with kebabCase(var.appName)
app.get("/", (req, res) => res.send("Hello World!!"));
```

This command tells UnGen "on the next line, replace any occurrences of the string "World" with the value of a variable called `appName` after transforming it to kebab-case first."

Then when you run the `ungen` cli command:

```terminal
ungen -i . -o new-app -var appName="Haos New App"
```

It will generate your code into a new directory (specified by the `-o` flag) called "new-app". In there you'll find the following generated code:

```js
app.get("/", (req, res) => res.send("Hello haos-test-app!!"));
```

## Using Comments to Transorm your code

The uniqueness of this tool is that it looks at your comments. In other words, it gets out of the way of your source application code.
