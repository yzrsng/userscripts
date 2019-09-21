// ==UserScript==
// @name Dynamic Invert All Media Script
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
  
  // remove build in filter for Invert mode on Yuzu Browser
  const yuzubrowserInvertModeStyle = document.getElementById('yuzubrowser_invert_mode');
  console.log(yuzubrowserInvertModeStyle);
  console.log(typeof yuzubrowserInvertModeStyle);
  if (yuzubrowserInvertModeStyle !== null) {
    yuzubrowserInvertModeStyle.parentNode.removeChild(yuzubrowserInvertModeStyle);
  }

  const patrolledClass = "invertPatrolledElement-yz";
  const InvertClassRoot = "invertedRootElement-yz";
  const InvertClassChild = "invertedChildElement-yz";
  const myCss = document.createElement('style');
  myCss.type = "text/css";
  myCss.id = 'dynamic_invert_media_filter';
  myCss.insertAdjacentHTML('beforeend', 'iframe[src*="embed"]:not(.' + InvertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'iframe[data-src*="embed"]:not(.' + InvertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'img:not(.' + InvertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'video:not(.' + InvertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'canvas:not(.' + InvertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', '.' + InvertClassRoot + '{filter:invert(100%)}');
  document.getElementsByTagName('head')[0].appendChild(myCss);
  
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

  let grantBgColorCount = 0;
  function returnParentsBgColor(elm) {
    console.log("grantBgColorCount: "+ ++grantBgColorCount);
    myCss.insertAdjacentHTML('beforeend', "");
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
      elms[i].classList.add(patrolledClass);
      elms[i].classList.add(InvertClassChild);
      markChildElms(elms[i].children);
    }
  }

  function invertRootElms(elms) {
    if (window.getComputedStyle(elms[0]).getPropertyValue('background-color') === "rgba(0, 0, 0, 0)") {
      elms[0].style.setProperty("background-color", "rgb(255, 255, 255)", "");
    }
    for (let i = 0; i < elms.length; i++) {
      if (elms[i].classList.contains(patrolledClass)) {
        continue;
      }
      elms[i].classList.add(patrolledClass);
      if (elms[i].tagName !== "HTML") {
        if (elms[i].parentNode.classList.contains(InvertClassChild)) {
          elms[i].classList.add(InvertClassChild);
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
        elms[i].classList.add(InvertClassRoot);
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
