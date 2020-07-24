// ==UserScript==
// @name           Global Light Dynamic Restyle Script
// @name:ja        Global Light Dynamic Restyle Script
// @namespace      https://github.com/yzrsng/userscripts
// @description    The website becomes light.
// @description:ja ウェブページを元のデザインに基づいて明るく装飾する
// @version        0.20200724.1
// @author         yzrsng
// @downloadURL    https://raw.githubusercontent.com/yzrsng/userscripts/master/dynamic-restyle-for-global-light.js
// @include        http://*
// @include        https://*
// @match          *://*
// @exclude        https://twitter.com/*
// @exclude        https://mobile.twitter.com/*
// @grant          none
// ==/UserScript==
/*
画像の上の文字が色の変更で判別できなくなると困るので縁取り文字に

オプション
明るいテーマ
色相を光の三原色から離す
背景色の変化で画像が判別できなくなると困るので後光が指す

TODO

個々の要素のstyle属性を改変する関数
importantとそうでないのと(importantは対応しなくてもよい)

スタイルシートの変化のみを検知するobserver
*/
(function () {
    'use strict';
    const RESTYLE_INTERVAL_TIME = 1000; // 次の処理開始までの最短停止時間、単位はms
    const ENOUGH_BREAK_TIME = 5000; // 次の処理開始までの推奨停止時間、単位はms
    const CONTINUOUS_WORK_COUNT_LIMIT = 10; // 連続で停止時間が推奨停止時間より少なくても動作する回数、超えると変更検知を停止
    const ADDED_WORK_COUNT_LIMIT = 20; // 一回のスタイル変更処理中に次の処理を追加された回数がこの値を超えると変更検知を停止
    const scriptOptionLightStyle = true;
    const scriptOptionColorFarFromPrimaryRGB = true; // for color blind users and others
    const scriptOptionImageFloat = false;
    const head = document.getElementsByTagName('head')[0];
    const simpleLightStyleString = `
* {
    color: #141820 !important;
    background-color: #ffffff !important;
}`;
    const simpleDarkStyleString = `
* {
    color: #dcd8d0 !important;
    background-color: #000000 !important;
}`;
    const tmpCss = document.createElement('style');
    tmpCss.type = "text/css";
    tmpCss.insertAdjacentHTML('beforeend', scriptOptionLightStyle ? simpleLightStyleString : simpleDarkStyleString);
    head.appendChild(tmpCss);
    const initRestyle = () => {
        const scriptName = "gldrs";
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
        const dataTwitterWidgetOverridden = `data-${cssId}-twitter-widget-overridden`;
        const cssVariableFcolor = `--${cssId}-fcolor`;
        const cssVariableFcolorVisited = `--${cssId}-fcolor-visited`;
        const cssVariableBgcolor = `--${cssId}-bgcolor`;
        const cssVariableBgimage = `--${cssId}-bgimage`;
        const cssVariableOriginFilters = `--${cssId}-origin-filters`;
        const cssVariableFilterColor = `--${cssId}-filter-color`;
        const cssRootBackgroundColor = scriptOptionLightStyle ? "#ffffff" : "#000000";
        const cssVariableTextShadow = cssRootBackgroundColor + "80";
        const darkScrollStyleString = `
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
}`;
        const dynamicCss = document.createElement('style');
        dynamicCss.type = "text/css";
        dynamicCss.className = `${cssId} ${cssId}-restyle`;
        dynamicCss.media = "screen";
        if (!scriptOptionLightStyle) {
            dynamicCss.insertAdjacentHTML('beforeend', darkScrollStyleString);
        }
        dynamicCss.insertAdjacentHTML('beforeend', `
:root {
    background-color: ${cssRootBackgroundColor};
}
[${dataOriginFcolor}], [${dataOriginFcolor}]::placeholder {
    color: var(${cssVariableFcolor}, attr(${dataOriginFcolor})) !important;
}
[${dataEnableFcolorVisited}]:visited, [${dataEnableFcolorVisited}]:visited * {
    color: var(${cssVariableFcolorVisited}) !important;
}
[${dataOriginBgcolor}] {
    background-color: var(${cssVariableBgcolor}, attr(${dataOriginBgcolor})) !important;
}
[${dataOriginBgimage}] {
    background-image: var(${cssVariableBgimage}, attr(${dataOriginBgimage})) !important;
}
[${dataEnableTextShadow}], [${dataEnableTextShadow}] * {
    text-shadow: ${cssVariableTextShadow} -1px 1px 0px, ${cssVariableTextShadow} 0px 1px 0px,  ${cssVariableTextShadow} 1px 1px 0px, ${cssVariableTextShadow} -1px 0px 0px, ${cssVariableTextShadow} 1px 0px 0px, ${cssVariableTextShadow} -1px -1px 0px, ${cssVariableTextShadow} 0px -1px 0px, ${cssVariableTextShadow} 1px -1px 0px !important;
}
[${dataOriginFilters}] {
    background-color: transparent !important;
    filter: var(${cssVariableOriginFilters}, invert(0)) drop-shadow(0px 0px 1px var(${cssVariableFilterColor}, #80808080)) !important;
}`);
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
        const rgbToHsl = (rgbAry) => {
            if (rgbAry.length > 4) {
                console.error("color array length is over 4");
                console.log(rgbAry);
                return [362, 255, 255];
            }
            if (isNaN(rgbAry[0]) || isNaN(rgbAry[1]) || isNaN(rgbAry[2])) {
                console.error("NaN in RGB");
                console.log(rgbAry);
                return [362, 255, 255];
            }
            const rgbMax = Math.max(rgbAry[0], rgbAry[1], rgbAry[2]);
            const rgbMin = Math.min(rgbAry[0], rgbAry[1], rgbAry[2]);
            const hslAry = [0, 0, 0, 1];
            if (rgbAry.length === 4) {
                hslAry[3] = rgbAry[3];
            }
            hslAry[2] = (rgbMax + rgbMin) / 2 * 100 / 255;
            if (rgbMax === rgbMin) {
                hslAry[0] = 0;
                hslAry[1] = 0;
            }
            else {
                const calcHuePart = (clr1, clr2) => 60 * (clr1 - clr2) / (rgbMax - rgbMin);
                if (rgbAry[0] === rgbMax) {
                    hslAry[0] = calcHuePart(rgbAry[1], rgbAry[2]);
                }
                else if (rgbAry[1] === rgbMax) {
                    hslAry[0] = calcHuePart(rgbAry[2], rgbAry[0]) + 120;
                }
                else if (rgbAry[2] === rgbMax) {
                    hslAry[0] = calcHuePart(rgbAry[0], rgbAry[1]) + 240;
                }
                else {
                    console.error("RGBからHSLへの変換のHの計算で意図しない動作");
                    console.log(rgbAry);
                    hslAry[0] = 362;
                }
                if (hslAry[0] < 0) { // Hueの値がマイナスなら360を加算して0~360の範囲に収める
                    hslAry[0] += 360;
                }
                hslAry[1] = hslAry[2] < 50 ? (rgbMax - rgbMin) / (rgbMax + rgbMin) * 100 : (rgbMax - rgbMin) / (510 - rgbMax - rgbMin) * 100;
                // hslAry[0] = Math.round(hslAry[0]);
                // hslAry[1] = Math.round(hslAry[1]);
            }
            // hslAry[2] = Math.round(hslAry[2]);
            return hslAry;
        };
        const hslToRgb = (hslAry) => {
            const rgbMax = hslAry[2] < 50 ? 2.55 * (hslAry[2] + hslAry[2] * hslAry[1] / 100) : 2.55 * (hslAry[2] + (100 - hslAry[2]) * hslAry[1] / 100);
            const rgbMin = hslAry[2] < 50 ? 2.55 * (hslAry[2] - hslAry[2] * hslAry[1] / 100) : 2.55 * (hslAry[2] - (100 - hslAry[2]) * hslAry[1] / 100);
            const rgbAry = [0, 0, 0, 1];
            if (hslAry.length === 4) {
                rgbAry[3] = hslAry[3];
            }
            const calcRgbPart = (clr0) => Math.round(clr0 / 60 * (rgbMax - rgbMin) + rgbMin);
            if (hslAry[0] > 360) { // Hueは360以下が正常
                console.error("Hueが360より大きい");
                return rgbAry;
            }
            else if (0 <= hslAry[0] && hslAry[0] <= 60) {
                rgbAry[0] = rgbMax;
                rgbAry[1] = calcRgbPart(hslAry[0]);
                rgbAry[2] = rgbMin;
            }
            else if (60 < hslAry[0] && hslAry[0] <= 120) {
                rgbAry[0] = calcRgbPart(120 - hslAry[0]);
                rgbAry[1] = rgbMax;
                rgbAry[2] = rgbMin;
            }
            else if (120 < hslAry[0] && hslAry[0] <= 180) {
                rgbAry[0] = rgbMin;
                rgbAry[1] = rgbMax;
                rgbAry[2] = calcRgbPart(hslAry[0] - 120);
            }
            else if (180 < hslAry[0] && hslAry[0] <= 240) {
                rgbAry[0] = rgbMin;
                rgbAry[1] = calcRgbPart(240 - hslAry[0]);
                rgbAry[2] = rgbMax;
            }
            else if (240 < hslAry[0] && hslAry[0] <= 300) {
                rgbAry[0] = calcRgbPart(hslAry[0] - 240);
                rgbAry[1] = rgbMin;
                rgbAry[2] = rgbMax;
            }
            else if (300 < hslAry[0] && hslAry[0] <= 360) {
                rgbAry[0] = rgbMax;
                rgbAry[1] = rgbMin;
                rgbAry[2] = calcRgbPart(360 - hslAry[0]);
            }
            else {
                console.error("HSLからRGBへの変換で意図しない動作");
                rgbAry[0] = rgbAry[1] = rgbAry[2] = 0;
            }
            rgbAry[0] = Math.round(rgbAry[0]);
            rgbAry[1] = Math.round(rgbAry[1]);
            rgbAry[2] = Math.round(rgbAry[2]);
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
        const toAryForDecClr = (rgbColorStr) => {
            const clrValue = rgbColorStr.substring(rgbColorStr.indexOf("(", 3) + 1, rgbColorStr.length - 1).replace(/\s+/g, '');
            const clrArray = clrValue.split(/ *, */);
            if (clrArray.length < 3 || 4 < clrArray.length) {
                console.error("受け取った色の文字列がおかしい");
                console.log(rgbColorStr);
            }
            // return clrArray;
            const numAry = toNumForDecClr(clrArray);
            if (isNaN(numAry[0]) || isNaN(numAry[1]) || isNaN(numAry[2])) {
                console.error("受け取った色の文字列がおかしい");
                console.log(rgbColorStr);
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
        const returnHueFarFromPrimaryRGB = (oldHueValue) => {
            if (0 <= oldHueValue && oldHueValue <= 60) {
                return oldHueValue + Math.round((60 - oldHueValue) * 1 / 3);
            }
            else if (oldHueValue <= 120) {
                return oldHueValue - Math.round((oldHueValue - 60) * 1 / 3);
            }
            else if (oldHueValue <= 180) {
                return oldHueValue + Math.round((180 - oldHueValue) * 1 / 3);
            }
            else if (oldHueValue <= 240) {
                return oldHueValue - Math.round((oldHueValue - 180) * 1 / 3);
            }
            else if (oldHueValue <= 300) {
                return oldHueValue + Math.round((300 - oldHueValue) * 1 / 3);
            }
            else if (oldHueValue <= 360) {
                return oldHueValue - Math.round((oldHueValue - 300) * 1 / 3);
            }
            else {
                console.error("Hue like CMY Error, oldHueValue : " + oldHueValue);
                return 0;
            }
        };
        const returnHueCloseToPrimaryRGB = (oldHueValue) => {
            if (0 <= oldHueValue && oldHueValue <= 60) {
                return oldHueValue - Math.round(oldHueValue * 1 / 3);
            }
            else if (oldHueValue <= 120) {
                return oldHueValue + Math.round((120 - oldHueValue) * 1 / 3);
            }
            else if (oldHueValue <= 180) {
                return oldHueValue - Math.round((oldHueValue - 120) * 1 / 3);
            }
            else if (oldHueValue <= 240) {
                return oldHueValue + Math.round((240 - oldHueValue) * 1 / 3);
            }
            else if (oldHueValue <= 300) {
                return oldHueValue - Math.round((oldHueValue - 240) * 1 / 3);
            }
            else if (oldHueValue <= 360) {
                return oldHueValue + Math.round((360 - oldHueValue) * 1 / 3);
            }
            else {
                console.error("Hue like RGB Error, oldHueValue : " + oldHueValue);
                return 0;
            }
        };
        const returnNewFrontColorAry = (oldRgbAry) => {
            const oldHslAry = rgbToHsl(oldRgbAry);
            const newHslAry = [].concat(oldHslAry);
            // change color
            newHslAry[2] = newHslAry[2] < 50 ? newHslAry[2] : 100 - newHslAry[2];
            const newRGBAry = hslToRgb(newHslAry);
            if (!scriptOptionLightStyle) {
                newHslAry[2] -= Math.round(newHslAry[2] * (255000 - (newRGBAry[0] * 299 + newRGBAry[1] * 587 + newRGBAry[2] * 114)) / 510000);
                newHslAry[0] = returnHueFarFromPrimaryRGB(newHslAry[0]);
                newHslAry[2] = 100 - newHslAry[2]; // reverse lightness
            }
            else {
                newHslAry[2] -= Math.round(newHslAry[2] * (newRGBAry[0] * 299 + newRGBAry[1] * 587 + newRGBAry[2] * 114) / 510000);
                if (scriptOptionColorFarFromPrimaryRGB) {
                    newHslAry[0] = returnHueFarFromPrimaryRGB(newHslAry[0]);
                }
                else {
                    newHslAry[0] = returnHueCloseToPrimaryRGB(newHslAry[0]);
                }
            }
            return hslToRgb(newHslAry);
        };
        const returnNewBgColorAry = (oldRgbAry) => {
            const oldHslAry = rgbToHsl(oldRgbAry);
            const newHslAry = [].concat(oldHslAry);
            // change color
            newHslAry[2] = newHslAry[2] < 50 ? newHslAry[2] : 100 - newHslAry[2];
            const newRGBAry = hslToRgb(newHslAry);
            if (scriptOptionLightStyle) {
                newHslAry[2] -= Math.round(newHslAry[2] * (255000 - (newRGBAry[0] * 299 + newRGBAry[1] * 587 + newRGBAry[2] * 114)) / 255000);
                newHslAry[0] = returnHueFarFromPrimaryRGB(newHslAry[0]);
                newHslAry[2] = 100 - newHslAry[2]; // reverse lightness
            }
            else {
                newHslAry[2] -= Math.round(newHslAry[2] * (newRGBAry[0] * 299 + newRGBAry[1] * 587 + newRGBAry[2] * 114) / 255000);
                if (scriptOptionColorFarFromPrimaryRGB) {
                    newHslAry[0] = returnHueFarFromPrimaryRGB(newHslAry[0]);
                }
                else {
                    newHslAry[0] = returnHueCloseToPrimaryRGB(newHslAry[0]);
                }
            }
            return hslToRgb(newHslAry);
        };
        const returnNewFrontColorStr = (elmColor) => {
            const oldRgbAry = toAryForDecClr(elmColor);
            const rgbAry = returnNewFrontColorAry(oldRgbAry);
            if (oldRgbAry.length === 4) {
                return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${oldRgbAry[3]})`;
            }
            return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
        };
        const returnNewVisitedColorStr = (elmColor) => {
            const tmpRgbArray = toAryForDecClr(elmColor);
            const rgbAry = [].concat(tmpRgbArray);
            const tmpColorBrightness = Math.round((tmpRgbArray[0] * 299 + tmpRgbArray[1] * 587 + tmpRgbArray[2] * 114) / 1000);
            if (!scriptOptionLightStyle) {
                for (let i = 0; i < 3; i++) {
                    rgbAry[i] = Math.round(rgbAry[i] * 118 / tmpColorBrightness);
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    rgbAry[i] = 255 - rgbAry[i];
                    rgbAry[i] = Math.round(rgbAry[i] * 118 / (255 - tmpColorBrightness));
                    rgbAry[i] = 255 - rgbAry[i];
                }
            }
            if (tmpRgbArray.length === 4) {
                return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${tmpRgbArray[3]})`;
            }
            return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
        };
        const returnNewBgColorStr = (elmColor) => {
            const oldRgbAry = toAryForDecClr(elmColor);
            const rgbAry = returnNewBgColorAry(oldRgbAry);
            if (oldRgbAry.length === 4) {
                return `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${oldRgbAry[3]})`;
            }
            return `rgb(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]})`;
        };
        const returnRgbFromKeyword = (colorKeyword) => {
            const keywords = [
                "black",
                "silver",
                "gray",
                "white",
                "maroon",
                "red",
                "purple",
                "fuchsia",
                "green",
                "lime",
                "olive",
                "yellow",
                "navy",
                "blue",
                "teal",
                "aqua",
                "orange",
                "aliceblue",
                "antiquewhite",
                "aquamarine",
                "azure",
                "beige",
                "bisque",
                "blanchedalmond",
                "blueviolet",
                "brown",
                "burlywood",
                "cadetblue",
                "chartreuse",
                "chocolate",
                "coral",
                "cornflowerblue",
                "cornsilk",
                "crimson",
                "cyan",
                "darkblue",
                "darkcyan",
                "darkgoldenrod",
                "darkgray",
                "darkgreen",
                "darkgrey",
                "darkkhaki",
                "darkmagenta",
                "darkolivegreen",
                "darkorange",
                "darkorchid",
                "darkred",
                "darksalmon",
                "darkseagreen",
                "darkslateblue",
                "darkslategray",
                "darkslategrey",
                "darkturquoise",
                "darkviolet",
                "deeppink",
                "deepskyblue",
                "dimgray",
                "dimgrey",
                "dodgerblue",
                "firebrick",
                "floralwhite",
                "forestgreen",
                "gainsboro",
                "ghostwhite",
                "gold",
                "goldenrod",
                "greenyellow",
                "grey",
                "honeydew",
                "hotpink",
                "indianred",
                "indigo",
                "ivory",
                "khaki",
                "lavender",
                "lavenderblush",
                "lawngreen",
                "lemonchiffon",
                "lightblue",
                "lightcoral",
                "lightcyan",
                "lightgoldenrodyellow",
                "lightgray",
                "lightgreen",
                "lightgrey",
                "lightpink",
                "lightsalmon",
                "lightseagreen",
                "lightskyblue",
                "lightslategray",
                "lightslategrey",
                "lightsteelblue",
                "lightyellow",
                "limegreen",
                "linen",
                "magenta",
                "mediumaquamarine",
                "mediumblue",
                "mediumorchid",
                "mediumpurple",
                "mediumseagreen",
                "mediumslateblue",
                "mediumspringgreen",
                "mediumturquoise",
                "mediumvioletred",
                "midnightblue",
                "mintcream",
                "mistyrose",
                "moccasin",
                "navajowhite",
                "oldlace",
                "olivedrab",
                "orangered",
                "orchid",
                "palegoldenrod",
                "palegreen",
                "paleturquoise",
                "palevioletred",
                "papayawhip",
                "peachpuff",
                "peru",
                "pink",
                "plum",
                "powderblue",
                "rosybrown",
                "royalblue",
                "saddlebrown",
                "salmon",
                "sandybrown",
                "seagreen",
                "seashell",
                "sienna",
                "skyblue",
                "slateblue",
                "slategray",
                "slategrey",
                "snow",
                "springgreen",
                "steelblue",
                "tan",
                "thistle",
                "tomato",
                "turquoise",
                "violet",
                "wheat",
                "whitesmoke",
                "yellowgreen",
                "rebeccapurple"
            ];
            const rgbTexts = [
                "rgb(0,0,0)",
                "rgb(192,192,192)",
                "rgb(128,128,128)",
                "rgb(255,255,255)",
                "rgb(128,0,0)",
                "rgb(255,0,0)",
                "rgb(128,0,128)",
                "rgb(255,0,255)",
                "rgb(0,128,0)",
                "rgb(0,255,0)",
                "rgb(128,128,0)",
                "rgb(255,255,0)",
                "rgb(0,0,128)",
                "rgb(0,0,255)",
                "rgb(0,128,128)",
                "rgb(0,255,255)",
                "rgb(255,165,0)",
                "rgb(240,248,255)",
                "rgb(250,235,215)",
                "rgb(127,255,212)",
                "rgb(240,255,255)",
                "rgb(245,245,220)",
                "rgb(255,228,196)",
                "rgb(255,235,205)",
                "rgb(138,43,226)",
                "rgb(165,42,42)",
                "rgb(222,184,135)",
                "rgb(95,158,160)",
                "rgb(127,255,0)",
                "rgb(210,105,30)",
                "rgb(255,127,80)",
                "rgb(100,149,237)",
                "rgb(255,248,220)",
                "rgb(220,20,60)",
                "rgb(0,255,255)",
                "rgb(0,0,139)",
                "rgb(0,139,139)",
                "rgb(184,134,11)",
                "rgb(169,169,169)",
                "rgb(0,100,0)",
                "rgb(169,169,169)",
                "rgb(189,183,107)",
                "rgb(139,0,139)",
                "rgb(85,107,47)",
                "rgb(255,140,0)",
                "rgb(153,50,204)",
                "rgb(139,0,0)",
                "rgb(233,150,122)",
                "rgb(143,188,143)",
                "rgb(72,61,139)",
                "rgb(47,79,79)",
                "rgb(47,79,79)",
                "rgb(0,206,209)",
                "rgb(148,0,211)",
                "rgb(255,20,147)",
                "rgb(0,191,255)",
                "rgb(105,105,105)",
                "rgb(105,105,105)",
                "rgb(30,144,255)",
                "rgb(178,34,34)",
                "rgb(255,250,240)",
                "rgb(34,139,34)",
                "rgb(220,220,220)",
                "rgb(248,248,255)",
                "rgb(255,215,0)",
                "rgb(218,165,32)",
                "rgb(173,255,47)",
                "rgb(128,128,128)",
                "rgb(240,255,240)",
                "rgb(255,105,180)",
                "rgb(205,92,92)",
                "rgb(75,0,130)",
                "rgb(255,255,240)",
                "rgb(240,230,140)",
                "rgb(230,230,250)",
                "rgb(255,240,245)",
                "rgb(124,252,0)",
                "rgb(255,250,205)",
                "rgb(173,216,230)",
                "rgb(240,128,128)",
                "rgb(224,255,255)",
                "rgb(250,250,210)",
                "rgb(211,211,211)",
                "rgb(144,238,144)",
                "rgb(211,211,211)",
                "rgb(255,182,193)",
                "rgb(255,160,122)",
                "rgb(32,178,170)",
                "rgb(135,206,250)",
                "rgb(119,136,153)",
                "rgb(119,136,153)",
                "rgb(176,196,222)",
                "rgb(255,255,224)",
                "rgb(50,205,50)",
                "rgb(250,240,230)",
                "rgb(255,0,255)",
                "rgb(102,205,170)",
                "rgb(0,0,205)",
                "rgb(186,85,211)",
                "rgb(147,112,219)",
                "rgb(60,179,113)",
                "rgb(123,104,238)",
                "rgb(0,250,154)",
                "rgb(72,209,204)",
                "rgb(199,21,133)",
                "rgb(25,25,112)",
                "rgb(245,255,250)",
                "rgb(255,228,225)",
                "rgb(255,228,181)",
                "rgb(255,222,173)",
                "rgb(253,245,230)",
                "rgb(107,142,35)",
                "rgb(255,69,0)",
                "rgb(218,112,214)",
                "rgb(238,232,170)",
                "rgb(152,251,152)",
                "rgb(175,238,238)",
                "rgb(219,112,147)",
                "rgb(255,239,213)",
                "rgb(255,218,185)",
                "rgb(205,133,63)",
                "rgb(255,192,203)",
                "rgb(221,160,221)",
                "rgb(176,224,230)",
                "rgb(188,143,143)",
                "rgb(65,105,225)",
                "rgb(139,69,19)",
                "rgb(250,128,114)",
                "rgb(244,164,96)",
                "rgb(46,139,87)",
                "rgb(255,245,238)",
                "rgb(160,82,45)",
                "rgb(135,206,235)",
                "rgb(106,90,205)",
                "rgb(112,128,144)",
                "rgb(112,128,144)",
                "rgb(255,250,250)",
                "rgb(0,255,127)",
                "rgb(70,130,180)",
                "rgb(210,180,140)",
                "rgb(216,191,216)",
                "rgb(255,99,71)",
                "rgb(64,224,208)",
                "rgb(238,130,238)",
                "rgb(245,222,179)",
                "rgb(245,245,245)",
                "rgb(154,205,50)",
                "rgb(102,51,153)"
            ];
            // https://developer.mozilla.org/ja/docs/Web/CSS/color_value
            const index = keywords.indexOf(colorKeyword);
            if (index > -1) {
                // console.log(`${colorKeyword} => ${rgbTexts[index]}`);
                return rgbTexts[index];
            }
            // console.log(`${colorKeyword} => ${colorKeyword}`);
            return colorKeyword;
        };
        const returnNewGradientStr = (oldGradient) => {
            // if (oldGradient === "none") {
            //   return "none";
            // }
            const toRgbFromColorNameForGradient = (originText) => {
                const returnSplit = (originText, splitWord = ",") => {
                    if (typeof originText !== "string" || typeof splitWord !== "string") {
                        return originText;
                    }
                    const tmpAry = [];
                    switch (splitWord) {
                        case ",":
                            for (const oldText of originText.split(/ *, */)) {
                                const newText = returnSplit(oldText, ")");
                                tmpAry.push(newText);
                            }
                            break;
                        case ")":
                            for (const oldText of originText.split(/ *\) */)) {
                                const newText = returnSplit(oldText, " ");
                                tmpAry.push(newText);
                            }
                            break;
                        case " ":
                            for (const oldText of originText.split(/ +/)) {
                                if (oldText) {
                                    const newText = returnSplit(oldText, "(");
                                    tmpAry.push(newText);
                                }
                            }
                            break;
                        case "(":
                            // "("の直前はCSSの予約語が予想されるからスキップする
                            const bracketStarts = originText.split(/ *\( */);
                            const bracketStartsLength = bracketStarts.length;
                            if (bracketStartsLength > 1) {
                                tmpAry.push(bracketStarts[0]);
                                for (let i = 1; i < bracketStartsLength; i++) {
                                    tmpAry.push(returnRgbFromKeyword(bracketStarts[i]));
                                }
                            }
                            else
                                for (const bracketStart of bracketStarts) {
                                    tmpAry.push(returnRgbFromKeyword(bracketStart));
                                }
                            break;
                        default:
                            break;
                    }
                    return tmpAry.join(splitWord);
                };
                const cleanText = originText.replace(/\n/g, " ").replace(/^ */, "").replace(/ $/, "");
                const outText = returnSplit(cleanText);
                // console.log(outText);
                return outText;
            };
            let tmpGradient = toRgbFromColorNameForGradient(oldGradient);
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
                posDecClrEnd.push(tmpGradient.indexOf(")", posDecClrStart[i] + 9) + 1);
                posRgbTmp = tmpGradient.indexOf("rgb", posDecClrEnd[i]);
                if (i >= loopLimit) {
                    console.error("Infinity Loop on analyze gradient.");
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
                const oldRgbAry = toAryForDecClr(rgbStrs[i]);
                const rgbAry = returnNewBgColorAry(oldRgbAry);
                if (oldRgbAry.length === 4) {
                    hsvStrs[i] = `rgba(${rgbAry[0]}, ${rgbAry[1]}, ${rgbAry[2]}, ${oldRgbAry[3]})`;
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
        const returnCustomStyleText = (style) => {
            // CSS変数は前景色か背景色か背景画像かわからないから対応しない
            // const styleLength = style.length;
            // for (let i = 0; i < styleLength; i++) {
            //     const styleItem = style.item(i);
            //     if (styleItem.includes("--")) {
            //         printError("CSS Variable");
            //         console.log(`"${styleItem}": "${style.getPropertyValue(styleItem)}";`);
            //     }
            // }
            const colorNameToRgb = (colorName) => {
                if (!colorName) {
                    return null;
                }
                if (colorName.includes("rgb")) {
                    return colorName;
                }
                else {
                    const colorRgb = returnRgbFromKeyword(colorName);
                    if (colorRgb && colorRgb.includes("rgb")) {
                        return colorRgb;
                    }
                    return null;
                }
            };
            const styleRuleFColor = style.getPropertyValue("color");
            const styleRuleBgColor = style.getPropertyValue("background-color");
            const styleRuleBgImage = style.getPropertyValue("background-image");
            const tmpRuleFColor = colorNameToRgb(styleRuleFColor);
            const tmpRuleBgColor = colorNameToRgb(styleRuleBgColor);
            let tmpStyleRuleText = "";
            if (tmpRuleFColor) {
                if (style.getPropertyPriority("color") === "important") {
                    tmpStyleRuleText += `color:${returnNewFrontColorStr(tmpRuleFColor)} !important;`;
                }
                else {
                    tmpStyleRuleText += `color:${returnNewFrontColorStr(tmpRuleFColor)};`;
                }
            }
            if (tmpRuleBgColor) {
                if (style.getPropertyPriority("background-color") === "important") {
                    tmpStyleRuleText += `background-color:${returnNewBgColorStr(tmpRuleBgColor)} !important;`;
                }
                else {
                    tmpStyleRuleText += `background-color:${returnNewBgColorStr(tmpRuleBgColor)};`;
                }
            }
            if (styleRuleBgImage && styleRuleBgImage.includes("-gradient(")) {
                if (style.getPropertyPriority("background-image") === "important") {
                    tmpStyleRuleText += `background-image:${returnNewGradientStr(styleRuleBgImage)} !important;`;
                }
                else {
                    tmpStyleRuleText += `background-image:${returnNewGradientStr(styleRuleBgImage)};`;
                }
            }
            return tmpStyleRuleText;
        };
        let isExistCrossDomainStyleSheets = false;
        let existStyleSheets = [];
        let overrideStyleSheets = [];
        const createOverrideStyleSheetText = (rootStyleSheet) => {
            let rootCSSRuleList;
            if (rootStyleSheet instanceof CSSRuleList) {
                rootCSSRuleList = rootStyleSheet;
            }
            else {
                try {
                    rootCSSRuleList = rootStyleSheet.cssRules;
                    // console.log(rootStyleSheet.cssRules);
                }
                catch (e) {
                    console.debug(`クロスドメインリソースはよめません\n${e}`);
                    return null;
                }
            }
            let overrideStyleText = "";
            const rootCSSRuleListLength = rootCSSRuleList.length;
            for (let i = 0; i < rootCSSRuleListLength; i++) {
                const SingleCSSRule = rootCSSRuleList[i];
                if (SingleCSSRule.type === CSSRule.STYLE_RULE && SingleCSSRule instanceof CSSStyleRule) {
                    const tmpStyleRuleText = returnCustomStyleText(SingleCSSRule.style);
                    if (tmpStyleRuleText) {
                        overrideStyleText += `${SingleCSSRule.selectorText}{${tmpStyleRuleText}}`;
                    }
                }
                else if (SingleCSSRule.type === CSSRule.IMPORT_RULE && SingleCSSRule instanceof CSSImportRule) {
                    const importStyleText = createOverrideStyleSheetText(SingleCSSRule.styleSheet);
                    if (importStyleText) {
                        overrideStyleText += importStyleText;
                    }
                    else if (importStyleText === null) {
                        if (!isExistCrossDomainStyleSheets) {
                            isExistCrossDomainStyleSheets = true;
                        }
                    }
                }
                else if (SingleCSSRule.type === CSSRule.MEDIA_RULE && SingleCSSRule instanceof CSSMediaRule) {
                    overrideStyleText += `@media ${SingleCSSRule.conditionText} {${createOverrideStyleSheetText(SingleCSSRule.cssRules)}}`;
                }
                else if (SingleCSSRule.type === CSSRule.KEYFRAMES_RULE && SingleCSSRule instanceof CSSKeyframesRule) {
                    overrideStyleText += `@keyframe ${SingleCSSRule.name}{${createOverrideStyleSheetText(SingleCSSRule.cssRules)}}`;
                }
                else if (SingleCSSRule.type === CSSRule.KEYFRAME_RULE && SingleCSSRule instanceof CSSKeyframeRule) {
                    console.debug("KEYFRAME_RULE 実装思案中");
                    // console.log(SingleCSSRule);
                    // overrideStyleText += `${SingleCSSRule.keyText}{}`;
                }
                else if (SingleCSSRule.type === CSSRule.SUPPORTS_RULE && SingleCSSRule instanceof CSSSupportsRule) {
                    console.debug("SUPPORTS_RULE 実装思案中");
                    // console.log(SingleCSSRule);
                }
            }
            return overrideStyleText;
        };
        const buildOverrideStyleSheets = () => {
            isExistCrossDomainStyleSheets = false;
            existStyleSheets = [];
            overrideStyleSheets = [];
            const styleSheetList = document.styleSheets;
            const styleSheetListLength = styleSheetList.length;
            for (let i = 0; i < styleSheetListLength; i++) {
                const singleExistStyleSheet = styleSheetList[i];
                if (!(singleExistStyleSheet instanceof CSSStyleSheet)) {
                    continue;
                }
                // Now TypeScript knows that your sheet is CSS sheet
                const singleOverrideStyleSheetText = createOverrideStyleSheetText(singleExistStyleSheet);
                if (singleOverrideStyleSheetText) {
                    const singleExistStyleSheetOwnerNode = singleExistStyleSheet.ownerNode;
                    if (singleExistStyleSheetOwnerNode instanceof Element) {
                        existStyleSheets.push(singleExistStyleSheetOwnerNode);
                        overrideStyleSheets.push(`<style class="${cssId} ${cssId}-override" media="screen">${singleOverrideStyleSheetText}</style>`);
                    }
                }
                else if (singleOverrideStyleSheetText === null) {
                    if (!isExistCrossDomainStyleSheets) {
                        isExistCrossDomainStyleSheets = true;
                    }
                }
            }
        };
        const isInNode = (elm, rootElm = document) => {
            return (elm === rootElm) ? false : rootElm.contains(elm);
        };
        const restyleElmsFromStyleAttribute = (argRecords = [{ target: document, type: "all" }]) => {
            const argRecordsLength = argRecords.length;
            const tmpTargetElms = [];
            let flagAlreadyRebuiltStyleSheets = false;
            set_targets: for (let k = 0; k < argRecordsLength; k++) {
                const argRecordType = argRecords[k].type;
                const argRecordTarget = argRecords[k].target;
                if (!isInNode(argRecordTarget, document)) {
                    continue;
                }
                const argRecordTargetTagName = argRecordTarget.tagName;
                const regex = /[a-z]/; // math要素対策
                if (regex.test(argRecordTargetTagName)) {
                    continue;
                }
                if (argRecordType === "childList") {
                    if (argRecordTargetTagName === "HEAD") {
                        for (const addNode of argRecords[k].addedNodes) {
                            if (addNode.tagName === "STYLE" || addNode.tagName === "LINK" && addNode.rel.includes("stylesheet")) {
                                buildOverrideStyleSheets();
                                flagAlreadyRebuiltStyleSheets = true;
                                break;
                            }
                        }
                        for (const removedNode of argRecords[k].removedNodes) {
                            if (removedNode.tagName === "STYLE" || removedNode.tagName === "LINK" && removedNode.rel.includes("stylesheet")) {
                                buildOverrideStyleSheets();
                                flagAlreadyRebuiltStyleSheets = true;
                                break;
                            }
                        }
                    }
                }
                else if (argRecordType === "attributes") {
                    tmpTargetElms.push(argRecordTarget);
                    // 要素を処理する関数を呼ぶ リペイントを考慮しなくてよい
                }
            }
        };
        const restyleElmsFromComputedStyle = (argRecords = [{ target: document, type: "all" }]) => {
            const checkTargetTagName = (tmpTagName) => {
                return /[a-z]/.test(tmpTagName) || tmpTagName === "IFRAME" || tmpTagName === "TWITTER-WIDGET" || tmpTagName === "LINK" || tmpTagName === "META" || tmpTagName === "SCRIPT" || tmpTagName === "NOSCRIPT" || tmpTagName === "STYLE" || tmpTagName === "HEAD" || tmpTagName === "TITLE";
            };
            const argRecordsLength = argRecords.length;
            const tmpTargetElms = [];
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
                const argRecordTargetTagName = argRecordTarget.tagName;
                const regex = /[a-z]/; // math要素対策
                if (regex.test(argRecordTargetTagName)) {
                    continue;
                }
                // Twitter Widget 20200630
                if (!scriptOptionLightStyle && (argRecordTargetTagName === "TWITTER-WIDGET" || argRecordTargetTagName === "IFRAME" && argRecordTarget.classList.contains("twitter-timeline"))) {
                    if (!argRecordTarget.hasAttribute(dataTwitterWidgetOverridden)) {
                        const twShadowRoot = argRecordTarget.shadowRoot;
                        const simpleCss = document.createElement('style');
                        simpleCss.type = "text/css";
                        simpleCss.insertAdjacentHTML('beforeend', simpleDarkStyleString + darkScrollStyleString);
                        if (twShadowRoot && twShadowRoot.mode === "open") {
                            argRecordTarget.setAttribute(dataTwitterWidgetOverridden, "");
                            twShadowRoot.appendChild(simpleCss);
                        }
                        else if (argRecordTarget.contentWindow) {
                            argRecordTarget.contentWindow.document.head.appendChild(simpleCss);
                        }
                    }
                    continue;
                }
                if (argRecordType === "characterData") {
                    if (argRecordTargetTagName === "STYLE") {
                        buildOverrideStyleSheets();
                        flagRestyleAll = true;
                        break set_targets;
                    }
                }
                else if (argRecordType === "childList") {
                    if (argRecordTargetTagName === "HEAD") {
                        for (const addNode of argRecords[k].addedNodes) {
                            if (addNode.tagName === "STYLE" || addNode.tagName === "LINK" && addNode.rel.includes("stylesheet")) {
                                buildOverrideStyleSheets();
                                flagRestyleAll = true;
                                break set_targets;
                            }
                        }
                        for (const removedNode of argRecords[k].removedNodes) {
                            if (removedNode.tagName === "STYLE" || removedNode.tagName === "LINK" && removedNode.rel.includes("stylesheet")) {
                                buildOverrideStyleSheets();
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
                    if (argRecordTargetTagName === "HTML") {
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
                restyleTargetElms = document.getElementsByTagName('*');
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
                if (checkTargetTagName(restyleTargetTagName)) {
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
                if (styleBgColor.includes("rgb(") || toAryForDecClr(styleBgColor)[3] !== 0) {
                    if (!restyleTargetElms[i].hasAttribute(dataOriginBgcolor) || styleBgColor !== restyleTargetElms[i].getAttribute(dataOriginBgcolor) && styleBgColor !== restyleTargetElms[i].style.getPropertyValue(cssVariableBgcolor)) {
                        restyleTargetElms[i].style.setProperty(cssVariableBgcolor, returnNewBgColorStr(styleBgColor));
                        restyleTargetElms[i].setAttribute(dataOriginBgcolor, styleBgColor);
                    }
                }
                else if (restyleTargetElms[i].hasAttribute(dataOriginBgcolor)) {
                    restyleTargetElms[i].removeAttribute(dataOriginBgcolor);
                }
                // 画像・背景画像を装飾を装飾
                if (scriptOptionImageFloat) {
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
                    else if (restyleTargetElms[i].hasAttribute(dataOriginFilters)) {
                        restyleTargetElms[i].removeAttribute(dataOriginFilters);
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
                    if (!restyleTargetElms[i].hasAttribute(dataOriginBgimage) || styleBgimage !== restyleTargetElms[i].getAttribute(dataOriginBgimage) && styleBgimage !== restyleTargetElms[i].style.getPropertyValue(cssVariableBgimage)) {
                        restyleTargetElms[i].style.setProperty(cssVariableBgimage, returnNewGradientStr(styleBgimage));
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
                    else if (restyleTargetElms[i].hasAttribute(dataEnableTextShadow)) {
                        restyleTargetElms[i].removeAttribute(dataEnableTextShadow);
                    }
                }
                // 前景色
                if (styleFcolor.includes("rgb(") || toAryForDecClr(styleFcolor)[3] !== 0) {
                    if (!restyleTargetElms[i].hasAttribute(dataOriginFcolor) || styleFcolor !== restyleTargetElms[i].getAttribute(dataOriginFcolor) && styleFcolor !== restyleTargetElms[i].style.getPropertyValue(cssVariableFcolor)) {
                        const newFrontColor = returnNewFrontColorStr(styleFcolor);
                        restyleTargetElms[i].style.setProperty(cssVariableFcolor, newFrontColor);
                        restyleTargetElms[i].setAttribute(dataOriginFcolor, styleFcolor);
                        // visited
                        if (restyleTargetTagName === "A") {
                            if (!restyleTargetElms[i].hasAttribute(dataEnableFcolorVisited)) {
                                restyleTargetElms[i].setAttribute(dataEnableFcolorVisited, "");
                            }
                            restyleTargetElms[i].style.setProperty(cssVariableFcolorVisited, returnNewVisitedColorStr(newFrontColor));
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
        const removeOverrideStyleSheets = () => {
            const oldOverrideStyleSheets = document.getElementsByClassName(cssId);
            const oldOverrideStyleSheetsLength = oldOverrideStyleSheets.length;
            for (let i = 0; i < oldOverrideStyleSheetsLength; i++) {
                if (oldOverrideStyleSheets[i]) {
                    oldOverrideStyleSheets[i].remove();
                }
            }
        };
        const appendOverrideStyleSheets = () => {
            const overrideStyleSheetsLength = overrideStyleSheets.length;
            for (let i = 0; i < overrideStyleSheetsLength; i++) {
                if (isInNode(existStyleSheets[i], document)) {
                    existStyleSheets[i].insertAdjacentHTML("afterend", overrideStyleSheets[i]);
                }
            }
        };
        if (isInNode(tmpCss, head)) {
            head.removeChild(tmpCss);
        }
        removeOverrideStyleSheets();
        restyleElmsFromComputedStyle([{ target: document, type: "all" }]);
        buildOverrideStyleSheets();
        appendOverrideStyleSheets();
        head.appendChild(dynamicCss);
        let addedWorkCount = 0;
        let continuousWorkCount = 0;
        let isRunning = false;
        let needRework = true;
        let isMarkedPerformanceStart = false;
        let restyleRecords = [];
        const optionLite = {
            attributes: true,
            attributeFilter: ["style"],
            childList: true,
            subtree: true
        };
        const optionHeavy = {
            attributes: true,
            attributeFilter: ["class", "style"],
            characterData: true,
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
                    console.error("observer thrown out work.\nbecause this web page changes frequently.");
                    // window.alert("Observer for restyle is going to stop.\nBecause this web page changes frequently.\n\nページの変更が激しいので\n電力消費を抑えるために変更の検知を停止します。");
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
                        // head.removeChild(dynamicCss);
                        removeOverrideStyleSheets();
                        const tmpRecords = restyleRecords;
                        restyleRecords = [];
                        restyleElmsFromComputedStyle(tmpRecords);
                        appendOverrideStyleSheets();
                        head.appendChild(dynamicCss);
                        obs.observe(document, optionHeavy);
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
        observer.observe(document, optionHeavy);
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
