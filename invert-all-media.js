// ==UserScript==
// @name Invert All Media Script
// @namespace Violentmonkey Scripts
// @author yzrsng
// @description Userscript for Invert Rendering. 背景画像を含むメディアを反転させるスクリプト。
// @version 0.1
// @include *
// @match *://*/*
// @grant none
// ==/UserScript==

(function() {
  'use strict';

  const css = document.createElement('style');
  css.type = "text/css";
  css.innerHTML = 'iframe[src*="embed"]:not(.invertedChildren-yz),iframe[data-src*="embed"]:not(.invertedChildren-yz),img:not(.invertedChildren-yz),video:not(.invertedChildren-yz),canvas:not(.invertedChildren-yz),.invertedRoot-yz{filter:invert(100%)}';
  document.getElementsByTagName('head')[0].appendChild(css);
  
  // function printElms(elms) {
  //   console.log(elms);
  //   console.log(elms.length);
  // }

  function returnJudgeBgColor(elm) {
    const elmStyle = window.getComputedStyle(elm);
    const elmColor = elmStyle.getPropertyValue("color");
    const posNumber = elmColor.indexOf("(");
    const elmClrValue = elmColor.substring(posNumber+1,elmColor.length-1);
    const clrArray = elmClrValue.split(', ');
    for (let i = 0; i < clrArray.length; i++) {
      clrArray[i] = parseInt(clrArray[i], 10);
    }
    const judgePoint = clrArray[0]*9 + clrArray[1]*13 + clrArray[2]*8;
    if (judgePoint < 3830) {
      return "rgba(255, 255, 255, 0.75)";
    }
    return "rgba(0, 0, 0, 0.75)";
  }

  function returnParentsBgColor(elm) {
    const elmStyle = window.getComputedStyle(elm);
    const elmBgColor = elmStyle.getPropertyValue("background-color");
    if (elmBgColor === "rgba(0, 0, 0, 0)") {
      if (elm.tagName === "HTML") {
        return "rgb(0, 0, 0)";
      }
      return returnParentsBgColor(elm.parentNode);
    }
    return elmBgColor;
  }

  function markChildElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      elms[i].classList.add('invertPatrolled-yz');
      elms[i].classList.add('invertedChildren-yz');
      markChildElms(elms[i].children);
    }
  }

  function invertRootElms(elms) {
    if (window.getComputedStyle(elms[0]).getPropertyValue('background-color') === "rgba(0, 0, 0, 0)") {
      elms[0].style.setProperty("background-color", "rgb(255, 255, 255)", "");
    }
    for (let i = 0; i < elms.length; i++) {
      if (elms[i].classList.contains('invertPatrolled-yz')) {
        continue;
      }
      elms[i].classList.add('invertPatrolled-yz');
      if (elms[i].tagName !== "HTML") {
        if (elms[i].parentNode.classList.contains('invertedChildren-yz')) {
          elms[i].classList.add('invertedChildren-yz');
          markChildElms(elms[i].children);
          continue;
        }
      }
      const ssStyle = window.getComputedStyle(elms[i]);
      const ssStyleBefore = window.getComputedStyle(elms[i], '::before');
      const ssStyleAfter = window.getComputedStyle(elms[i], '::after');
      if (elms[i].tagName === 'IMG' || elms[i].tagName === 'VIDEO' || elms[i].tagName === 'CANVAS' || ssStyle.getPropertyValue('background-image').match(/url\(/) || ssStyleBefore.getPropertyValue('background-image').match(/url\(/) || ssStyleAfter.getPropertyValue('background-image').match(/url\(/)) {
        // if (ssStyle.getPropertyValue('background-repeat').match(/-/) || ssStyle.getPropertyValue('background-repeat').match(/space/)) {
        //   // elms[i].style.setProperty("background-color", returnJudgeBgColor(elms[i]), "");
        //   elms[i].style.setProperty("background-color", returnParentsBgColor(elms[i]), "");
        // }
        if (ssStyle.getPropertyValue('background-color') === "rgba(0, 0, 0, 0)" && elms[i].childNodes.length !== 0) {
          // elms[i].style.setProperty("background-color", returnJudgeBgColor(elms[i]), "");
          elms[i].style.setProperty("background-color", returnParentsBgColor(elms[i]), "");
        }
        elms[i].classList.add('invertedRoot-yz');
        elms[i].style.setProperty("filter","invert(100%)","");
        if (elms[i].children.length === 0) {
          continue;
        }
        markChildElms(elms[i].children);
      }
    }
  }
  
  const myElms = document.getElementsByTagName('*');

  // invertRootElms(myElms);

  const id = setInterval(function(){
    invertRootElms(myElms);
  }, 1000);
})();
