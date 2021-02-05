// ==UserScript==
// @name use Local Noto Serif CJK JP
// @namespace https://github.com/yzrsng/userscripts
// @author yzrsng
// @description Userscript to use Local JP Serif font on all websites in Android browser for Android 9 over (maybe).
// @version 0.1.20210205.1
// @include http://*
// @include https://*
// @grant none
// ==/UserScript==

(function() {
  'use strict';

  const setSerifFont = () => {
    const newFontFamilyName = 'Noto Serif CJK JP';
    // const oldFontFamilyNames = [
    //   "Roboto",
    //   "Google Sans",
    //   "Droid Sans",
    //   "MotoyaLMaru",
    //   "MotoyaLCedar",
    //   "Noto Sans JP",
    //   "Noto Sans CJK JP",
    //   "SEC CJK JP",
    //   "Droid Sans Japanese"
    // ]
    const font = new FontFace(newFontFamilyName, `local(${newFontFamilyName})`);
    font.load().then(() => {document.fonts.add(font)});
    const myHead = document.getElementsByTagName('head')[0];
    const myCss = document.createElement('style');
    myCss.id = 'set_serif_font_style';
    myCss.insertAdjacentHTML('beforeend', `
    @font-face {font-family: ${newFontFamilyName}; src: local(${newFontFamilyName});}
    @font-face {font-family: "Roboto"; src: local(${newFontFamilyName});}
    @font-face {font-family: "Google Sans"; src: local(${newFontFamilyName});}
    @font-face {font-family: "Droid Sans"; src: local(${newFontFamilyName});}
    @font-face {font-family: "MotoyaLMaru"; src: local(${newFontFamilyName});}
    @font-face {font-family: "MotoyaLCedar"; src: local(${newFontFamilyName});}
    @font-face {font-family: "Noto Sans JP"; src: local(${newFontFamilyName});}
    @font-face {font-family: "Noto Sans CJK JP"; src: local(${newFontFamilyName});}
    @font-face {font-family: "SEC CJK JP"; src: local(${newFontFamilyName});}
    @font-face {font-family: "Droid Sans Japanese"; src: local(${newFontFamilyName});}
    *:not(pre):not(span):not(code):not(samp){font-family:'USERFONT-${newFontFamilyName}', Charis SIL Compact, Noto Serif CJK JP, Noto Serif, Droid Serif, serif;}
    `);
    myHead.appendChild(myCss);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setSerifFont);
  } else {
    setSerifFont();
  }
})();
