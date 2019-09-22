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
  if (yuzubrowserInvertModeStyle !== null) {
    yuzubrowserInvertModeStyle.parentNode.removeChild(yuzubrowserInvertModeStyle);
  }

  const patrolledClass = "invertPatrolledElement-yz";
  const invertClassRoot = "invertedRootElement-yz";
  const invertClassChild = "invertedChildElement-yz";
  const myCss = document.createElement('style');
  myCss.type = "text/css";
  myCss.id = 'dynamic_invert_media_filter';
  myCss.insertAdjacentHTML('beforeend', 'iframe[src*="embed"]:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'iframe[data-src*="embed"]:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'img:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'embed:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'svg:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'video:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', 'canvas:not(.' + invertClassChild + '),');
  myCss.insertAdjacentHTML('beforeend', '.' + invertClassRoot + '{filter:invert(100%)}');
  document.getElementsByTagName('head')[0].appendChild(myCss);

  const invertExistingFilterClass = "invertedFilterElement-yz-";
  let invertExistingFilterCount = 1;

  const judgeBgColorClassWhite = "judgeBgColor-yz-white";
  const judgeBgColorClassBlack = "judgeBgColor-yz-Black";
  myCss.insertAdjacentHTML('beforeend', '.' + judgeBgColorClassWhite + '{background-color:rgba(255, 255, 255, 0.75) !important}');
  myCss.insertAdjacentHTML('beforeend', '.' + judgeBgColorClassBlack + '{background-color:rgba(0, 0, 0, 0.75) !important}');

  const grantedBgColorClass = "grantBgColor-yz-";
  let grantBgColorCount = 1;
  myCss.insertAdjacentHTML('beforeend', '.' + grantedBgColorClass + "0" + '{background-color:white !important}');
  
  // function printElms(elms) {
  //   console.log(elms);
  //   console.log(elms.length);
  // }

  // function judgeBgColor(elm) {
  //   const elmStyle = window.getComputedStyle(elm);
  //   const elmColor = elmStyle.getPropertyValue("color");
  //   const posNumber = elmColor.indexOf("(");
  //   const elmClrValue = elmColor.substring(posNumber+1,elmColor.length-1);
  //   const clrArray = elmClrValue.split(', ');
  //   for (let i = 0; i < clrArray.length; i++) {
  //     clrArray[i] = parseInt(clrArray[i], 10);
  //   }
  //   const judgePoint = clrArray[0]*9 + clrArray[1]*13 + clrArray[2]*8;
  //   if (judgePoint < 3830) {
  //     elm.classList.add(judgeBgColorClassWhite);
  //   } else {
  //     elm.classList.add(judgeBgColorClassWhite);
  //   }
  // }

  function returnParentsBgColor(elm) {
    const parentElmStyle = window.getComputedStyle(elm.parentNode);
    const parentElmBgColor = parentElmStyle.getPropertyValue("background-color");
    if (parentElmBgColor === "rgba(0, 0, 0, 0)") {
      if (elm.parentNode.tagName === "HTML") {
        return "rgb(0, 0, 0)";
      }
      return returnParentsBgColor(elm.parentNode);
    }
    return parentElmBgColor;
  }

  function markChildElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      elms[i].classList.add(patrolledClass);
      elms[i].classList.add(invertClassChild);
      markChildElms(elms[i].children);
    }
  }

  function invertRootElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      if (elms[i].classList.contains(patrolledClass)) {
        continue;
      }
      elms[i].classList.add(patrolledClass);
      if (elms[i].tagName !== "HTML") {
        if (elms[i].parentNode.classList.contains(invertClassChild)) {
          elms[i].classList.add(invertClassChild);
          markChildElms(elms[i].children);
          continue;
        }
      }
      const ssStyle = window.getComputedStyle(elms[i]);
      const ssStyleBefore = window.getComputedStyle(elms[i], '::before');
      const ssStyleAfter = window.getComputedStyle(elms[i], '::after');
      if (ssStyle.getPropertyValue('background-image').match(/url\(/) || ssStyleBefore.getPropertyValue('background-image').match(/url\(/) || ssStyleAfter.getPropertyValue('background-image').match(/url\(/) || elms[i].tagName === 'IMG' || elms[i].tagName === 'EMBED' || elms[i].tagName === 'SVG' || elms[i].tagName === 'VIDEO' || elms[i].tagName === 'CANVAS') {
        // if (ssStyle.getPropertyValue('background-repeat').match(/-/) || ssStyle.getPropertyValue('background-repeat').match(/space/)) {
        //   // judgeBgColor(elms[i]);
        //   elms[i].classList.add(grantedBgColorClass + grantBgColorCount);
        //   myCss.insertAdjacentHTML('beforeend', "." + grantedBgColorClass + grantBgColorCount + "{background-color:" + returnParentsBgColor(elms[i]) + " !important}");
        //   grantBgColorCount++;
        // }
        if (ssStyle.getPropertyValue('background-color') === "rgba(0, 0, 0, 0)" && elms[i].childNodes.length !== 0) {
          // judgeBgColor(elms[i]);
          elms[i].classList.add(grantedBgColorClass + grantBgColorCount);
          myCss.insertAdjacentHTML('beforeend', "." + grantedBgColorClass + grantBgColorCount + "{background-color:" + returnParentsBgColor(elms[i]) + " !important}");
          grantBgColorCount++;
        }
        const filterValue = ssStyle.getPropertyValue('filter');
        if (filterValue !== "none") {
          elms[i].classList.add(invertExistingFilterClass + invertExistingFilterCount);
          myCss.insertAdjacentHTML('beforeend', "." + invertExistingFilterClass + invertExistingFilterCount + "{filter:" + filterValue + " invert(1)" + "}");
          invertExistingFilterCount++;
        } else {
          elms[i].classList.add(invertClassRoot);
        }
        if (elms[i].children.length === 0) {
          continue;
        }
        markChildElms(elms[i].children);
      }
    }
  }
  
  const myElms = document.getElementsByTagName('*');

  if (window.getComputedStyle(myElms[0]).getPropertyValue('background-color') === "rgba(0, 0, 0, 0)") {
    myCss.insertAdjacentHTML('beforeend', "html{background-color:white}");
  }

  // invertRootElms(myElms);

  const id = setInterval(function(){
    invertRootElms(myElms);
  }, 2000);
})();
