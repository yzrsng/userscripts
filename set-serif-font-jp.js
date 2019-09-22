// ==UserScript==
// @name Google japanese serif Script
// @namespace Violentmonkey Scripts
// @author yzrsng
// @description Userscript for Serif Font.
// @version 0.1
// @include http://*
// @include https://*
// @match http://*
// @match https://*
// @grant none
// ==/UserScript==

(function() {
  'use strict';

  const myCss = document.createElement('style');
  myCss.type = "text/css";
  myCss.id = 'set_serif_font_style';
  myCss.insertAdjacentHTML('beforeend', 'html>body *{font-family:"Noto Serif JP","Sawarabi Mincho",sans-serif}');
  document.getElementsByTagName('head')[0].appendChild(myCss);

  const myLink = document.createElement('link');
  myLink.id = 'set_serif_font_link';
  myLink.setAttribute("rel", "stylesheet");
  myLink.setAttribute("href", "https://fonts.googleapis.com/css?family=Noto+Serif+JP|Sawarabi+Mincho&display=swap");
  document.getElementsByTagName('head')[0].appendChild(myLink);
})();
