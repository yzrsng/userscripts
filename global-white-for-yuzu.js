// ==UserScript==
// @name Global White Background for Invert Rendering by Yuzu Browser
// @namespace Violentmonkey Scripts
// @author yzrsng
// @description Userscript for Invert Rendering by Yuzu Browser.
// @version 0.1
// @include *
// @match *://*/*
// @grant none
// ==/UserScript==

var css = document.createElement('style');
css.type = "text/css";
css.innerHTML = 'html>body *{background-color:#ffffff80 !important;text-shadow:1px 0px 0 #80808020, 0px -1px 0 #80808020, 1px -1px 0 #80808020}html>body{color:initial !important;background-color:initial !important}button,button *,button[class],button[class] *,p,p *,p[class],p[class] *,h1,h1 *,h1[class],h1[class] *,h2,h2 *,h2[class],h2[class] *,h3,h3 *,h3[class],h3[class] *,h4,h4 *,h4[class],h4[class] *,h5,h5 *,h5[class],h5[class] *,h6,h6 *,h6[class],h6[class] *,input,input *,input[class],input[class] *,label,label *,label[class],label[class] *,li,li *,li[class],li[class] *,span,span *,span[class],span[class] *,thead,thead *,thead[class],thead[class] *,tbody,tbody *,tbody[class],tbody[class] *,tr,tr *,tr[class],tr[class] *,th,th *,th[class],th[class] *,td,td *,td[class],td[class] *,svg,svg *,svg[class],svg[class] *,div,div[class],[class*="text"]{color:#102040e0 !important;background-color:#ffffff40 !important;border-color:#00000020 !important}body blockquote,body blockquote>*,body cite,body cite>*{color:#000000c0 !important;background-color:#ffffff20 !important}body a,body a *,body a[href],body a[href] *,body a[class],body a[class] *,body a[class][href],body a[class][href] *{color:blue !important;background-color:initial !important}body a:visited,body a:visited *,body a[href]:visited,body a[href]:visited *,body a[class]:visited,body a[class]:visited *,body a[class][href]:visited,body a[class][href]:visited *{color:purple !important}';
document.getElementsByTagName('head')[0].appendChild(css);
document.getElementsByTagName("body")[0].setAttribute("bgcolor", "white");
document.getElementsByTagName("body")[0].setAttribute("text", "black");
document.getElementsByTagName("body")[0].setAttribute("alink", "blue");
document.getElementsByTagName("body")[0].setAttribute("link", "blue");
document.getElementsByTagName("body")[0].setAttribute("vlink", "blue");
