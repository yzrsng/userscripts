// ==UserScript==
// @name Static Global White Background for Invert Rendering by Yuzu Browser
// @namespace Violentmonkey Scripts
// @author yzrsng
// @description Userscript for Invert Rendering by Yuzu Browser.
// @version 0.1
// @include http://*
// @include https://*
// @match http://*
// @match https://*
// @grant none
// ==/UserScript==

const invertClass = "inverted-globelWhite";
const css = document.createElement('style');
css.type = "text/css";
css.id = "static_global_white_filter";
css.insertAdjacentHTML('beforeend','html,html>body{color:black !important;background:white !important}html>body *{text-shadow:1px 0px 0 #80808020, 0px -1px 0 #80808020, 1px -1px 0 #80808020}html>body *:not(pre):not(pre *):not(span):not(code):not(samp){background-color:#ffffff80 !important}button,button *:not(pre):not(span):not(code):not(samp),p,p *:not(pre):not(span):not(code):not(samp),h1,h1 *:not(pre):not(span):not(code):not(samp),h2,h2 *:not(pre):not(span):not(code):not(samp),h3,h3 *:not(pre):not(span):not(code):not(samp),h4,h4 *:not(pre):not(span):not(code):not(samp),h5,h5 *:not(pre):not(span):not(code):not(samp),h6,h6 *:not(pre):not(span):not(code):not(samp),input,input *:not(pre):not(span):not(code):not(samp),label,label *:not(pre):not(span):not(code):not(samp),li,li *:not(pre):not(span):not(code):not(samp),thead,thead *:not(pre):not(span):not(code):not(samp),tbody,tbody *:not(pre):not(span):not(code):not(samp),tr,tr *:not(pre):not(span):not(code):not(samp),th,th *:not(pre):not(span):not(code):not(samp),td,td *:not(pre):not(span):not(code):not(samp),svg,svg *:not(pre):not(span):not(code):not(samp),div,div[class]{color:#102040e0 !important;background-color:#ffffff40 !important;border-color:#00000020 !important}span,span[class],code,samp{filter:saturate(2) brightness(0.625);background-color:transparent}body blockquote,body blockquote>*:not(pre):not(span):not(code):not(samp),body cite,body cite>*:not(pre):not(span):not(code):not(samp){color:#000000c0 !important;background-color:#ffffff20 !important}body a,body a *:not(pre):not(span):not(code):not(samp),body a[href],body a[href] *:not(pre):not(span):not(code):not(samp),body a[class],body a[class] *:not(pre):not(span):not(code):not(samp),body a[class][href],body a[class][href] *:not(pre):not(span):not(code):not(samp){color:#c00000 !important;background-color:initial !important}body a:visited,body a:visited *:not(pre):not(span):not(code):not(samp),body a[href]:visited,body a[href]:visited *:not(pre):not(span):not(code):not(samp),body a[class]:visited,body a[class]:visited *:not(pre):not(span):not(code):not(samp),body a[class][href]:visited,body a[class][href]:visited *:not(pre):not(span):not(code):not(samp){color:#c00080 !important}iframe[src*="embed"],iframe[data-src*="embed"],img,embed,video,canvas,*[style*="background-image"]:empty,*[style*=".apng"]:empty,*[style*=".bmp"]:empty,*[style*=".gif"]:empty,*[style*=".ico"]:empty,*[style*=".cur"]:empty,*[style*=".jpg"]:empty,*[style*=".jpeg"]:empty,*[style*=".jfif"]:empty,*[style*=".pjpeg"]:empty,*[style*=".pjp"]:empty,*[style*=".png"]:empty,*[style*=".svg"]:empty,*[style*=".tif"]:empty,*[style*=".tiff"]:empty,*[style*=".webp"]:empty{filter:invert(100%)}');
css.insertAdjacentHTML('beforeend','.' + invertClass + '{filter: invert(1)}');
document.getElementsByTagName('head')[0].appendChild(css);
document.getElementsByTagName("body")[0].setAttribute("bgcolor", "white");
document.getElementsByTagName("body")[0].setAttribute("text", "black");
document.getElementsByTagName("body")[0].setAttribute("alink", "red");
document.getElementsByTagName("body")[0].setAttribute("link", "red");
document.getElementsByTagName("body")[0].setAttribute("vlink", "red");

const twElements = document.getElementsByTagName('*');
for (let i = 0; i < twElements.length; i++) {
  // 多重反転を防ぐために小要素を持たない要素のみ
  if (twElements[i].childElementCount === 0) {
    // 背景画像を設定している要素のみを反転
    if (window.getComputedStyle(twElements[i]).getPropertyValue('background-image').match(/url\(/)) {
      twElements[i].classList.add(invertClass);
    }
  }
}
