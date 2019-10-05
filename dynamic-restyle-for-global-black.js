// ==UserScript==
// @name Dynamic Restyle Script for Global Black
// @namespace drs4gb
// @author yzrsng
// @description Userscript to change color on website. The performance of this script is very low.
// @version 0.20191005.2
// @include http://*
// @include https://*
// @exclude https://www.deviantart.com/*
// @exclude https://twitter.com/*
// @exclude https://mobile.twitter.com/*
// @exclude https://store.steampowered.com/*
// @grant none
// ==/UserScript==

/*
ウェブページの要素の増減を検知して動的に色を変更する。
パフォーマンスが悪い。
ウェブページの変化を確認する間隔はsetTimeoutで指定。標準は1.0秒。

色はRGBからHSVに変換していじっている。背景色の明るさは鮮やかさに比例するようにした。
画像の上の文字が色の変更で判別できなくなると困るので黒い縁取り文字にした。
背景色の変化で画像が判別できなくなると困るので後光が指すようにした。
*/

(function(){
  'use strict';
  const scriptName = "drs4gb";
  const cssId = `userscript-${scriptName}`;
  // const commonDataName = `data-${cssId}`;
  // const commonCssVariableName = `--${cssId}`;

  const dataSkipMath = `data-${cssId}-math`;
  const dataEnableFcolorVisited = `data-${cssId}-enable-fcolor-visited`;
  const dataEnableTextShadow = `data-${cssId}-enable-textshadow`;

  const dataOriginFcolor = `data-${cssId}-origin-fcolor`;
  const dataOriginBgcolor = `data-${cssId}-origin-bgcolor`;
  const dataOriginBgimage = `data-${cssId}-origin-bgimage`;
  const dataOriginFilters = `data-${cssId}-origin-filters`;
  const dataOriginFilterColor = `data-${cssId}-origin-filter-color`;

  const cssVariableFcolor = `--${cssId}-fcolor`;
  const cssVariableFcolorVisited = `--${cssId}-fcolor-visited`;
  const cssVariableBgcolor = `--${cssId}-bgcolor`;
  const cssVariableBgimage = `--${cssId}-bgimage`;
  const cssVariableOriginFilters = `--${cssId}-origin-filters`;
  const cssVariableFilterColor = `--${cssId}-filter-color`;
  const cssVariableTextShadow = 'rgba(0, 0, 0, 0.5)';
  const head = document.getElementsByTagName('head')[0];
  const css = document.createElement('style');
  css.type = "text/css";
  css.id = cssId;
  css.insertAdjacentHTML('beforeend', String.raw`
:root {
  background-color: black;
}
* {
  scrollbar-color: #2a2c2e #1c1e1f;
}
::-webkit-scrollbar {
  background-color: #1c1e1f;
  color: #c5c1b9;
}
::-webkit-scrollbar-corner {
  background-color: #181a1b;
}
::-webkit-scrollbar-thumb {
  background-color: #2a2c2e;
}
[${dataOriginFcolor}], [${dataOriginFcolor}]::placeholder {
  color: var(${cssVariableFcolor}) !important;
}
[${dataEnableFcolorVisited}]:visited, [${dataEnableFcolorVisited}]:visited * {
  color: var(${cssVariableFcolorVisited}) !important;
}
[${dataOriginBgcolor}] {
  background-color: var(${cssVariableBgcolor}) !important;
}
[${dataOriginBgimage}] {
  background-image: var(${cssVariableBgimage}) !important;
}
[${dataEnableTextShadow}], [${dataEnableTextShadow}] * {
  text-shadow: ${cssVariableTextShadow} -1px 1px 0px, ${cssVariableTextShadow} 0px 1px 0px,  ${cssVariableTextShadow} 1px 1px 0px, ${cssVariableTextShadow} -1px 0px 0px, ${cssVariableTextShadow} 1px 0px 0px, ${cssVariableTextShadow} -1px -1px 0px, ${cssVariableTextShadow} 0px -1px 0px, ${cssVariableTextShadow} 1px -1px 0px !important;
}
[${dataOriginFilters}] {
  background-color: rgba(0, 0, 0, 0) !important;
  filter: var(${cssVariableOriginFilters}) drop-shadow(0px 0px 1px var(${cssVariableFilterColor})) !important;
}`);

  const cssColorNamesTable = [
    ["black", "rgb(0, 0, 0)"], // CSS1
    ["silver", "rgb(192, 192, 192)"],
    ["gray", "rgb(128, 128, 128)"],
    ["white", "rgb(255, 255, 255)"],
    ["maroon", "rgb(128, 0, 0)"],
    ["red", "rgb(255, 0, 0)"],
    ["purple", "rgb(128, 0, 128)"],
    ["fuchsia", "rgb(255, 0, 255)"],
    ["green", "rgb(0, 128, 0)"],
    ["lime", "rgb(0, 255, 0)"],
    ["olive", "rgb(128, 128, 0)"],
    ["yellow", "rgb(255, 255, 0)"],
    ["navy", "rgb(0, 0, 128)"],
    ["blue", "rgb(0, 0, 255)"],
    ["teal", "rgb(0, 128, 128)"],
    ["aqua", "rgb(0, 255, 255)"],
    ["orange", "rgb(255, 165, 0)"], // CSS2
    ["aliceblue", "rgb(240, 248, 255)"], // CSS3
    ["antiquewhite", "rgb(250, 235, 215)"],
    ["aquamarine", "rgb(127, 255, 212)"],
    ["azure", "rgb(240, 255, 255)"],
    ["beige", "rgb(245, 245, 220)"],
    ["bisque", "rgb(255, 228, 196)"],
    ["blanchedalmond", "rgb(255, 235, 205)"],
    ["blueviolet", "rgb(138, 43, 226)"],
    ["brown", "rgb(165, 42, 42)"],
    ["burlywood", "rgb(222, 184, 135)"],
    ["cadetblue", "rgb(95, 158, 160)"],
    ["chartreuse", "rgb(127, 255, 0)"],
    ["chocolate", "rgb(210, 105, 30)"],
    ["coral", "rgb(255, 127, 80)"],
    ["cornflowerblue", "rgb(100, 149, 237)"],
    ["cornsilk", "rgb(255, 248, 220)"],
    ["crimson", "rgb(220, 20, 60)"],
    ["cyan", "rgb(0, 255, 255)"],
    ["darkblue", "rgb(0, 0, 139)"],
    ["darkcyan", "rgb(0, 139, 139)"],
    ["darkgoldenrod", "rgb(184, 134, 11)"],
    ["darkgray", "rgb(169, 169, 169)"],
    ["darkgreen", "rgb(0, 100, 0)"],
    ["darkgrey", "rgb(169, 169, 169)"],
    ["darkkhaki", "rgb(189, 183, 107)"],
    ["darkmagenta", "rgb(139, 0, 139)"],
    ["darkolivegreen", "rgb(85, 107, 47)"],
    ["darkorange", "rgb(255, 140, 0)"],
    ["darkorchid", "rgb(153, 50, 204)"],
    ["darkred", "rgb(139, 0, 0)"],
    ["darksalmon", "rgb(233, 150, 122)"],
    ["darkseagreen", "rgb(143, 188, 143)"],
    ["darkslateblue", "rgb(72, 61, 139)"],
    ["darkslategray", "rgb(47, 79, 79)"],
    ["darkslategrey", "rgb(47, 79, 79)"],
    ["darkturquoise", "rgb(0, 206, 209)"],
    ["darkviolet", "rgb(148, 0, 211)"],
    ["deeppink", "rgb(255, 20, 147)"],
    ["deepskyblue", "rgb(0, 191, 255)"],
    ["dimgray", "rgb(105, 105, 105)"],
    ["dimgrey", "rgb(105, 105, 105)"],
    ["dodgerblue", "rgb(30, 144, 255)"],
    ["firebrick", "rgb(178, 34, 34)"],
    ["floralwhite", "rgb(255, 250, 240)"],
    ["forestgreen", "rgb(34, 139, 34)"],
    ["gainsboro", "rgb(220, 220, 220)"],
    ["ghostwhite", "rgb(248, 248, 255)"],
    ["gold", "rgb(255, 215, 0)"],
    ["goldenrod", "rgb(218, 165, 32)"],
    ["greenyellow", "rgb(173, 255, 47)"],
    ["grey", "rgb(128, 128, 128)"],
    ["honeydew", "rgb(240, 255, 240)"],
    ["hotpink", "rgb(255, 105, 180)"],
    ["indianred", "rgb(205, 92, 92)"],
    ["indigo", "rgb(75, 0, 130)"],
    ["ivory", "rgb(255, 255, 240)"],
    ["khaki", "rgb(240, 230, 140)"],
    ["lavender", "rgb(230, 230, 250)"],
    ["lavenderblush", "rgb(255, 240, 245)"],
    ["lawngreen", "rgb(124, 252, 0)"],
    ["lemonchiffon", "rgb(255, 250, 205)"],
    ["lightblue", "rgb(173, 216, 230)"],
    ["lightcoral", "rgb(240, 128, 128)"],
    ["lightcyan", "rgb(224, 255, 255)"],
    ["lightgoldenrodyellow", "rgb(250, 250, 210)"],
    ["lightgray", "rgb(211, 211, 211)"],
    ["lightgreen", "rgb(144, 238, 144)"],
    ["lightgrey", "rgb(211, 211, 211)"],
    ["lightpink", "rgb(255, 182, 193)"],
    ["lightsalmon", "rgb(255, 160, 122)"],
    ["lightseagreen", "rgb(32, 178, 170)"],
    ["lightskyblue", "rgb(135, 206, 250)"],
    ["lightslategray", "rgb(119, 136, 153)"],
    ["lightslategrey", "rgb(119, 136, 153)"],
    ["lightsteelblue", "rgb(176, 196, 222)"],
    ["lightyellow", "rgb(255, 255, 224)"],
    ["limegreen", "rgb(50, 205, 50)"],
    ["linen", "rgb(250, 240, 230)"],
    ["magenta", "rgb(255, 0, 255)"],
    ["mediumaquamarine", "rgb(102, 205, 170)"],
    ["mediumblue", "rgb(0, 0, 205)"],
    ["mediumorchid", "rgb(186, 85, 211)"],
    ["mediumpurple", "rgb(147, 112, 219)"],
    ["mediumseagreen", "rgb(60, 179, 113)"],
    ["mediumslateblue", "rgb(123, 104, 238)"],
    ["mediumspringgreen", "rgb(0, 250, 154)"],
    ["mediumturquoise", "rgb(72, 209, 204)"],
    ["mediumvioletred", "rgb(199, 21, 133)"],
    ["midnightblue", "rgb(25, 25, 112)"],
    ["mintcream", "rgb(245, 255, 250)"],
    ["mistyrose", "rgb(255, 228, 225)"],
    ["moccasin", "rgb(255, 228, 181)"],
    ["navajowhite", "rgb(255, 222, 173)"],
    ["oldlace", "rgb(253, 245, 230)"],
    ["olivedrab", "rgb(107, 142, 35)"],
    ["orangered", "rgb(255, 69, 0)"],
    ["orchid", "rgb(218, 112, 214)"],
    ["palegoldenrod", "rgb(238, 232, 170)"],
    ["palegreen", "rgb(152, 251, 152)"],
    ["paleturquoise", "rgb(175, 238, 238)"],
    ["palevioletred", "rgb(219, 112, 147)"],
    ["papayawhip", "rgb(255, 239, 213)"],
    ["peachpuff", "rgb(255, 218, 185)"],
    ["peru", "rgb(205, 133, 63)"],
    ["pink", "rgb(255, 192, 203)"],
    ["plum", "rgb(221, 160, 221)"],
    ["powderblue", "rgb(176, 224, 230)"],
    ["rosybrown", "rgb(188, 143, 143)"],
    ["royalblue", "rgb(65, 105, 225)"],
    ["saddlebrown", "rgb(139, 69, 19)"],
    ["salmon", "rgb(250, 128, 114)"],
    ["sandybrown", "rgb(244, 164, 96)"],
    ["seagreen", "rgb(46, 139, 87)"],
    ["seashell", "rgb(255, 245, 238)"],
    ["sienna", "rgb(160, 82, 45)"],
    ["skyblue", "rgb(135, 206, 235)"],
    ["slateblue", "rgb(106, 90, 205)"],
    ["slategray", "rgb(112, 128, 144)"],
    ["slategrey", "rgb(112, 128, 144)"],
    ["snow", "rgb(255, 250, 250)"],
    ["springgreen", "rgb(0, 255, 127)"],
    ["steelblue", "rgb(70, 130, 180)"],
    ["tan", "rgb(210, 180, 140)"],
    ["thistle", "rgb(216, 191, 216)"],
    ["tomato", "rgb(255, 99, 71)"],
    ["turquoise", "rgb(64, 224, 208)"],
    ["violet", "rgb(238, 130, 238)"],
    ["wheat", "rgb(245, 222, 179)"],
    ["whitesmoke", "rgb(245, 245, 245)"],
    ["yellowgreen", "rgb(154, 205, 50)"],
    ["rebeccapurple", "rgb(102, 51, 153)"] // CSS4
  ]; // https://developer.mozilla.org/ja/docs/Web/CSS/color_value

  const printInfo = (messageStr) => {
    console.info(scriptName + " INFO: " + messageStr);
  };

  const printError = (messageStr) => {
    console.error(scriptName + " ERROR: " + messageStr);
  };

  function returnParentsBgColor(elm) {
    const parentElmStyle = window.getComputedStyle(elm.parentNode);
    const parentElmBgColor = parentElmStyle.getPropertyValue("background-color");
    if (parentElmBgColor === "rgba(0, 0, 0, 0)") {
      if (elm.parentNode.tagName === "HTML") {
        return "rgb(255, 255, 255)";
      }
      return returnParentsBgColor(elm.parentNode);
    }
    return parentElmBgColor;
  }

  // from https://qiita.com/S__Minecraft/items/cb423553cc9a2e26c0b9
  const replaceAll = (str, before, after) => {
    var i = str.indexOf(before);
    if (i === -1) return str;
    var result = str.slice(0, i) + after;
    var j = str.indexOf(before, i+before.length);
    while (j !== -1) {
      result += str.slice(i+before.length, j) + after;
      i = j;
      j = str.indexOf(before, i+before.length);
    }
    return result + str.slice(i+before.length);
  };
  
  const rgbToHsv = (rgbAry) => {
    if (rgbAry.length > 3) {
      rgbAry.length = 3;
    }
    if (isNaN(rgbAry[0]) || isNaN(rgbAry[1]) || isNaN(rgbAry[2])) {
      printError("NaN in RGB");
      return [362, 255, 255];
    }
    const rgbMax = Math.max(...rgbAry);
    const rgbMin = Math.min(...rgbAry);
    let hsvAry = new Array(3);

    const calcHuePart = (clr1, clr2) => {
      return 60 * (clr1 - clr2) / (rgbMax - rgbMin);
    };
    if (rgbAry[0] === rgbAry[1] && rgbAry[0] === rgbAry[2]) {
      hsvAry[0] = 361; // 未定義のため異常な数値を代入
    } else if (rgbAry[0] >= rgbAry[1] && rgbAry[0] >= rgbAry[2]) {
      hsvAry[0] = calcHuePart(rgbAry[1], rgbAry[2]);
    } else if (rgbAry[1] >= rgbAry[0] && rgbAry[1] >= rgbAry[2]) {
      hsvAry[0] = calcHuePart(rgbAry[2], rgbAry[0]) + 120;
    } else if (rgbAry[2] >= rgbAry[0] && rgbAry[2] >= rgbAry[1]) {
      hsvAry[0] = calcHuePart(rgbAry[0], rgbAry[1]) + 240;
    } else {
      printError("RGBからHSVへの変換のHの計算で意図しない動作");
      hsvAry[0] = 362;
    }
    if (hsvAry[0] < 0) { // Hueの値がマイナスなら360を加算して0~360の範囲に収める
      hsvAry[0] += 360;
    }
    if (rgbMax === 0) { // 0除算エラー防止
      hsvAry[1] = 0;
    } else {
      hsvAry[1] = (rgbMax - rgbMin) * 255 / rgbMax;
    }
    hsvAry[2] = rgbMax;
    return hsvAry;
  }

  const hsvToRgb = (hsvAry) => {
    let rgbAry = new Array(3);
    const hsvMax = hsvAry[2];
    const hsvMin = hsvMax - Math.round(hsvAry[1] / 255 * hsvMax);
    if (hsvAry[0] > 360) { // Hueは360以下が正常
      rgbAry[0] = hsvMax;
      rgbAry[1] = hsvMax;
      rgbAry[2] = hsvMax;
    } else if (0 <= hsvAry[0] && hsvAry[0] <= 60) {
      rgbAry[0] = hsvMax;
      rgbAry[1] = Math.round(hsvAry[0] / 60 * (hsvMax - hsvMin)) + hsvMin;
      rgbAry[2] = hsvMin;
    } else if (60 < hsvAry[0] && hsvAry[0] <= 120) {
      rgbAry[0] = Math.round((120 - hsvAry[0]) / 60 * (hsvMax - hsvMin)) + hsvMin;
      rgbAry[1] = hsvMax;
      rgbAry[2] = hsvMin;
    } else if (120 < hsvAry[0] && hsvAry[0] <= 180) {
      rgbAry[0] = hsvMin;
      rgbAry[1] = hsvMax;
      rgbAry[2] = Math.round((hsvAry[0] - 120) / 60 * (hsvMax - hsvMin)) + hsvMin;
    } else if (180 < hsvAry[0] && hsvAry[0] <= 240) {
      rgbAry[0] = hsvMin;
      rgbAry[1] = Math.round((240 - hsvAry[0]) / 60 * (hsvMax - hsvMin)) + hsvMin;
      rgbAry[2] = hsvMax;
    } else if (240 < hsvAry[0] && hsvAry[0] <= 300) {
      rgbAry[0] = Math.round((hsvAry[0] - 240) / 60 * (hsvMax - hsvMin)) + hsvMin;
      rgbAry[1] = hsvMin;
      rgbAry[2] = hsvMax;
    } else if (300 < hsvAry[0] && hsvAry[0] <= 360) {
      rgbAry[0] = hsvMax;
      rgbAry[1] = hsvMin;
      rgbAry[2] = Math.round((360 - hsvAry[0]) / 60 * (hsvMax - hsvMin)) + hsvMin;
    } else {
      printError("HSVからRGBへの変換で意図しない動作");
      rgbAry[0] = rgbAry[1] = rgbAry[2] = 0;
    }
    return rgbAry;
  }

  const ToNumForDecClr = (clrAry) => {
    let numAry = new Array(3);
    for (let i = 0; i < 3; i++) {
      numAry[i] = parseInt(clrAry[i], 10);
    }
    return numAry;
  }

  const toAryForDecClr = (clrStr) => {
    const clrValue = clrStr.substring(clrStr.indexOf("(", 3)+1,clrStr.length-1);
    const clrArray = clrValue.split(', ');
    return clrArray;
  }

  const changeAlphaColor = (elmColor, alphaValue) => {
    const clrArray = toAryForDecClr(elmColor);
    return `rgba(${clrArray[0]}, ${clrArray[1]}, ${clrArray[2]}, ${alphaValue})`;
  }

  const returnNewFrontColor = (elmColor) => {
    const tmpRgbArray = toAryForDecClr(elmColor);
    const hsvAry = rgbToHsv(ToNumForDecClr(tmpRgbArray));
    // 色相を変更
    if (hsvAry[0] <= 360) { // Hueは360以下が正常
      hsvAry[0] -= 15;
      if (hsvAry[0] < 0) {
        hsvAry[0] += 360;
      }
    }
    hsvAry[1] += Math.round((16 - hsvAry[1]) * 1 / 3); // 鮮やかさ
    // hsvAry[1] = Math.round((hsvAry[1])*hsvAry[2] / 255); // 鮮やかさ
    hsvAry[2] += Math.round((255 - hsvAry[2]) * 3 / 4); // 明るさ

    const rgbAry = hsvToRgb(hsvAry);
    if (tmpRgbArray.length === 4) {
      return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
    }
    return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
  };

  const returnNewVisitedColor = (elmColor) => {
    const tmpRgbArray = toAryForDecClr(elmColor);
    const hsvAry = rgbToHsv(ToNumForDecClr(tmpRgbArray));
    // 色相を変更
    if (hsvAry[0] <= 360) { // Hueは360以下が正常
      hsvAry[0] -= 330;
      if (hsvAry[0] < 0) {
        hsvAry[0] += 360;
      }
    }
    hsvAry[2] = Math.round(hsvAry[2] * 3 / 4); // 明るさ

    const rgbAry = hsvToRgb(hsvAry);
    if (tmpRgbArray.length === 4) {
      return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
    }
    return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
  };

  const returnNewBackColor = (elmColor) => {
    const tmpRgbArray = toAryForDecClr(elmColor);
    const hsvAry = rgbToHsv(ToNumForDecClr(tmpRgbArray));
    // 色相を変更
    if (hsvAry[0] <= 360) { // Hueは360以下が正常
      hsvAry[0] -= 345;
      if (hsvAry[0] < 0) {
        hsvAry[0] += 360;
      }
    }
    // hsvAry[1] += Math.round((16 - hsvAry[1]) * 1 / 3); // 鮮やかさ
    // hsvAry[2] += Math.round((0 - hsvAry[2]) * 7 / 8); // 明るさ
    hsvAry[2] = Math.round(hsvAry[1] * hsvAry[2] / 255);
    // hsvAry[1] = Math.round(hsvAry[1] ** 2 / 255);
    hsvAry[1] += Math.round((128 - hsvAry[1]) * 1 / 3); // 鮮やかさ

    const rgbAry = hsvToRgb(hsvAry);
    if (tmpRgbArray.length === 4) {
      return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
    }
    return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
  };

  const returnNewGradient = (oldGradient) => {
    // if (oldGradient === "none") {
    //   return "none";
    // }
    let tmpGradient = oldGradient;
    for (let i = 0; i < cssColorNamesTable.length; i++) {
      tmpGradient = replaceAll(tmpGradient, cssColorNamesTable[i][0], cssColorNamesTable[i][1]);
    }
    // 一度認識できる色をすべて配列にまとめる
    // 文章の連結を最後にする
    let posRgbTmp = tmpGradient.indexOf("rgb");
    let posDecClrStart = [];
    let posDecClrEnd = [];
    let loopCount = 0;
    while (posRgbTmp !== -1) {
      posDecClrStart.push(posRgbTmp);
      posDecClrEnd.push(tmpGradient.indexOf(")", posDecClrStart[loopCount]+11)+1);
      posRgbTmp = tmpGradient.indexOf("rgb", posDecClrEnd[loopCount]);
      loopCount++;
      if (loopCount > 50) {
        printError("Infinity Loop on analyze gradient.");
        loopCount = 0;
        break;
      }
    }
    let rgbStrs = [];
    for (let i = 0; i < posDecClrStart.length; i++) {
      rgbStrs.push(tmpGradient.substring(posDecClrStart[i], posDecClrEnd[i]));
    }
    let hsvStrs = [];
    for (let i = 0; i < rgbStrs.length; i++) {
      const tmpRgbArray = toAryForDecClr(rgbStrs[i]);
      const hsvAry = rgbToHsv(ToNumForDecClr(tmpRgbArray));
      // 色相を変更
      if (hsvAry[0] <= 360) { // Hueは360以下が正常
        hsvAry[0] -= 345;
        if (hsvAry[0] < 0) {
          hsvAry[0] += 360;
        }
      }
      hsvAry[2] = Math.round(hsvAry[1] * hsvAry[2] / 255);
      hsvAry[1] += Math.round((128 - hsvAry[1]) * 1 / 3); // 鮮やかさ
      
      const rgbAry = hsvToRgb(hsvAry);
      if (tmpRgbArray.length === 4) {
        hsvStrs.push(`rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`);
      } else {
        hsvStrs.push(`rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`);
      }
    }
    if (hsvStrs.length !== posDecClrStart.length || hsvStrs.length !== posDecClrEnd.length) {
      printError("配列の長さが違う");
      return oldGradient;
    }
    let newGradient = '';
    for (let i = 0; i < hsvStrs.length; i++) {
      if (i === 0) {
        newGradient = tmpGradient.substring(0, posDecClrStart[i]);
      }
      newGradient += hsvStrs[i];
      if (i === hsvStrs.length - 1) {
        newGradient += tmpGradient.substring(posDecClrEnd[i], tmpGradient.length);
      } else {
        newGradient += tmpGradient.substring(posDecClrEnd[i], posDecClrStart[i + 1]);
      }
    }
    return newGradient;
  }
  
  function markChildElms(elms) {
    for (let i = 0; i < elms.length; i++) {
      elms[i].setAttribute(dataSkipMath, "");
      markChildElms(elms[i].children);
    }
  }

  const markElements = (elms) => {
    const elmsLength = elms.length;
    for (let i = 0; i < elmsLength; i++) {
      const elmTagName = elms[i].tagName;
      if (elmTagName === "LINK" || elmTagName === "META" || elmTagName === "SCRIPT" || elmTagName === "NOSCRIPT" || elmTagName === "STYLE" || elmTagName === "HEAD" || elmTagName === "TITLE") {
        continue;
      }
      if (elms[i].hasAttribute(dataSkipMath)) {
        continue;
      }
      if (elmTagName === "math") {
        elms[i].setAttribute(dataSkipMath, "");
        markChildElms(elms[i].children);
        continue;
      }
      const elmStyle = window.getComputedStyle(elms[i], null);
      // const styleDisplay = elmStyle.getPropertyValue("display");
      // if (styleDisplay === "none") { // cssの@によるスタイル変更に対応できない
      //   continue;
      // }
      const styleFcolor = elmStyle.getPropertyValue("color");
      const styleBgColor = elmStyle.getPropertyValue("background-color");
      const styleBgimage = elmStyle.getPropertyValue("background-image");
      const styleFilter = elmStyle.getPropertyValue("filter");
      // 背景色
      if (elms[i].hasAttribute(dataOriginBgcolor) && styleBgColor !== elms[i].getAttribute(dataOriginBgcolor) || styleBgColor !== 'rgba(0, 0, 0, 0)') {
        elms[i].style.setProperty(cssVariableBgcolor, returnNewBackColor(styleBgColor));
        elms[i].setAttribute(dataOriginBgcolor, styleBgColor);
      }
      // 画像を装飾
      if (elmTagName === 'IMG') {
        if (elms[i].hasAttribute(dataOriginBgcolor)) {
          const originFilterColor = styleBgColor;
          if (!elms[i].hasAttribute(dataOriginFilterColor) || originFilterColor !== elms[i].getAttribute(dataOriginFilterColor)) {
            elms[i].style.setProperty(cssVariableFilterColor, changeAlphaColor(originFilterColor, 0.75));
            elms[i].setAttribute(dataOriginFilterColor, originFilterColor);
          }
        } else {
          const originFilterColor = returnParentsBgColor(elms[i]);
          if (!elms[i].hasAttribute(dataOriginFilterColor) || originFilterColor !== elms[i].getAttribute(dataOriginFilterColor)) {
            elms[i].style.setProperty(cssVariableFilterColor, changeAlphaColor(originFilterColor, 0.75));
            elms[i].setAttribute(dataOriginFilterColor, originFilterColor);
          }
        }
        if (!elms[i].hasAttribute(dataOriginFilters) || styleFilter !== elms[i].getAttribute(dataOriginFilters)) {
          elms[i].setAttribute(dataOriginFilters, styleFilter);
          if (styleFilter === "none") {
            elms[i].style.setProperty(cssVariableOriginFilters, " ");
          } else {
            elms[i].style.setProperty(cssVariableOriginFilters, styleFilter);
          }
        }
        continue;
      }
      // 背景画像を装飾
      if (styleBgimage.indexOf("url(") !== -1) {
        if (elmTagName === "HTML" || elmTagName === "BODY") {
          if (!elms[i].hasAttribute(dataEnableTextShadow)) {
            elms[i].setAttribute(dataEnableTextShadow, "");
          }
          continue;
        }
        if (elms[i].hasAttribute(dataOriginBgcolor)) {
          const originFilterColor = styleBgColor;
          if (!elms[i].hasAttribute(dataOriginFilterColor) || originFilterColor !== elms[i].getAttribute(dataOriginFilterColor)) {
            elms[i].style.setProperty(cssVariableFilterColor, changeAlphaColor(originFilterColor, 0.75));
            elms[i].setAttribute(dataOriginFilterColor, originFilterColor);
          }
        } else {
          const originFilterColor = returnParentsBgColor(elms[i]);
          if (!elms[i].hasAttribute(dataOriginFilterColor) || originFilterColor !== elms[i].getAttribute(dataOriginFilterColor)) {
            elms[i].style.setProperty(cssVariableFilterColor, changeAlphaColor(originFilterColor, 0.75));
            elms[i].setAttribute(dataOriginFilterColor, originFilterColor);
          }
        }
        if (!elms[i].hasAttribute(dataOriginFilters) || styleFilter !== elms[i].getAttribute(dataOriginFilters)) {
          elms[i].setAttribute(dataOriginFilters, styleFilter);
          if (styleFilter === "none") {
            elms[i].style.setProperty(cssVariableOriginFilters, " ");
          } else {
            elms[i].style.setProperty(cssVariableOriginFilters, styleFilter);
          }
        }
      }
      // 背景グラデーション
      if (elms[i].hasAttribute(dataOriginBgimage) && styleBgimage !== elms[i].getAttribute(dataOriginBgimage)) {
        if (styleBgimage.indexOf("-gradient(") !== -1) {
          elms[i].style.setProperty(cssVariableBgimage, returnNewGradient(styleBgimage));
          elms[i].setAttribute(dataOriginBgimage, styleBgimage);
        } else {
          elms[i].removeAttribute(dataOriginBgimage);
          elms[i].style.setProperty(cssVariableBgimage, '');
        }
      } else if (styleBgimage.indexOf("-gradient(") !== -1) {
        elms[i].style.setProperty(cssVariableBgimage, returnNewGradient(styleBgimage));
        elms[i].setAttribute(dataOriginBgimage, styleBgimage);
      } else if (styleBgimage !== "none") { // 背景が画像の要素とその子孫要素に縁取り
        if (!elms[i].hasAttribute(dataEnableTextShadow)) {
          elms[i].setAttribute(dataEnableTextShadow, "");
        }
      }
      // 前景色
      if (elms[i].hasAttribute(dataOriginFcolor) && styleFcolor !== elms[i].getAttribute(dataOriginFcolor) || styleFcolor !== 'rgba(0, 0, 0, 0)') {
        const newFrontColor = returnNewFrontColor(styleFcolor);
        elms[i].style.setProperty(cssVariableFcolor, newFrontColor);
        elms[i].setAttribute(dataOriginFcolor, styleFcolor);
        // visited
        if (elmTagName === "A") {
          if (!elms[i].hasAttribute(dataEnableFcolorVisited)) {
            elms[i].setAttribute(dataEnableFcolorVisited, "");
          }
          elms[i].style.setProperty(cssVariableFcolorVisited, returnNewVisitedColor(newFrontColor));
        }
      }
    }
  };

  const myElms = document.getElementsByTagName('*');
  markElements(myElms);
  head.appendChild(css);

  let isRunning = false;
  let needToWork = false;
  const options = {
    // attributes: true,
    // attributeFilter: ["style"], //一部のスタイルの変化を検知
    // attributeFilter: ["class", "style"], //ほぼ全てのスタイルの変化を検知
    childList: true,
    subtree: true
  }

  const observer = new MutationObserver(records => {
    // console.count(scriptName + " COUNT: " + "Detected document changes");
    const runProcess = () => {
      observer.disconnect();
      head.removeChild(css);
      markElements(myElms);
      while (needToWork === true) {
        // printInfo("残業か……");
        needToWork = false;
        markElements(myElms);
      }
      head.appendChild(css);
      observer.observe(document, options);
      isRunning = false;
      // printInfo("終わり");
    };
    if (isRunning === false) {
      isRunning = true;
      needToWork = false;
      // printInfo("始め");
      // runProcess(); // 最速
      setTimeout(() => {runProcess()}, 1000); // 間隔を指定
    } else {
      if (needToWork === false) {
        // printInfo("<< これ、追加です");
        needToWork = true;
      }
    }
  });
  observer.observe(document, options);
})();
