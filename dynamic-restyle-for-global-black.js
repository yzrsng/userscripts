// ==UserScript==
// @name           Dynamic Restyle Script for Global Black
// @name:ja        Dynamic Restyle Script for Global Black
// @namespace      https://github.com/yzrsng/userscripts
// @author         yzrsng
// @version        0.20191030.3
// @include        http://*
// @include        https://*
// @include        https://twitter.com/*
// @include        https://mobile.twitter.com/*
// @grant          none
// @description    Userscript to change color on website.
// @description:ja ウェブページを動的に再装飾して黒くする
// ==/UserScript==
/*
ウェブページの変更を検知して動的に色を変更する。

背景色の明るさは鮮やかさに比例する
画像の上の文字が色の変更で判別できなくなると困るので黒い縁取り文字に
背景色の変化で画像が判別できなくなると困るので後光が指すように
*/
(function () {
    'use strict';
    const RESTYLE_INTERVAL_TIME = 1000; // 次の処理開始までの最短停止時間、単位はms
    const ENOUGH_BREAK_TIME = 5000; // 次の処理開始までの推奨停止時間、単位はms
    const CONTINUOUS_WORK_COUNT_LIMIT = 10; // 連続で停止時間が推奨停止時間より少なくても動作する回数、超えると変更検知を停止
    const ADDED_WORK_COUNT_LIMIT = 20; // 一回のスタイル変更処理中に次の処理を追加された回数がこの値を超えると変更検知を停止
    const head = document.getElementsByTagName('head')[0];
    const tmpCss = document.createElement('style');
    tmpCss.type = "text/css";
    tmpCss.insertAdjacentHTML('beforeend', `
* {
  color: #dcd8d0 !important;
  background-color: #000000 !important;
}
a,a * {
  color: deepskyblue !important;
}
a:visited, a:visited * {
  color: royalblue !important;
}`);
    head.appendChild(tmpCss);
    const scriptName = "drs4gb";
    const cssId = `userscript-${scriptName}`;
    // const commonDataName = `data-${cssId}`;
    // const commonCssVariableName = `--${cssId}`;
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
    const restyledCss = document.createElement('style');
    restyledCss.type = "text/css";
    restyledCss.id = cssId;
    restyledCss.insertAdjacentHTML('beforeend', `
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
  color: var(${cssVariableFcolor}, white) !important;
}
[${dataEnableFcolorVisited}]:visited, [${dataEnableFcolorVisited}]:visited * {
  color: var(${cssVariableFcolorVisited}, lightpink) !important;
}
[${dataOriginBgcolor}] {
  background-color: var(${cssVariableBgcolor}, black) !important;
}
[${dataOriginBgimage}] {
  background-image: var(${cssVariableBgimage}, none) !important;
}
[${dataEnableTextShadow}], [${dataEnableTextShadow}] * {
  text-shadow: ${cssVariableTextShadow} -1px 1px 0px, ${cssVariableTextShadow} 0px 1px 0px,  ${cssVariableTextShadow} 1px 1px 0px, ${cssVariableTextShadow} -1px 0px 0px, ${cssVariableTextShadow} 1px 0px 0px, ${cssVariableTextShadow} -1px -1px 0px, ${cssVariableTextShadow} 0px -1px 0px, ${cssVariableTextShadow} 1px -1px 0px !important;
}
[${dataOriginFilters}] {
  background-color: rgba(0, 0, 0, 0) !important;
  filter: var(${cssVariableOriginFilters}, opacity(1)) drop-shadow(0px 0px 1px var(${cssVariableFilterColor}, white)) !important;
}`);
    const cssColorNamesTable = [
        ["black", "rgb(0, 0, 0)"],
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
        ["orange", "rgb(255, 165, 0)"],
        ["aliceblue", "rgb(240, 248, 255)"],
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
    const printError = (messageStr) => {
        console.error(scriptName + " ERROR: " + messageStr);
    };
    const returnParentsBgColor = (elm) => {
        const parentElmStyle = window.getComputedStyle(elm.parentNode);
        const parentElmBgColor = parentElmStyle.getPropertyValue("background-color");
        if (parentElmBgColor.includes("rgba") && toAryForDecClr(parentElmBgColor)[3] === 0) {
            if (elm.parentNode.tagName === "HTML") {
                return "rgb(255, 255, 255)";
            }
            return returnParentsBgColor(elm.parentNode);
        }
        return parentElmBgColor;
    };
    // from https://qiita.com/S__Minecraft/items/cb423553cc9a2e26c0b9
    const replaceAll = (str, before, after) => {
        let i = str.indexOf(before);
        if (i === -1)
            return str;
        let result = str.slice(0, i) + after;
        let j = str.indexOf(before, i + before.length);
        while (j !== -1) {
            result += str.slice(i + before.length, j) + after;
            i = j;
            j = str.indexOf(before, i + before.length);
        }
        return result + str.slice(i + before.length);
    };
    const rgbToHsv = (rgbAry) => {
        if (rgbAry.length > 4) {
            printError("color array length is over 4");
            return [362, 255, 255];
        }
        if (isNaN(rgbAry[0]) || isNaN(rgbAry[1]) || isNaN(rgbAry[2])) {
            printError("NaN in RGB");
            return [362, 255, 255];
        }
        const rgbMax = Math.max(...rgbAry);
        const rgbMin = Math.min(...rgbAry);
        const hsvAry = new Array(3);
        const calcHuePart = (clr1, clr2) => 60 * (clr1 - clr2) / (rgbMax - rgbMin);
        if (rgbAry[0] === rgbAry[1] && rgbAry[0] === rgbAry[2]) {
            hsvAry[0] = 361; // 未定義のため異常な数値を代入
        }
        else if (rgbAry[0] >= rgbAry[1] && rgbAry[0] >= rgbAry[2]) {
            hsvAry[0] = calcHuePart(rgbAry[1], rgbAry[2]);
        }
        else if (rgbAry[1] >= rgbAry[0] && rgbAry[1] >= rgbAry[2]) {
            hsvAry[0] = calcHuePart(rgbAry[2], rgbAry[0]) + 120;
        }
        else if (rgbAry[2] >= rgbAry[0] && rgbAry[2] >= rgbAry[1]) {
            hsvAry[0] = calcHuePart(rgbAry[0], rgbAry[1]) + 240;
        }
        else {
            printError("RGBからHSVへの変換のHの計算で意図しない動作");
            hsvAry[0] = 362;
        }
        if (hsvAry[0] < 0) { // Hueの値がマイナスなら360を加算して0~360の範囲に収める
            hsvAry[0] += 360;
        }
        if (rgbMax === 0) { // 0除算エラー防止
            hsvAry[1] = 0;
        }
        else {
            hsvAry[1] = (rgbMax - rgbMin) * 255 / rgbMax;
        }
        hsvAry[2] = rgbMax;
        return hsvAry;
    };
    const hsvToRgb = (hsvAry) => {
        const rgbAry = new Array(3);
        const hsvMax = hsvAry[2];
        const hsvMin = hsvMax - Math.round(hsvAry[1] / 255 * hsvMax);
        if (hsvAry[0] > 360) { // Hueは360以下が正常
            rgbAry[0] = hsvMax;
            rgbAry[1] = hsvMax;
            rgbAry[2] = hsvMax;
        }
        else if (0 <= hsvAry[0] && hsvAry[0] <= 60) {
            rgbAry[0] = hsvMax;
            rgbAry[1] = Math.round(hsvAry[0] / 60 * (hsvMax - hsvMin)) + hsvMin;
            rgbAry[2] = hsvMin;
        }
        else if (60 < hsvAry[0] && hsvAry[0] <= 120) {
            rgbAry[0] = Math.round((120 - hsvAry[0]) / 60 * (hsvMax - hsvMin)) + hsvMin;
            rgbAry[1] = hsvMax;
            rgbAry[2] = hsvMin;
        }
        else if (120 < hsvAry[0] && hsvAry[0] <= 180) {
            rgbAry[0] = hsvMin;
            rgbAry[1] = hsvMax;
            rgbAry[2] = Math.round((hsvAry[0] - 120) / 60 * (hsvMax - hsvMin)) + hsvMin;
        }
        else if (180 < hsvAry[0] && hsvAry[0] <= 240) {
            rgbAry[0] = hsvMin;
            rgbAry[1] = Math.round((240 - hsvAry[0]) / 60 * (hsvMax - hsvMin)) + hsvMin;
            rgbAry[2] = hsvMax;
        }
        else if (240 < hsvAry[0] && hsvAry[0] <= 300) {
            rgbAry[0] = Math.round((hsvAry[0] - 240) / 60 * (hsvMax - hsvMin)) + hsvMin;
            rgbAry[1] = hsvMin;
            rgbAry[2] = hsvMax;
        }
        else if (300 < hsvAry[0] && hsvAry[0] <= 360) {
            rgbAry[0] = hsvMax;
            rgbAry[1] = hsvMin;
            rgbAry[2] = Math.round((360 - hsvAry[0]) / 60 * (hsvMax - hsvMin)) + hsvMin;
        }
        else {
            printError("HSVからRGBへの変換で意図しない動作");
            rgbAry[0] = rgbAry[1] = rgbAry[2] = 0;
        }
        return rgbAry;
    };
    const toNumForDecClr = (clrAry) => {
        const clrAryLength = clrAry.length;
        const numAry = new Array(clrAryLength);
        for (let i = 0; i < clrAryLength; i++) {
            numAry[i] = parseFloat(clrAry[i]);
        }
        return numAry;
    };
    const toAryForDecClr = (clrStr) => {
        const clrValue = clrStr.substring(clrStr.indexOf("(", 3) + 1, clrStr.length - 1);
        const clrArray = clrValue.split(', ');
        // return clrArray;
        const numAry = toNumForDecClr(clrArray);
        if (isNaN(numAry[0]) || isNaN(numAry[1]) || isNaN(numAry[2])) {
            printError("受け取った色の文字列がおかしい");
            console.log(clrStr);
        }
        return numAry;
    };
    const changeAlphaColor = (elmColor, alphaValue) => {
        const clrArray = toAryForDecClr(elmColor);
        return `rgba(${clrArray[0]}, ${clrArray[1]}, ${clrArray[2]}, ${alphaValue})`;
    };
    // const returnInvertColor = (elmColor: string): string => {
    //   const clrArray: number[] = toNumForDecClr(toAryForDecClr(elmColor));
    //   for (let i = 0; i < 3; i++) {
    //     clrArray[i] = 255 - clrArray[i];
    //   }
    //   if (clrArray.length === 4) {
    //     return `rgba(${clrArray[0]}, ${clrArray[1]}, ${clrArray[2]}, ${clrArray[3]})`;
    //   }
    //   return `rgb(${clrArray[0]}, ${clrArray[1]}, ${clrArray[2]})`;
    // }
    const returnNewFrontColor = (elmColor) => {
        const tmpRgbArray = toAryForDecClr(elmColor);
        const oldHsvAry = rgbToHsv(tmpRgbArray);
        const newHsvAry = [].concat(oldHsvAry);
        // change color
        if (newHsvAry[0] <= 360) { // Hueは360以下が正常
            newHsvAry[0] -= 15;
            if (newHsvAry[0] < 0) {
                newHsvAry[0] += 360;
            }
            newHsvAry[1] += Math.round((16 - newHsvAry[1]) * 1 / 3); // 鮮やかさ
        }
        else {
            newHsvAry[0] = 20;
            newHsvAry[1] = 5;
        }
        newHsvAry[2] += Math.round((255 - newHsvAry[2]) * 7 / 8); // 明るさ
        const rgbAry = hsvToRgb(newHsvAry);
        if (tmpRgbArray.length === 4) {
            return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
        }
        return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
    };
    const returnNewVisitedColor = (elmColor) => {
        const tmpRgbArray = toAryForDecClr(elmColor);
        const oldHsvAry = rgbToHsv(tmpRgbArray);
        const newHsvAry = [].concat(oldHsvAry);
        // change color
        if (newHsvAry[0] <= 360) { // Hueは360以下が正常
            newHsvAry[0] -= 340;
            if (newHsvAry[0] < 0) {
                newHsvAry[0] += 360;
            }
        }
        newHsvAry[2] = Math.round(newHsvAry[2] * 7 / 8); // 明るさ
        const rgbAry = hsvToRgb(newHsvAry);
        if (tmpRgbArray.length === 4) {
            return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
        }
        return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
    };
    const returnNewBackColor = (elmColor) => {
        const tmpRgbArray = toAryForDecClr(elmColor);
        const oldHsvAry = rgbToHsv(tmpRgbArray);
        const newHsvAry = [].concat(oldHsvAry);
        // change color
        if (newHsvAry[0] <= 360) { // Hueは360以下が正常
            newHsvAry[0] -= 345;
            if (newHsvAry[0] < 0) {
                newHsvAry[0] += 360;
            }
        }
        else {
            newHsvAry[1] = Math.round(128 - (127 - newHsvAry[2]) ** 2 / 128);
        }
        newHsvAry[2] = Math.round(newHsvAry[1] * newHsvAry[2] / 255);
        newHsvAry[1] += Math.round((128 - newHsvAry[1]) * 1 / 3); // 鮮やかさ
        const rgbAry = hsvToRgb(newHsvAry);
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
        const cssColorNamesTableLength = cssColorNamesTable.length;
        for (let i = 0; i < cssColorNamesTableLength; i++) {
            tmpGradient = replaceAll(tmpGradient, cssColorNamesTable[i][0], cssColorNamesTable[i][1]);
        }
        // 一度認識できる色をすべて配列にまとめる
        // 文章の連結を最後にする
        let posRgbTmp = tmpGradient.indexOf("rgb");
        const posDecClrStart = [];
        const posDecClrEnd = [];
        const loopLimit = 100; // safety
        for (let i = 0; i <= loopLimit; i++) {
            if (posRgbTmp === -1) {
                break;
            }
            posDecClrStart.push(posRgbTmp);
            posDecClrEnd.push(tmpGradient.indexOf(")", posDecClrStart[i] + 11) + 1);
            posRgbTmp = tmpGradient.indexOf("rgb", posDecClrEnd[i]);
            if (i >= loopLimit) {
                printError("Infinity Loop on analyze gradient.");
                break;
            }
        }
        const rgbStrsLength = posDecClrStart.length;
        const rgbStrs = new Array(rgbStrsLength);
        for (let i = 0; i < rgbStrsLength; i++) {
            rgbStrs[i] = tmpGradient.substring(posDecClrStart[i], posDecClrEnd[i]);
        }
        const hsvStrs = new Array(rgbStrsLength);
        for (let i = 0; i < rgbStrsLength; i++) {
            const tmpRgbArray = toAryForDecClr(rgbStrs[i]);
            const oldHsvAry = rgbToHsv(tmpRgbArray);
            const newHsvAry = [].concat(oldHsvAry);
            // change color
            if (newHsvAry[0] <= 360) { // Hueは360以下が正常
                newHsvAry[0] -= 345;
                if (newHsvAry[0] < 0) {
                    newHsvAry[0] += 360;
                }
            }
            else {
                newHsvAry[1] = Math.round(128 - (127 - newHsvAry[2]) ** 2 / 128);
            }
            newHsvAry[2] = Math.round(newHsvAry[1] * newHsvAry[2] / 255);
            newHsvAry[1] += Math.round((128 - newHsvAry[1]) * 1 / 3); // 鮮やかさ
            const rgbAry = hsvToRgb(newHsvAry);
            if (tmpRgbArray.length === 4) {
                hsvStrs[i] = `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
            }
            else {
                hsvStrs[i] = `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
            }
        }
        let newGradient = '';
        for (let i = 0; i < rgbStrsLength; i++) {
            if (i === 0) {
                newGradient = tmpGradient.substring(0, posDecClrStart[i]);
            }
            newGradient += hsvStrs[i];
            if (i === rgbStrsLength - 1) {
                newGradient += tmpGradient.substring(posDecClrEnd[i], tmpGradient.length);
            }
            else {
                newGradient += tmpGradient.substring(posDecClrEnd[i], posDecClrStart[i + 1]);
            }
        }
        return newGradient;
    };
    const isInNode = (elm, rootElm = document) => {
        return (elm === rootElm) ? false : rootElm.contains(elm);
    };
    const allElms = document.getElementsByTagName('*');
    const restyleElm = (argRecords = [{ target: document, type: "all" }]) => {
        const argRecordsLength = argRecords.length;
        const tmpTargetElms = [];
        // const allElmsLength = allElms.length;
        let flagRestyleAll = false;
        set_targets: for (let k = 0; k < argRecordsLength; k++) {
            const argRecordType = argRecords[k].type;
            const argRecordTarget = argRecords[k].target;
            if (argRecordType === "all" && argRecordTarget === document) {
                flagRestyleAll = true;
                break set_targets;
            }
            if (!isInNode(argRecordTarget, document)) {
                continue;
            }
            const regex = /[a-z]/; // math要素対策
            if (regex.test(argRecordTarget.tagName)) {
                continue;
            }
            // for (let i = 0; i < allElmsLength; i++) {
            //   if (allElms[i] === argRecordTarget) {
            //     break;
            //   }
            // }
            if (argRecordType === "characterData") {
                if (argRecordTarget.tagName === "STYLE") {
                    // printError("CSSOMの変更に対する処理は未実装");
                    // console.log(argRecords[k]);
                    flagRestyleAll = true;
                    break set_targets;
                }
            }
            else if (argRecordType === "childList") {
                if (argRecordTarget.tagName === "HEAD") {
                    for (const addNode of argRecords[k].addedNodes) {
                        if (addNode.tagName === "STYLE" || addNode.tagName === "LINK" && addNode.rel.includes("stylesheet")) {
                            flagRestyleAll = true;
                            break set_targets;
                        }
                    }
                    for (const removedNode of argRecords[k].removedNodes) {
                        if (removedNode.tagName === "STYLE" || removedNode.tagName === "LINK" && removedNode.rel.includes("stylesheet")) {
                            flagRestyleAll = true;
                            break set_targets;
                        }
                    }
                }
                else {
                    const targetChildren = argRecordTarget.getElementsByTagName('*');
                    const targetChildrenLength = targetChildren.length;
                    for (let m = 0; m < targetChildrenLength; m++) {
                        if (!tmpTargetElms.includes(targetChildren[m])) {
                            tmpTargetElms.push(targetChildren[m]);
                        }
                    }
                }
            }
            else if (argRecordType === "attributes") {
                if (argRecordTarget.tagName === "HTML") {
                    flagRestyleAll = true;
                    break set_targets;
                }
                tmpTargetElms.push(argRecordTarget);
                const targetChildren = argRecordTarget.getElementsByTagName('*');
                const targetChildrenLength = targetChildren.length;
                for (let m = 0; m < targetChildrenLength; m++) {
                    if (!tmpTargetElms.includes(targetChildren[m])) {
                        tmpTargetElms.push(targetChildren[m]);
                    }
                }
            }
        }
        let restyleTargetElms = tmpTargetElms;
        if (flagRestyleAll) {
            restyleTargetElms = allElms;
        }
        // else {
        //   restyleTargetElms = tmpTargetElms.filter((x, i, self) => self.indexOf(x) === i);
        // }
        const restyleTargetElmsLength = restyleTargetElms.length;
        // get exist style
        const existStyleAry = new Array(restyleTargetElmsLength);
        const existStyleAryLength = 6;
        for (let i = 0; i < restyleTargetElmsLength; i++) {
            const restyleTargetTagName = restyleTargetElms[i].tagName;
            existStyleAry[i] = new Array(existStyleAryLength);
            for (let j = 0; j < existStyleAryLength; j++) {
                existStyleAry[i][j] = "";
            }
            if (restyleTargetTagName === "LINK" || restyleTargetTagName === "META" || restyleTargetTagName === "SCRIPT" || restyleTargetTagName === "NOSCRIPT" || restyleTargetTagName === "STYLE" || restyleTargetTagName === "HEAD" || restyleTargetTagName === "TITLE") {
                continue;
            }
            existStyleAry[i][0] = restyleTargetTagName;
            const restyleTargetElmStyle = window.getComputedStyle(restyleTargetElms[i], null);
            // const restyleTargetElmStyleBefore = window.getComputedStyle(restyleTargetElms[i], '::before');
            // const restyleTargetElmStyleAfter = window.getComputedStyle(restyleTargetElms[i], '::after');
            const styleFcolor = restyleTargetElmStyle.getPropertyValue("color");
            const styleBgColor = restyleTargetElmStyle.getPropertyValue("background-color");
            const styleBgimage = restyleTargetElmStyle.getPropertyValue("background-image");
            // const styleBgimageBefore = restyleTargetElmStyleBefore.getPropertyValue("background-image");
            // const styleBgimageAfter = restyleTargetElmStyleAfter.getPropertyValue("background-image");
            const styleFilter = restyleTargetElmStyle.getPropertyValue("filter");
            existStyleAry[i][1] = styleFcolor;
            existStyleAry[i][2] = styleBgColor;
            existStyleAry[i][3] = styleBgimage;
            // existStyleAry[i][b] = styleBgimageBefore;
            // existStyleAry[i][a] = styleBgimageAfter;
            existStyleAry[i][4] = styleFilter;
            if (restyleTargetTagName === 'IMG' || styleBgimage.includes("url(") && restyleTargetTagName !== "HTML" && restyleTargetTagName !== "BODY") {
                if (styleBgColor.includes("rgba") && toAryForDecClr(styleBgColor)[3] === 0) {
                    existStyleAry[i][5] = returnParentsBgColor(restyleTargetElms[i]);
                }
                else {
                    existStyleAry[i][5] = styleBgColor;
                }
            }
        }
        // set new style
        for (let i = 0; i < restyleTargetElmsLength; i++) {
            if (!existStyleAry[i][0]) {
                continue;
            }
            const restyleTargetTagName = existStyleAry[i][0];
            const styleFcolor = existStyleAry[i][1];
            const styleBgColor = existStyleAry[i][2];
            const styleBgimage = existStyleAry[i][3];
            // const styleBgimageBefore = existStyleAry[i][b];
            // const styleBgimageAfter = existStyleAry[i][a];
            const styleFilter = existStyleAry[i][4];
            let originFilterColor = existStyleAry[i][5];
            // 背景色
            if (styleBgColor.includes("rgb") && !styleBgColor.includes("rgba") || toAryForDecClr(styleBgColor)[3] !== 0) {
                if (!restyleTargetElms[i].hasAttribute(dataOriginBgcolor) || styleBgColor !== restyleTargetElms[i].getAttribute(dataOriginBgcolor)) {
                    restyleTargetElms[i].style.setProperty(cssVariableBgcolor, returnNewBackColor(styleBgColor));
                    restyleTargetElms[i].setAttribute(dataOriginBgcolor, styleBgColor);
                }
            }
            else if (restyleTargetElms[i].hasAttribute(dataOriginBgcolor)) {
                restyleTargetElms[i].removeAttribute(dataOriginBgcolor);
            }
            // 画像・背景画像を装飾を装飾
            if (restyleTargetTagName === 'IMG' || styleBgimage.includes("url(") && restyleTargetTagName !== "HTML" && restyleTargetTagName !== "BODY") {
                if (!restyleTargetElms[i].hasAttribute(dataOriginFilterColor) || originFilterColor !== restyleTargetElms[i].getAttribute(dataOriginFilterColor)) {
                    restyleTargetElms[i].style.setProperty(cssVariableFilterColor, changeAlphaColor(originFilterColor, 0.75));
                    restyleTargetElms[i].setAttribute(dataOriginFilterColor, originFilterColor);
                }
                if (!restyleTargetElms[i].hasAttribute(dataOriginFilters) || styleFilter !== restyleTargetElms[i].getAttribute(dataOriginFilters)) {
                    restyleTargetElms[i].setAttribute(dataOriginFilters, styleFilter);
                    if (styleFilter === "none") {
                        restyleTargetElms[i].style.setProperty(cssVariableOriginFilters, " ");
                    }
                    else {
                        restyleTargetElms[i].style.setProperty(cssVariableOriginFilters, styleFilter);
                    }
                }
            }
            // else if (restyleTargetTagName === "HTML" || restyleTargetTagName === "BODY") {
            //   if (!restyleTargetElms[i].hasAttribute(dataEnableTextShadow)) {
            //     restyleTargetElms[i].setAttribute(dataEnableTextShadow, "");
            //   }
            //   continue;
            // }
            // 背景グラデーション
            if (styleBgimage.includes("-gradient(")) {
                if (!restyleTargetElms[i].hasAttribute(dataOriginBgimage) || styleBgimage !== restyleTargetElms[i].getAttribute(dataOriginBgimage)) {
                    restyleTargetElms[i].style.setProperty(cssVariableBgimage, returnNewGradient(styleBgimage));
                    restyleTargetElms[i].setAttribute(dataOriginBgimage, styleBgimage);
                }
            }
            else {
                if (restyleTargetElms[i].hasAttribute(dataOriginBgimage)) {
                    restyleTargetElms[i].removeAttribute(dataOriginBgimage);
                }
                if (restyleTargetTagName === 'IMG') {
                    continue;
                }
                if (styleBgimage !== "none") { // 背景が画像の要素とその子孫要素の文字に縁取り
                    if (!restyleTargetElms[i].hasAttribute(dataEnableTextShadow)) {
                        restyleTargetElms[i].setAttribute(dataEnableTextShadow, "");
                    }
                }
            }
            // 前景色
            if (styleFcolor.includes("rgb") && !styleFcolor.includes("rgba") || toAryForDecClr(styleFcolor)[3] !== 0) {
                if (!restyleTargetElms[i].hasAttribute(dataOriginFcolor) || styleFcolor !== restyleTargetElms[i].getAttribute(dataOriginFcolor)) {
                    const newFrontColor = returnNewFrontColor(styleFcolor);
                    restyleTargetElms[i].style.setProperty(cssVariableFcolor, newFrontColor);
                    restyleTargetElms[i].setAttribute(dataOriginFcolor, styleFcolor);
                    // visited
                    if (restyleTargetTagName === "A") {
                        if (!restyleTargetElms[i].hasAttribute(dataEnableFcolorVisited)) {
                            restyleTargetElms[i].setAttribute(dataEnableFcolorVisited, "");
                        }
                        restyleTargetElms[i].style.setProperty(cssVariableFcolorVisited, returnNewVisitedColor(newFrontColor));
                    }
                }
            }
            else if (restyleTargetElms[i].hasAttribute(dataOriginFcolor)) {
                restyleTargetElms[i].removeAttribute(dataOriginFcolor);
                if (restyleTargetTagName === "A") {
                    if (restyleTargetElms[i].hasAttribute(dataEnableFcolorVisited)) {
                        restyleTargetElms[i].removeAttribute(dataEnableFcolorVisited);
                    }
                }
            }
        }
    };
    const initRestyle = () => {
        head.removeChild(tmpCss);
        restyleElm([{ target: document, type: "all" }]);
        head.appendChild(restyledCss);
        let addedWorkCount = 0;
        let continuousWorkCount = 0;
        let isRunning = false;
        let needRework = true;
        let isMarkedPerformanceStart = false;
        let restyleRecords = [];
        const option = {
            attributes: true,
            attributeFilter: ["class", "style"],
            childList: true,
            subtree: true
        };
        const obsWork = (records, obs) => {
            // console.count("Detected document changes");
            const recordsLength = records.length;
            for (let i = 0; i < recordsLength; i++) {
                restyleRecords.push(records[i]);
            }
            // if (recordsLength > 0) {
            //   console.log(records);
            // }
            if (restyleRecords.length > 0 && isRunning === false) {
                if (addedWorkCount > ADDED_WORK_COUNT_LIMIT || continuousWorkCount > CONTINUOUS_WORK_COUNT_LIMIT) {
                    needRework = false;
                    printError("observer thrown out work.\nbecause this web page changes frequently.");
                    window.alert("Observer for restyle is going to stop.\nBecause this web page changes frequently.\n\nページの変更が激しいので変更の検知を停止します。");
                }
                addedWorkCount++;
                isRunning = true;
                performance.mark('breakTime:end');
                if (isMarkedPerformanceStart) {
                    performance.measure('breakTime', 'breakTime:start', 'breakTime:end');
                    if (performance.getEntriesByType('measure')[0].duration < ENOUGH_BREAK_TIME) {
                        continuousWorkCount++;
                    }
                    else
                        continuousWorkCount = 0;
                    isMarkedPerformanceStart = false;
                }
                // performance.clearMarks();
                performance.clearMeasures();
                // console.info("始め");
                setTimeout(() => {
                    obs.disconnect();
                    // console.count("observer stop");
                    if (needRework) {
                        head.removeChild(restyledCss);
                        const tmpRecords = restyleRecords;
                        restyleRecords = [];
                        restyleElm(tmpRecords);
                        head.appendChild(restyledCss);
                        obs.observe(document, option);
                        // console.count("observer restart");
                        isRunning = false;
                        performance.mark('breakTime:start');
                        isMarkedPerformanceStart = true;
                        // console.info("終わり");
                    }
                }, RESTYLE_INTERVAL_TIME); // 間隔を指定
            }
            else {
                addedWorkCount = 0;
            }
        };
        const observer = new MutationObserver(obsWork);
        observer.observe(document, option);
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRestyle);
    }
    else {
        initRestyle();
    }
    // if (window.navigator.userAgent.includes("Android")) {
    //   window.addEventListener('load', () => {
    //     setTimeout(() => {
    //       needRework = false;
    //     }, 1000);
    //   });
    // }
})();
