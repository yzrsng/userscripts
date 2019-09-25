// ==UserScript==
// @name set Noto Serif JP
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

(function(){"use strict";const n=document.createElement("style");n.type="text/css";n.id="set_serif_font_style";n.insertAdjacentHTML("beforeend","*:not(pre):not(span):not(code):not(samp){font-family:'Noto Serif JP',serif;}");document.getElementsByTagName("head")[0].appendChild(n);const t=document.createElement("link");t.id="set_serif_font_link";t.setAttribute("rel","stylesheet");t.setAttribute("href","https://fonts.googleapis.com/css?family=Noto+Serif+JP&display=swap&subset=japanese");document.getElementsByTagName("head")[0].appendChild(t)})()
