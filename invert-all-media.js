// ==UserScript==
// @name Invert All Media Script
// @namespace Violentmonkey Scripts
// @author yzrsng
// @description Userscript for Invert Rendering by Yuzu Browser.
// @version 0.1
// @include *
// @match *://*/*
// @grant none
// ==/UserScript==

(function() {
  'use strict';

  let css = document.createElement('style');
  css.type = "text/css";
  css.innerHTML = 'iframe[src*="embed"]:not(.invertedChildren-yz),iframe[data-src*="embed"]:not(.invertedChildren-yz),img:not(.invertedChildren-yz),video:not(.invertedChildren-yz),canvas:not(.invertedChildren-yz),.invertedRoot-yz{-webkit-filter:invert(100%)}';
  document.getElementsByTagName('head')[0].appendChild(css);
  
  // function printElms(elms) {
  //   console.log(elms);
  //   console.log(elms.length);
  // }

  function markChildElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      elms[i].classList.add('patrolled-yz');
      elms[i].classList.add('invertedChildren-yz');
      markChildElms(elms[i].children);
    }
  }

  function invertRootElms(elms) {
    // console.log(elms.length);
    let ssStyle;
    for (let i = 0; i < elms.length; i++) {
      if (elms[i].classList.contains('patrolled-yz')) {
        continue;
      }
      elms[i].classList.add('patrolled-yz');
      ssStyle = window.getComputedStyle(elms[i]);
      if (elms[i].tagName === 'IMG' || elms[i].tagName === 'VIDEO' || elms[i].tagName === 'CANVAS' || ssStyle.getPropertyValue('background-image').match(/url\(/)) {
        elms[i].classList.add('invertedRoot-yz');
        elms[i].style.setProperty("-webkit-filter","invert(100%)","");
        markChildElms(elms[i].children);
      }
    }
  }
  
  let myElms = document.getElementsByTagName('*');
  // invertRootElms(myElms);

  let id = setTimeout(function(){
    invertRootElms(myElms);
  }, 1000);
})();
