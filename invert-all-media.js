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

  let css = document.createElement('style');
  css.type = "text/css";
  css.innerHTML = 'iframe[src*="embed"]:not(.invertedChildren-yz),iframe[data-src*="embed"]:not(.invertedChildren-yz),img:not(.invertedChildren-yz),video:not(.invertedChildren-yz),canvas:not(.invertedChildren-yz),.invertedRoot-yz{-webkit-filter:invert(100%)}';
  document.getElementsByTagName('head')[0].appendChild(css);
  
  // function printElms(elms) {
  //   console.log(elms);
  //   console.log(elms.length);
  // }

  function judgeBgClr(clrValues) {
    for (let i = 0; i < clrValues.length; i++) {
      clrValues[i] = parseInt(clrValues[i],10);
    }
    let judgePoint = clrValues[0]*9 + clrValues[1]*13 + clrValues[2]*8;
    console.log(clrValues + " values");
    console.log(judgePoint + " judge");
    if (judgePoint < 3830) {
      return "255, 255, 255";
    }
    return "0, 0, 0";
  }

  function markChildElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      elms[i].classList.add('invertPatrolled-yz');
      elms[i].classList.add('invertedChildren-yz');
      markChildElms(elms[i].children);
    }
  }

  function invertRootElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      if (elms[i].classList.contains('invertPatrolled-yz')) {
        continue;
      }
      elms[i].classList.add('invertPatrolled-yz');
      if (elms[i].parentNode.classList.contains('invertedChildren-yz')) {
        elms[i].classList.add('invertedChildren-yz');
        markChildElms(elms[i].children);
        continue;
      }
      let ssStyle = window.getComputedStyle(elms[i]);
      let ssStyleBefore = window.getComputedStyle(elms[i], '::before');
      let ssStyleAfter = window.getComputedStyle(elms[i], '::after');
      if (elms[i].tagName === 'IMG' || elms[i].tagName === 'VIDEO' || elms[i].tagName === 'CANVAS' || ssStyle.getPropertyValue('background-image').match(/url\(/) || ssStyleBefore.getPropertyValue('background-image').match(/url\(/) || ssStyleAfter.getPropertyValue('background-image').match(/url\(/)) {
        if (ssStyle.getPropertyValue('background-repeat').match(/-/) || ssStyle.getPropertyValue('background-repeat').match(/space/)) {
          let bgColorValue = ssStyle.getPropertyValue('color');
          bgColorValue = bgColorValue.substring(4,bgColorValue.length-1);
          let clrAry = bgColorValue.split(', ');
          bgColorValue = judgeBgClr(clrAry);
          elms[i].style.setProperty("background-color","rgba(" + bgColorValue + ", 0.75" + ")","");
        }
        elms[i].classList.add('invertedRoot-yz');
        elms[i].style.setProperty("-webkit-filter","invert(100%)","");
        markChildElms(elms[i].children);
      }
    }
  }
  
  let myElms = document.getElementsByTagName('*');

  // invertRootElms(myElms);

  let id = setInterval(function(){
    invertRootElms(myElms);
  }, 1000);
})();
