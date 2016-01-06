+++
author = "Hao Luo"
comments = true
date = "2016-01-05T13:57:34-06:00"
draft = false
image = ""
menu = ""
share = true
slug = "thoughts-on-card-validate"
tags = ["response", "evaluation"]
title = "Thoughts on Card Validate"

+++

I was looking at a small package that I wrote a few years ago, and I think it's a good mental exercise to reevaluate my own code once in a while.

## Background

The purpose of the package is to quickly check for the type of credit card given a small sample (say as a user is typing).  Also validate the credit card again the Luhn algorithm which is the algorithm used by most CC companies.

## Structure
I separated the CardVal object and the Card Class into two separate files, respectively: [main.js](https://github.com/howlowck/card-validate/blob/master/public/js/main.js), and [Card.js](https://github.com/howlowck/card-validate/blob/master/public/js/Card.js).  Main.js also acts as the initialization file.

## What I could have done differently now
The [CardVal object](https://github.com/howlowck/card-validate/blob/master/public/js/main.js#L66) is a simple object.  This made sense when I was first writing the package, because the object acts as a simple singleton.  However, this inhibits the user from modifying various aspects of the CardVal.  For example, if the user's website only accepts Visa, Discover, and Amex, and does not care about the other, there isn't an elegant way to do so (unless overwriting the cards property).

Now I would write the CardVal as a factory method instead of a simple object:

```javascript
function detectTypesFunc(cardNum) {
    ...
}

function validateNumberFunc(cardNum) {
    ...
}

function validationOutputFunc(card) {
    ...
}

var CardValClass = function (options) {
    this.cards = options.cards;
}

CardValClass.prototype.detectType = detectTypesFunc;
CardValClass.prototype.validateNumber = validateNumberFunc;
CardValClass.prototype.validationOutput = validationOutputFunc;

function getCard(cardName) {
  var cardDictionary = {
    visa: visa,
    master: master,
    ...
  }
  return cardDictionary[cardName];
}

// CardVal is now a factory method for instantiating a CardValClass

var CardVal = function (options) {
  options = options || {};

  // Set the default value
  var cardsList = options.cards ||
  ['visa', 'discover', 'jcb', 'amex', 'master', 'diners', 'diners-us'];
  var cards = [];
  options.cards.forEach(function (cardName) {
    cards.push(getCard(cardName));
  });
  return new CardValClass({cards: cards});
}

```

Now, this allows the user to input options.  

```javascript
var CardVal = require('card-validate')({cards: ['visa', 'master']});
```
