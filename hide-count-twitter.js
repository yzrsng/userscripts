// ==UserScript==
// @name hide count twitter
// @namespace hide-twitter-count
// @author yzrsng
// @description Userscript for hide count on twitter.
// @version 0.1
// @include https://twitter.com/*
// @include https://mobile.twitter.com/*
// @grant none
// ==/UserScript==

(function() {
  'use strict';

  const myCss = document.createElement('style');
  myCss.type = "text/css";
  myCss.id = 'hide-twitter-count';
  myCss.insertAdjacentHTML('beforeend', `
a[href$="following"] > span:first-of-type,
a[href$="followers"] > span:first-of-type,

div[data-testid="like"] > div > div > span,
div[data-testid="unlike"] > div > div > span,
div[data-testid="retweet"] > div > div > span,
div[data-testid="unretweet"] > div > div > span,

article[role="article"] > div > div > div > a[href$="likes"] > div > span,
article[role="article"] > div > div > div > a[href$="retweets"] > div > span {
  visibility: hidden;
}
`);
  document.getElementsByTagName('head')[0].appendChild(myCss);
})();
