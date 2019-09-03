// ==UserScript==
// @name Bottom Bar on Twitter for Android Browser
// @namespace Violentmonkey Scripts
// @author euser
// @description Userscript on twitter for your Android phone.
// @version 0.1
// @include *://mobile.twitter.com/*
// @match *://mobile.twitter.com/*
// @grant none
// ==/UserScript==

var cssB = document.createElement('style');
cssB.type = "text/css";
cssB.innerHTML = 'header>div{height:49px !important}header>div:nth-of-type(2)>div:first-of-type>div>div>div>div{border-bottom-width:1px !important;border-bottom-color:#70809040 !important}header>div>div>div>nav{position:fixed !important;bottom:0 !important}header>div>div>div>nav>a{border-bottom-color:transparent!important}aside[role="complementary"]>div{bottom:67px}div#react-root>div[data-reactroot]>div>div>div,div#react-root>div[data-reactroot]>div>div>div>aside[role="complementary"],div#react-root>div[data-reactroot]>div>div>div>aside[role="complementary"]>div,div#react-root>div[data-reactroot]>div>div>div>aside[role="complementary"]>div>div[role="button"]>div[dir="auto"]{background-color:transparent !important}';
document.getElementsByTagName('head')[0].appendChild(cssB);
