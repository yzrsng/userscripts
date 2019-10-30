// ==UserScript==
// @name set Noto Serif JP
// @namespace https://github.com/yzrsng/userscripts
// @author yzrsng
// @description Userscript for Serif Font.
// @version 0.1
// @include http://*
// @include https://*
// @grant none
// ==/UserScript==

(function() {
  'use strict';

  const setSerifFont = () => {
    const myHead = document.getElementsByTagName('head')[0];
    const myCss = document.createElement('style');
    myCss.type = "text/css";
    myCss.id = 'set_serif_font_style';
    myCss.insertAdjacentHTML('beforeend', "*:not(pre):not(span):not(code):not(samp){font-family:'Noto Serif JP',serif;}");
    myHead.appendChild(myCss);
  
    const myLink = document.createElement('link');
    myLink.id = 'set_serif_font_link';
    myLink.setAttribute("rel", "stylesheet");
    myLink.setAttribute("href", "https://fonts.googleapis.com/css?family=Noto+Serif+JP&display=swap&subset=japanese");
    myHead.appendChild(myLink);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setSerifFont);
  } else {
    setSerifFont();
  }
})();
