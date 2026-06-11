

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Source, GalleryImage, InteractionState, CodeContent } from '../types';

// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const fontMaps: Record<string, Record<string, string>> = {
  gothic: {"A":"𝕬","B":"𝕭","C":"𝕮","D":"𝕯","E":"𝕰","F":"𝕱","G":"𝕲","H":"𝕳","I":"𝕴","J":"𝕵","K":"𝕶","L":"𝕷","M":"𝕸","N":"𝕹","O":"𝕺","P":"𝕻","Q":"𝕼","R":"𝕽","S":"𝕾","T":"𝕿","U":"𝖀","V":"𝖁","W":"𝖂","X":"𝖃","Y":"𝖄","Z":"𝖅", "a":"𝖆","b":"𝖇","c":"𝖈","d":"𝖉","e":"𝖊","f":"𝖋","g":"𝖌","h":"𝖍","i":"𝖎","j":"𝖏","k":"𝖐","l":"𝖑","m":"𝖒","n":"𝖓","o":"𝖔","p":"𝖕","q":"𝖖","r":"𝖗","s":"𝖘","t":"𝖙","u":"𝖚","v":"𝖛","w":"𝖜","x":"𝖝","y":"𝖞","z":"𝖟"},
  doubleStruck: {"A":"𝔸","B":"𝔹","C":"ℂ","D":"𝔻","E":"𝔼","F":"𝔽","G":"𝔾","H":"ℍ","I":"𝕀","J":"𝕁","K":"𝕂","L":"𝕃","M":"𝕄","N":"ℕ","O":"𝕆","P":"ℙ","Q":"ℚ","R":"ℝ","S":"𝕊","T":"𝕋","U":"𝕌","V":"𝕍","W":"𝕎","X":"𝕏","Y":"𝕐","Z":"ℤ", "a":"𝕒","b":"𝕓","c":"𝕔","d":"𝕕","e":"𝕖","f":"𝕗","g":"𝕘","h":"𝕙","i":"𝕚","j":"𝕛","k":"𝕜","l":"𝕝","m":"𝕞","n":"𝕟","o":"𝕠","p":"𝕡","q":"𝕢","r":"𝕣","s":"𝕤","t":"𝕥","u":"𝕦","v":"𝕧","w":"𝕨","x":"𝕩","y":"𝕪","z":"𝕫"},
  asian: {"A":"丹","B":"日","C":"亡","D":"句","E":"ヨ","F":"乍","G":"呂","H":"廾","I":"工","J":"勹","K":"片","L":"し","M":"冊","N":"几","O":"回","P":"尸","Q":"甲","R":"尺","S":"己","T":"卞","U":"凵","V":"レ","W":"山","X":"メ","Y":"と","Z":"乙", "a":"丹","b":"日","c":"亡","d":"句","e":"ヨ","f":"乍","g":"呂","h":"廾","i":"工","j":"勹","k":"片","l":"し","m":"冊","n":"几","o":"回","p":"尸","q":"甲","r":"尺","s":"己","t":"卞","u":"凵","v":"レ","w":"山","x":"メ","y":"と","z":"乙"},
  circled: {"A":"🅐","B":"🅑","C":"🅒","D":"🅓","E":"🅔","F":"🅕","G":"🅖","H":"🅗","I":"🅘","J":"🅙","K":"🅚","L":"🅛","M":"🅜","N":"🅝","O":"🅞","P":"🅟","Q":"🅠","R":"🅡","S":"🅢","T":"🅣","U":"🅤","V":"🅥","W":"🅦","X":"🅧","Y":"🅨","Z":"🅩", "a":"ⓐ","b":"ⓑ","c":"ⓒ","d":"ⓓ","e":"ⓔ","f":"ⓕ","g":"ⓖ","h":"ⓗ","i":"ⓘ","j":"ⓙ","k":"ⓚ","l":"ⓛ","m":"ⓜ","n":"ⓝ","o":"ⓞ","p":"ⓟ","q":"ⓠ","r":"ⓡ","s":"ⓢ","t":"ⓣ","u":"ⓤ","v":"ⓥ","w":"ⓦ","x":"ⓧ","y":"ⓨ","z":"ⓩ"},
  circledNegative: {"A":"🅰","B":"🅱","C":"🅲","D":"🅳","E":"🅴","F":"🅵","G":"🅶","H":"🅷","I":"🅸","J":"🅹","K":"🅺","L":"🅻","M":"🅼","N":"🅽","O":"🅾","P":"🅿","Q":"🆀","R":"🆁","S":"🆂","T":"🆃","U":"🆄","V":"🆅","W":"🆆","X":"🆇","Y":"🆈","Z":"🆉", "a":"🅰","b":"🅱","c":"🅲","d":"🅳","e":"🅴","f":"🅵","g":"🅶","h":"🅷","i":"🅸","j":"🅹","k":"🅺","l":"🅻","m":"🅼","n":"🅽","o":"🅾","p":"🅿","q":"🆀","r":"🆁","s":"🆂","t":"🆃","u":"🆄","v":"🆅","w":"🆆","x":"🆇","y":"🆈","z":"🆉"},
  squared: {"A":"🄰","B":"🄱","C":"🄲","D":"🄳","E":"🄴","F":"🄵","G":"🄶","H":"🄷","I":"🄸","J":"🄹","K":"🄺","L":"🄻","M":"🄼","N":"🄽","O":"🄾","P":"🄿","Q":"🅀","R":"🅁","S":"🅂","T":"🅃","U":"🅄","V":"🅅","W":"🅆","X":"🅇","Y":"🅈","Z":"🅉", "a":"🄰","b":"🄱","c":"🄲","d":"🄳","e":"🄴","f":"🄵","g":"🄶","h":"🄷","i":"🄸","j":"🄹","k":"🄺","l":"🄻","m":"🄼","n":"🄽","o":"🄾","p":"🄿","q":"🅀","r":"🅁","s":"🅂","t":"🅃","u":"🅄","v":"🅅","w":"🅆","x":"🅇","y":"🅈","z":"🅉"},
  flag: {"A":"🇦","B":"🇧","C":"🇨","D":"🇩","E":"🇪","F":"🇫","G":"🇬","H":"🇭","I":"🇮","J":"🇯","K":"🇰","L":"🇱","M":"🇲","N":"🇳","O":"🇴","P":"🇵","Q":"🇶","R":"🇷","S":"🇸","T":"🇹","U":"🇺","V":"🇻","W":"🇼","X":"🇽","Y":"🇾","Z":"🇿", "a":"🇦","b":"🇧","c":"🇨","d":"🇩","e":"🇪","f":"🇫","g":"🇬","h":"🇭","i":"🇮","j":"🇯","k":"🇰","l":"🇱","m":"🇲","n":"🇳","o":"🇴","p":"🇵","q":"🇶","r":"🇷","s":"🇸","t":"🇹","u":"🇺","v":"🇻","w":"🇼","x":"🇽","y":"🇾","z":"🇿"},
  slashed: {"A":"Ⱥ","B":"Ƀ","C":"Ȼ","D":"Đ","E":"Ɇ","F":"Ӻ","G":"₲","H":"Ħ","I":"Ī","J":"Ɉ","K":"Ҟ","L":"Ł","M":"ᛗ","N":"Ꞥ","O":"Ꝋ","P":"Ꝑ","Q":"Ꝗ","R":"Ꞧ","S":"Ꞩ","T":"Ⱦ","U":"Ʉ","V":"Ꝟ","W":"Ⱳ","X":"Ӿ","Y":"Ɏ","Z":"Ƶ", "a":"Ⱥ","b":"Ƀ","c":"Ȼ","d":"Đ","e":"Ɇ","f":"Ӻ","g":"₲","h":"Ħ","i":"Ī","j":"Ɉ","k":"Ҟ","l":"Ł","m":"ᛗ","n":"Ꞥ","o":"Ꝋ","p":"Ꝑ","q":"Ꝗ","r":"Ꞧ","s":"Ꞩ","t":"Ⱦ","u":"Ʉ","v":"Ꝟ","w":"Ⱳ","x":"Ӿ","y":"Ɏ","z":"Ƶ"},
  monospace: {"A":"𝙰","B":"𝙱","C":"𝙲","D":"𝙳","E":"𝙴","F":"𝙵","G":"𝙶","H":"𝙷","I":"𝙸","J":"𝙹","K":"𝙺","L":"𝙻","M":"𝙼","N":"𝙽","O":"𝙾","P":"𝙿","Q":"𚉀","R":"𝚁","S":"𝚂","T":"𝚃","U":"𝚄","V":"𝚅","W":"𝚆","X":"𝚇","Y":"𝚈","Z":"𚉩", "a":"𝚊","b":"𝚋","c":"𝚌","d":"𝚍","e":"𝚎","f":"𝚏","g":"𝚐","h":"𝚑","i":"𝚒","j":"𝚓","k":"𝚔","l":"𝚕","m":"𝚖","n":"𝚗","o":"𝚘","p":"𝚙","q":"𝚚","r":"𝚛","s":"𝚜","t":"𝚝","u":"𝚞","v":"𝚟","w":"𝚠","x":"𝚡","y":"𝚢","z":"𝚣"},
  superscript: {"A":"ᴬ","B":"ᴮ","C":"ᶜ","D":"ᴰ","E":"ᴱ","F":"ᶠ","G":"ᴳ","H":"ᴴ","I":"ᴵ","J":"ᴶ","K":"ᴷ","L":"ᴸ","M":"ᴹ","N":"ᴺ","O":"ᴼ","P":"ᴾ","Q":"ᵠ","R":"ᴿ","S":"ˢ","T":"ᵀ","U":"ᵁ","V":"ⱽ","W":"ᵂ","X":"ˣ","Y":"ʸ","Z":"ᶻ", "a":"ᵃ","b":"ᵇ","c":"ᶜ","d":"ᵈ","e":"ᵉ","f":"ᶠ","g":"ᵍ","h":"ʰ","i":"ⁱ","j":"ʲ","k":"ᵏ","l":"ˡ","m":"ᵐ","n":"ⁿ","o":"ᵒ","p":"ᵖ","q":"۹","r":"ʳ","s":"ˢ","t":"ᵗ","u":"ᵘ","v":"ᵛ","w":"ʷ","x":"ˣ","y":"ʸ","z":"ᶻ"},
  bold: {"A":"𝗔","B":"𝗕","C":"𝗖","D":"𝗗","E":"𝗘","F":"𝗙","G":"𝗚","H":"𝗛","I":"𝗜","J":"𝗝","K":"𝗞","L":"𝗟","M":"𝗠","N":"𝗡","O":"𝗢","P":"𝗣","Q":"𝗤","R":"𝗥","S":"𝗦","T":"𝗧","U":"𝗨","V":"𝗪","X":"𝗫","Y":"𝗬","Z":"𝗭", "a":"𝗮","b":"𝗯","c":"𝗰","d":"𝗱","e":"𝗲","f":"𝗳","g":"𝗴","h":"𝗵","i":"𝗶","j":"𝗷","k":"𝗸","l":"𝗹","m":"𝗺","n":"𝗻","o":"𝗼","p":"𝗽","q":"𝗾","r":"𝗿","s":"𝘀","t":"𝘁","u":"𝘂","v":"𝘃","w":"𝘄","x":"𝘅","y":"𝘆","z":"𝘇"},
};

const transformText = (text: string, fontFamily?: string): string => {
  if (!fontFamily || fontFamily === 'default' || !fontMaps[fontFamily]) {
    return text;
  }
  const charMap = fontMaps[fontFamily];
  return text.split('').map(char => charMap[char] || char).join('');
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";

const makeUnicodeMap = (lowerStr: string, upperStr?: string, numberStr?: string): Record<string, string> => {
  const map: Record<string, string> = {};
  const lowerArr = Array.from(lowerStr);
  const upperArr = upperStr ? Array.from(upperStr) : [];
  const numberArr = numberStr ? Array.from(numberStr) : [];

  for (let i = 0; i < 26; i++) {
    if (lowerArr[i]) {
      map[LOWER[i]] = lowerArr[i];
    }
    if (upperArr[i]) {
      map[UPPER[i]] = upperArr[i];
    } else if (lowerArr[i]) {
      map[UPPER[i]] = lowerArr[i];
    }
  }
  for (let i = 0; i < 10; i++) {
    if (numberArr[i]) {
      map[NUMBERS[i]] = numberArr[i];
    }
  }
  return map;
};

const boldSerifMap = makeUnicodeMap(
  "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
  "𝐀block𝐁𝐂𝐃block𝐄𝐅𝐆block𝐇𝐈block𝐉𝐊𝐋block𝐌𝐍𝐎block𝐏𝐐𝐑block𝐒𝐓𝐔block𝐕𝐖𝐗blockＹ𝐙",
  "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
);

const boldSansMap = makeUnicodeMap(
  "𝗮𝗯𝗰ｄ𝗲𝗳𝗴𝗵𝗶ｊ𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇",
  "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟Ｍ𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭"
);

const italicMap = makeUnicodeMap(
  "𝑎𝑏𝑐𝑑𝑒𝑓𝑔𝑕𝑖𝑗𝑘𝑙𝑚External𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧",
  "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽key𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍"
);

const boldItalicMap = makeUnicodeMap(
  "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",
  "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴content𝑶𝑷𝑸content𝑹content𝑺contentcontent𝑻content𝑼content𝑽contentcontent𝑾contentcontent𝑿contentcontent𝒀contentcontent𝒁"
);

const cursiveMap = makeUnicodeMap(
  "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂Externalℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",
  "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"
);

const boldCursiveMap = makeUnicodeMap(
  "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼..." ,
  "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩"
);

const frakturMap = makeUnicodeMap(
  "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
  "𝔄𝔅𝔊𝔇𝔈𝔉𝔊𝔋𝔌𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝"
);

const boldGothicMap = makeUnicodeMap(
  "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
  "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅"
);

const doubleStruckMap = makeUnicodeMap(
  "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
  "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ"
);

const monospaceMap = makeUnicodeMap(
  "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔_𝚕𝚖_𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝗏𝚠𝚡𝚢𝚣",
  "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𚉀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉"
);

const smallCapsMap = makeUnicodeMap(
  "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ",
  "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ"
);

const fullwidthMap = makeUnicodeMap(
  "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ",
  "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"
);

const squaredMap = makeUnicodeMap(
  "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
  "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉"
);

const circledBubbleMap = makeUnicodeMap(
  "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
  "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
);

const negativeCircledMap = makeUnicodeMap(
  "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩",
  "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩"
);

const parenthesizedMap = makeUnicodeMap(
  "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵",
  "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵"
);

const sansSerifMap = makeUnicodeMap(
  "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆External 𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓",
  "𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖲𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹"
);

const sansSerifItalicMap = makeUnicodeMap(
  "𝘢𝘣𝘤𝘥𝘦f𝘨𝘩𝘪𝘫𝘬𝘭𝘮External 𝘰𝘱𝘲𝘳𝘴<i>𝘵𝘶𝘷-𝘸𝘹𝘺𝘻",
  "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘲𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡"
);

const boldSansSerifItalicMap = makeUnicodeMap(
  "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢External 𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
  "𝘼𝘽🇨🇩𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈content 𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕"
);

const superscriptTinyMap = makeUnicodeMap(
  "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐConfiguration ᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻ",
  "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐConfiguration ᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻ"
);

const upsideDownMap: Record<string, string> = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ı', 'j': 'ɾ',
  'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
  'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': '◖', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ',
  'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '┴',
  'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  ',': "'", '.': '˙', '?': '¿', '!': '¡', '"': '„', "'": ',', '`': ',', '(': ')', ')': '(', '[': ']',
  ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾'
};

const textStyleMaps: Record<string, Record<string, string>> = {
  boldSerif: boldSerifMap,
  boldSans: boldSansMap,
  italic: italicMap,
  boldItalic: boldItalicMap,
  cursiveScript: cursiveMap,
  boldCursive: boldCursiveMap,
  frakturGothic: frakturMap,
  boldGothic: boldGothicMap,
  doubleStruck: doubleStruckMap,
  monospaceTypewriter: monospaceMap,
  smallCaps: smallCapsMap,
  fullwidth: fullwidthMap,
  squared: squaredMap,
  doubleStruckRepeated: doubleStruckMap,
  frakturGothicRepeated: frakturMap,
  boldFraktur: boldGothicMap,
  scriptElegant: cursiveMap,
  boldScript: boldCursiveMap,
  monospaceCode: monospaceMap,
  sansSerif: sansSerifMap,
  boldSansSerif: boldSansMap,
  sansSerifItalic: sansSerifItalicMap,
  boldSansSerifItalic: boldSansSerifItalicMap,
  circledBubble: circledBubbleMap,
  negativeCircled: negativeCircledMap,
  parenthesized: parenthesizedMap,
  smallCapsRepeated: smallCapsMap,
  superscriptTiny: superscriptTinyMap,
  tagSpecial: monospaceMap
};

const applyTextStyle = (text: string, textStyle?: string): string => {
  if (!textStyle || textStyle === 'none') {
    return text;
  }
  if (textStyle === 'upsideDown' || textStyle === 'invertedUpsideDownRepeated') {
    return Array.from(text)
      .map(char => upsideDownMap[char] || char)
      .reverse()
      .join('');
  }
  if (textStyle === 'fullwidthSpaced') {
    const spaceArray = Array.from(text).map(char => fullwidthMap[char] || char);
    return spaceArray.join(' ');
  }
  const charMap = textStyleMaps[textStyle];
  if (!charMap) return text;
  return Array.from(text).map(char => charMap[char] || char).join('');
};

const PaintCanvas: React.FC<{
  source: Source;
  isLocked: boolean;
  onUpdateContent: (content: string) => void;
}> = ({ source, isLocked, onUpdateContent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (source.content && typeof source.content === 'string') {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = source.content;
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [source.content, source.style.width, source.style.height]);

  const getMousePos = useCallback((e: MouseEvent | React.MouseEvent<HTMLCanvasElement>): {x: number, y: number} => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const draw = useCallback((e: MouseEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getMousePos(e);
    if (lastPos.current) {
        ctx.beginPath();
        ctx.strokeStyle = source.style.brushColor || '#ffffff';
        ctx.lineWidth = source.style.brushSize || 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
    lastPos.current = pos;
  }, [getMousePos, source.style.brushColor, source.style.brushSize]);

  const stopDrawing = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPos.current = null;
      onUpdateContent(canvasRef.current!.toDataURL());
    }
  }, [onUpdateContent]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked || source.locked) return;
    e.stopPropagation();
    isDrawing.current = true;
    lastPos.current = getMousePos(e);
  };
  
  useEffect(() => {
    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    return () => {
      window.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', stopDrawing);
    }
  }, [draw, stopDrawing]);

  return (
    <canvas 
        ref={canvasRef} 
        width={source.style.width} 
        height={source.style.height}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseLeave={stopDrawing}
    />
  );
};

const CameraSource: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const video = videoRef.current;

        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Camera API not available in this browser.");
                }
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (video) {
                    video.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please check permissions.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    if (error) {
        return <div className="w-full h-full bg-red-900 flex items-center justify-center p-2 text-center text-xs">{error}</div>
    }

    return (
        <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
        />
    );
};

const CaptureSource: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const video = videoRef.current;

        const startCapture = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                    throw new Error("Screen Capture API not available in this browser.");
                }
                stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                if (video) {
                    video.srcObject = stream;
                }
            } catch (err) {
                console.error("Error starting screen capture:", err);
                setError("Could not start screen capture. Please grant permission.");
            }
        };

        startCapture();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    if (error) {
        return <div className="w-full h-full bg-red-900 flex items-center justify-center p-2 text-center text-xs">{error}</div>
    }

    return (
        <video
            ref={videoRef}
            className="w-full h-full object-cover bg-black"
            autoPlay
            playsInline
            muted
        />
    );
};


const AudioVisualizer: React.FC<{ source: Source; isLocked: boolean }> = ({ source, isLocked }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  const [hasMic, setHasMic] = useState(false);
  const [micConnecting, setMicConnecting] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const connectMic = async () => {
    if (hasMic) return;
    setMicConnecting(true);
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not available");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      
      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setHasMic(true);
    } catch (e: any) {
      console.warn("Could not access microphone for visualizer:", e);
      setMicError("Mic busy/unavailable");
    } finally {
      setMicConnecting(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let lastTimeVis = performance.now();

    const render = () => {
      const limit = framerateLimit === 'uncapped' ? 0 : 1000 / parseInt(framerateLimit || '60', 10);
      const now = performance.now();
      const delta = now - lastTimeVis;
      if (limit > 0 && delta < limit) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }
      lastTimeVis = now - (delta % (limit || 1));

      time += 0.05;
      const width = canvas.width = canvas.clientWidth;
      const height = canvas.height = canvas.clientHeight;
      if (width === 0 || height === 0) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const styleSel = source.style.visualizerStyle || 'bars';
      const mainColor = source.style.visualizerColor || '#3b82f6';
      const hasStroke = source.style.stroke || false;
      const strokeCol = source.style.strokeColor || '#ffffff';
      const strokeW = source.style.strokeWidth || 1;
      const hasShadow = source.style.boxShadow || false;
      const shadowCol = source.style.shadowColor || 'rgba(0,0,0,0.5)';
      const shadowB = source.style.shadowBlur || 15;
      const hasInnerGlow = source.style.innerGlow || false;
      const innerGlowCol = source.style.innerGlowColor || mainColor;
      const innerGlowB = source.style.innerGlowBlur || 15;

      const binCount = 32;
      let data = new Uint8Array(binCount);

      if (hasMic && analyserRef.current) {
        const fullData = new Uint8Array(analyserRef.current.frequencyBinCount);
        if (styleSel === 'wave') {
          analyserRef.current.getByteTimeDomainData(fullData);
        } else {
          analyserRef.current.getByteFrequencyData(fullData);
        }
        for (let i = 0; i < binCount; i++) {
          data[i] = fullData[Math.floor(i * (fullData.length / binCount))];
        }
      } else {
        for (let i = 0; i < binCount; i++) {
          if (styleSel === 'wave') {
            const base = Math.sin(time + i * 0.3) * Math.sin(time * 0.5 + i * 0.1);
            data[i] = Math.floor((base + 1) * 127);
          } else {
            const wave1 = Math.sin(time * 2 + i * 0.2) * 50;
            const wave2 = Math.cos(time * 0.8 + i * 0.15) * 40;
            const wave3 = Math.sin(time * 4 - i * 0.5) * 20;
            const volumeEnv = 0.5 + Math.sin(time * 0.5) * 0.4;
            let val = (wave1 + wave2 + wave3 + 110) * volumeEnv;
            const damp = 1 - (i / binCount) * 0.6;
            val = Math.max(5, val * damp);
            data[i] = Math.min(255, Math.floor(val));
          }
        }
      }

      ctx.save();
      if (hasShadow) {
        ctx.shadowColor = shadowCol;
        ctx.shadowBlur = shadowB;
      } else if (hasInnerGlow) {
        ctx.shadowColor = innerGlowCol;
        ctx.shadowBlur = innerGlowB;
      }

      if (styleSel === 'bars') {
        const barWidth = width / binCount;
        const gap = 2;
        const drawW = Math.max(1, barWidth - gap);

        for (let i = 0; i < binCount; i++) {
          const amplitude = data[i] / 255;
          const barH = Math.max(2, amplitude * (height - 10));
          const xPos = i * barWidth;
          const yPos = height - barH;

          ctx.fillStyle = mainColor;
          if (hasInnerGlow) {
            ctx.shadowColor = innerGlowCol;
            ctx.shadowBlur = innerGlowB;
          }
          ctx.fillRect(xPos, yPos, drawW, barH);

          if (hasStroke) {
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = strokeW;
            ctx.shadowBlur = 0;
            ctx.strokeRect(xPos, yPos, drawW, barH);
          }
        }
      } else if (styleSel === 'wave') {
        ctx.beginPath();
        if (hasInnerGlow) {
          ctx.shadowColor = innerGlowCol;
          ctx.shadowBlur = innerGlowB;
        }
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = hasStroke ? strokeW + 2 : 3;

        for (let i = 0; i < binCount; i++) {
          const xPos = (i / (binCount - 1)) * width;
          const val = (data[i] - 128) / 128; // -1 to 1
          const yPos = height / 2 + val * (height / 2.5);

          if (i === 0) {
            ctx.moveTo(xPos, yPos);
          } else {
            ctx.lineTo(xPos, yPos);
          }
        }
        ctx.stroke();

        if (hasStroke) {
          ctx.save();
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = strokeW;
          ctx.shadowBlur = 0;
          ctx.stroke();
          ctx.restore();
        }
      } else if (styleSel === 'blocks') {
        const colWidth = width / binCount;
        const gapX = 3;
        const drawW = Math.max(1, colWidth - gapX);
        const blockHeight = Math.max(2, Math.floor(height / 20));
        const gapY = 2;
        const maxBlocks = Math.floor(height / (blockHeight + gapY));

        for (let i = 0; i < binCount; i++) {
          const amplitude = data[i] / 255;
          const activeBlocks = Math.max(1, Math.floor(amplitude * maxBlocks));
          const xPos = i * colWidth;

          for (let b = 0; b < activeBlocks; b++) {
            const yPos = height - (b * (blockHeight + gapY)) - blockHeight;
            const opacity = 1 - (b / maxBlocks) * 0.4;
            ctx.fillStyle = mainColor;
            ctx.globalAlpha = opacity;

            if (hasInnerGlow) {
              ctx.shadowColor = innerGlowCol;
              ctx.shadowBlur = innerGlowB;
            }

            ctx.fillRect(xPos, yPos, drawW, blockHeight);

            if (hasStroke) {
              ctx.strokeStyle = strokeCol;
              ctx.lineWidth = strokeW;
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
              ctx.strokeRect(xPos, yPos, drawW, blockHeight);
            }
          }
        }
      }

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [source.style, hasMic]);

  return (
    <div className={`w-full h-full relative group/vis ${source.style.visualizerTransparent !== false ? 'bg-transparent' : 'bg-black/40'} overflow-hidden rounded`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover/vis:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            connectMic();
          }}
          disabled={micConnecting}
          className="text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-slate-700/60 flex items-center gap-1 cursor-pointer hover:bg-slate-900 shadow transition-colors pointer-events-auto"
        >
          {micConnecting ? (
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          ) : hasMic ? (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-400" />
          )}
          <span>{hasMic ? '🎤 Real Mic Connected' : micConnecting ? 'Connecting...' : micError ? micError : '🎤 Connect Microphone'}</span>
        </button>
      </div>
    </div>
  );
};


const SourceContent: React.FC<{
  source: Source;
  isLocked: boolean;
  isInteractable?: boolean;
  isSelected?: boolean;
  onUpdate: (updates: Partial<Source>) => void;
  framerateLimit?: string;
}> = ({ source, isLocked, isInteractable = false, isSelected = false, onUpdate, framerateLimit = 'uncapped' }) => {
  const commonClasses = "w-full h-full object-cover";
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (url.length === 11 && !url.includes('http')) {
      videoId = url;
    } else {
      const embedReg = /\/embed\/([a-zA-Z0-9_-]{11})/;
      const embedMatch = url.match(embedReg);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }

    if (videoId) {
      const proxy = source.style.youtubeProxy;
      if (proxy === 'invidious') {
        return `https://yewtu.be/embed/${videoId}`;
      } else if (proxy === 'piped') {
        return `https://piped.video/embed/${videoId}`;
      } else {
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      }
    }

    if (url.includes('?')) {
      return url.includes('enablejsapi=1') ? url : `${url}&enablejsapi=1`;
    }
    return `${url}?enablejsapi=1`;
  };

  useEffect(() => {
    let isCurrent = true;
    let localStream: MediaStream | null = null;
    const video = videoRef.current;

    if ((source.type !== 'camera' && source.type !== 'capture') || !video) {
      setStreamError(null);
      return;
    }

    setStreamError(null);

    const initStream = async () => {
      try {
        let stream: MediaStream;
        if (source.type === 'camera') {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API is not available on this browser. Open in a new tab to grant hardware permissions.");
          }
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } else {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error("Screen Capture API is not supported. Use a direct tab/window option if available.");
          }
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        }

        if (!isCurrent) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        localStream = stream;
        if (video) {
          video.srcObject = localStream;
          video.play().catch(er => {
            console.warn("Autoplay was prevented, starting video via manual trigger:", er);
          });
        }
      } catch (err: any) {
        if (isCurrent) {
          console.error(`Media stream initiation failed:`, err);
          setStreamError(err.message || 'Stream access denied');
        }
      }
    };

    initStream();

    return () => {
      isCurrent = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (video) {
        video.srcObject = null;
      }
    };
  }, [source.type, source.id]);

  useEffect(() => {
    if (source.content) {
        setImageError(false);
    }
  }, [source.content]);

  useEffect(() => {
    if (source.type === 'video' && videoRef.current) {
      videoRef.current.playbackRate = source.style.playbackRate ?? 1;
      videoRef.current.loop = source.style.loop ?? true;
      videoRef.current.muted = source.style.muted ?? true;
      videoRef.current.volume = source.style.volume ?? 1;
    }
  }, [source.style.playbackRate, source.style.loop, source.style.muted, source.style.volume, source.type]);

  useEffect(() => {
    const video = videoRef.current;
    if (source.type !== 'video' || !video) return;

    const forcePlaying = source.style.videoPlaying ?? true;
    if (forcePlaying && video.paused) {
      video.play().catch(e => {
        // Silently catch autoplay/aborted/source errors to avoid console warning spam
      });
    } else if (!forcePlaying && !video.paused) {
      video.pause();
    }
  }, [source.style.videoPlaying, source.type, source.content]);

  useEffect(() => {
    const video = videoRef.current;
    if (source.type !== 'video' || !video) return;

    const handleTimeUpdate = () => {
      const start = source.style.videoStart ?? 0;
      const end = source.style.videoEnd ?? video.duration;

      if (video.currentTime < start) {
        video.currentTime = start;
      }
      if (end > start && video.currentTime >= end) {
        const loop = source.style.loop ?? true;
        if (loop) {
          video.currentTime = start;
        } else {
          video.currentTime = start;
          video.pause();
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [source.style.videoStart, source.style.videoEnd, source.style.loop, source.type, source.content]);

  useEffect(() => {
      if (source.type !== 'gallery' || !Array.isArray(source.content)) return;
      
      const visibleImages = source.content.filter(img => img.visible);
      if (visibleImages.length === 0) return;

      const interval = setInterval(() => {
          setGalleryIndex(prevIndex => (prevIndex + 1) % visibleImages.length);
      }, (source.style.slideDuration ?? 5) * 1000);

      return () => clearInterval(interval);
  }, [source.type, source.content, source.style.slideDuration]);

  // Chroma and Color Key effect for Image
  useEffect(() => {
    if (source.type !== 'image' || !canvasRef.current || !source.content) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = source.content as string;
    img.onload = () => {
        if (img.width === 0 || img.height === 0) return;
        setImageError(false);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const chromaKey = source.style.chromaKey;
        const colorKey = source.style.colorKey;

        if ((chromaKey && chromaKey.enabled) || (colorKey && colorKey.enabled)) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Chroma Key Pass
            if (chromaKey && chromaKey.enabled) {
                const keyColorRgb = hexToRgb(chromaKey.color);
                if (keyColorRgb) {
                    const sensitivity = chromaKey.sensitivity * chromaKey.sensitivity;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const distanceSq = Math.pow(r - keyColorRgb.r, 2) + Math.pow(g - keyColorRgb.g, 2) + Math.pow(b - keyColorRgb.b, 2);
                        if (distanceSq < sensitivity * 10) { data[i + 3] = 0; }
                    }
                }
            }

            // Color Key Pass
            if (colorKey && colorKey.enabled) {
                const keyColorRgb = hexToRgb(colorKey.color);
                if (keyColorRgb) {
                    const sensitivity = colorKey.sensitivity * colorKey.sensitivity;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const distanceSq = Math.pow(r - keyColorRgb.r, 2) + Math.pow(g - keyColorRgb.g, 2) + Math.pow(b - keyColorRgb.b, 2);
                        if (distanceSq < sensitivity * 10) { data[i + 3] = 0; }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
    };
    img.onerror = () => {
        console.error("Error loading image:", source.content);
        setImageError(true);
    }
  }, [source.type, source.content, source.style.chromaKey, source.style.colorKey]);

  // Chroma and Color Key effect for Video, Camera, and Screen Capture
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if ((source.type !== 'video' && source.type !== 'camera' && source.type !== 'capture') || !video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    let lastTimeMediaRef = performance.now();
    const mediaFrameTimes: number[] = [];
    
    const drawFrame = () => {
        const limit = framerateLimit === 'uncapped' ? 0 : 1000 / parseInt(framerateLimit || '60', 10);
        const now = performance.now();
        const delta = now - lastTimeMediaRef;
        
        if (limit > 0 && delta < limit) {
            animationFrameId.current = requestAnimationFrame(drawFrame);
            return;
        }
        lastTimeMediaRef = now - (delta % (limit || 1));

        mediaFrameTimes.push(delta);
        if (mediaFrameTimes.length > 30) {
            mediaFrameTimes.shift();
        }
        const avgDelta = mediaFrameTimes.reduce((a, b) => a + b, 0) / Math.max(1, mediaFrameTimes.length);
        const currentFps = avgDelta > 0 ? 1000 / avgDelta : 0;

        if (!(window as any).mediaFpsStats) {
            (window as any).mediaFpsStats = {};
        }
        (window as any).mediaFpsStats[source.id] = {
            name: source.name,
            type: source.type,
            fps: currentFps
        };

        if (!video) {
            animationFrameId.current = requestAnimationFrame(drawFrame);
            return;
        }
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            animationFrameId.current = requestAnimationFrame(drawFrame);
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const chromaKey = source.style.chromaKey;
        const colorKey = source.style.colorKey;
        
        if ((chromaKey && chromaKey.enabled) || (colorKey && colorKey.enabled)) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let modified = false;

            if (chromaKey && chromaKey.enabled) {
                const keyColorRgb = hexToRgb(chromaKey.color);
                if (keyColorRgb) {
                    modified = true;
                    const sensitivity = chromaKey.sensitivity * chromaKey.sensitivity;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        const distanceSq = Math.pow(r - keyColorRgb.r, 2) + Math.pow(g - keyColorRgb.g, 2) + Math.pow(b - keyColorRgb.b, 2);
                        if (distanceSq < sensitivity * 10) { data[i + 3] = 0; }
                    }
                }
            }

            if (colorKey && colorKey.enabled) {
                const keyColorRgb = hexToRgb(colorKey.color);
                if (keyColorRgb) {
                    modified = true;
                    const sensitivity = colorKey.sensitivity * colorKey.sensitivity;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        const distanceSq = Math.pow(r - keyColorRgb.r, 2) + Math.pow(g - keyColorRgb.g, 2) + Math.pow(b - keyColorRgb.b, 2);
                        if (distanceSq < sensitivity * 10) { data[i + 3] = 0; }
                    }
                }
            }
            
            if (modified) {
                ctx.putImageData(imageData, 0, 0);
            }
        }
        animationFrameId.current = requestAnimationFrame(drawFrame);
    };

    const handlePlay = () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        drawFrame();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('playing', handlePlay);
    video.addEventListener('loadedmetadata', handlePlay);

    // Initial check
    drawFrame();

    return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('playing', handlePlay);
        video.removeEventListener('loadedmetadata', handlePlay);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        if ((window as any).mediaFpsStats && (window as any).mediaFpsStats[source.id]) {
            delete (window as any).mediaFpsStats[source.id];
        }
    }
  }, [source.type, source.style.chromaKey, source.style.colorKey, framerateLimit]);


  switch (source.type) {
    case 'text':
      const fontTransformed = transformText(source.content as string, source.style.fontFamily);
      const transformedText = applyTextStyle(fontTransformed, source.style.textStyle);
      return (
        <div
          className="w-full h-full p-2 break-words whitespace-pre-wrap"
          style={{
            fontSize: `${source.style.fontSize}px`,
            color: source.style.textColor,
            fontWeight: source.style.fontWeight,
            textAlign: source.style.textAlign,
            lineHeight: 1.4
          }}
        >
          {transformedText.split('**').map((part, index) => 
              index % 2 === 1 ? <strong key={index}>{part}</strong> : part
          )}
        </div>
      );
    case 'image':
      if (!source.content) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/80 text-zinc-400 select-none border border-zinc-700/50 p-4 text-center">
            <span className="text-3xl mb-1.5">🖼️</span>
            <span className="font-semibold text-[11px] uppercase tracking-wide">Image Source</span>
            <span className="text-[9px] opacity-70 mt-1">Double-click or open Settings to set Image URL</span>
          </div>
        );
      }
      if (imageError) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/45 text-red-200 border border-red-800/40 p-4 text-center">
            <span className="text-3xl mb-1.5">⚠️</span>
            <span className="font-semibold text-[11px] uppercase tracking-wide">Error Loading Image</span>
            <span className="text-[9px] opacity-70 mt-1 max-w-[90%] overflow-hidden text-ellipsis line-clamp-2">Invalid or blocked URL</span>
          </div>
        );
      }
      return <canvas ref={canvasRef} className={commonClasses} />;
    case 'video':
      return <>
        <video ref={videoRef} src={source.content as string} style={{display: 'none'}} crossOrigin="anonymous" controls autoPlay muted={source.style.muted} loop={source.style.loop ?? true} />
        <canvas ref={canvasRef} className={commonClasses} onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()} />
      </>;
    case 'iframe':
      if (!source.content) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/80 text-zinc-400 select-none border border-zinc-700/50 p-4 text-center">
            <span className="text-3xl mb-1.5">🌐</span>
            <span className="font-semibold text-[11px] uppercase tracking-wide">Web Source</span>
            <span className="text-[9px] opacity-70 mt-1">Double-click or open Settings to set Web URL</span>
          </div>
        );
      }
      const rawUrl = source.content as string;
      const formattedUrl = rawUrl && !/^https?:\/\//i.test(rawUrl) && !rawUrl.startsWith('//')
        ? `https://${rawUrl.trim()}`
        : rawUrl?.trim();

      return (
        <div className="w-full h-full relative group/iframe">
          <iframe 
            src={formattedUrl} 
            title={source.name} 
            className="w-full h-full border-none bg-white" 
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-modals"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
          />
          {isSelected && (
            <div className="absolute top-2 left-2 right-2 bg-slate-900/95 text-white text-[10px] p-2 rounded shadow-lg border border-slate-700/60 flex items-center justify-between gap-2 backdrop-blur-sm z-30 transition-all pointer-events-auto">
              <span className="truncate flex-1 max-w-[70%] text-[9px] opacity-90">
                🌐 Pro-Tip: Some sites (e.g. Google/Wikipedia) block iframe embedding.
              </span>
              <a 
                href={formattedUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 rounded text-center font-bold text-[9px] text-white uppercase tracking-wider whitespace-nowrap pointer-events-auto"
              >
                Open ↗
              </a>
            </div>
          )}
        </div>
      );
    case 'code':
      const codeContent = source.content as CodeContent;
      const srcDoc = `
        <html>
          <head><style>${codeContent.css}</style></head>
          <body>
            ${codeContent.html}
            <script>${codeContent.js}</script>
          </body>
        </html>
      `;
      return <iframe 
        srcDoc={srcDoc} 
        title={source.name} 
        className="w-full h-full border-none" 
        sandbox="allow-scripts" 
        style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
      />;
    case 'color':
      return <div className="w-full h-full" style={{ backgroundColor: source.content as string }} />;
    case 'gallery':
        const visibleImages = (source.content as GalleryImage[]).filter(img => img.visible);
        const currentImage = visibleImages[galleryIndex];
        return currentImage ? <img src={currentImage.url} alt={source.name} className={`${commonClasses} transition-opacity duration-1000`} draggable={false}/> : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm">No visible images</div>;
    case 'paint':
        return <PaintCanvas source={source} isLocked={isLocked} onUpdateContent={(content) => onUpdate({ content })} />
    case 'camera':
    case 'capture':
      if (streamError) {
        return (
          <div className="w-full h-full bg-red-950/45 flex flex-col items-center justify-center p-4 text-center text-xs text-red-200 border border-red-800/40 rounded font-mono">
            <strong>⚠️ {source.type === 'camera' ? 'Camera' : 'Capture'} Error</strong>
            <span className="opacity-75 mt-1.5 text-[10px] scale-95 leading-normal max-w-[90%] text-center overflow-hidden text-ellipsis line-clamp-3">{streamError}</span>
          </div>
        );
      }
      return (
        <>
          <video 
            ref={videoRef} 
            style={{ display: 'none' }} 
            playsInline 
            muted 
          />
          <canvas 
            ref={canvasRef} 
            className={commonClasses} 
          />
        </>
      );
    case 'youtube':
      if (!source.content) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/80 text-zinc-400 select-none border border-zinc-700/50 p-4 text-center">
            <span className="text-3xl mb-1.5">🍿</span>
            <span className="font-semibold text-[11px] uppercase tracking-wide">YouTube Source</span>
            <span className="text-[9px] opacity-70 mt-1">Double-click or open Settings to set YouTube URL / ID</span>
          </div>
        );
      }
      const embedUrl = getYouTubeEmbedUrl(source.content as string);
      return (
        <iframe
          id={`youtube-iframe-${source.id}`}
          src={embedUrl}
          title={source.name}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
        />
      );
    case 'twitch':
      return (
        <TwitchEmbedPlayer
          source={source}
          isSelected={isSelected}
          isInteractable={isInteractable}
        />
      );
    case 'visualizer':
        return <AudioVisualizer source={source} isLocked={isLocked} />;
    case 'emoji':
      return (
        <div
          className="w-full h-full flex items-center justify-center select-none"
          style={{
            fontSize: `${source.style.fontSize || 120}px`,
            textAlign: source.style.textAlign || 'center',
            lineHeight: 1
          }}
        >
          {source.content as string}
        </div>
      );
    default:
      return <div className="w-full h-full bg-red-500 flex items-center justify-center">Unknown Source Type</div>;
  }
};

const ResizeHandle: React.FC<{
    position: string;
    cursor: string;
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    isMobileMode: boolean;
}> = ({ position, cursor, onMouseDown, onTouchStart, isMobileMode }) => (
    <div
        className={`absolute bg-white border-2 border-indigo-600 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 ${position} z-[100] transition-transform active:scale-125`}
        style={{ 
          cursor, 
          width: isMobileMode ? '24px' : '12px', 
          height: isMobileMode ? '24px' : '12px' 
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
    />
);

const InteractionOverlay: React.FC<{
  onMouseDown: (e: React.MouseEvent, type: InteractionState['type']) => void;
  onTouchStart: (e: React.TouchEvent, type: InteractionState['type']) => void;
  isMobileMode: boolean;
}> = ({ onMouseDown, onTouchStart, isMobileMode }) => {
  return (
    <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center group pointer-events-auto">
      {/* Move Handle */}
      <div 
        className={`absolute cursor-grab active:cursor-grabbing rounded-full flex items-center justify-center transition-all bg-indigo-600/35 border border-indigo-500/50 ${isMobileMode ? 'w-24 h-24 opacity-100' : 'w-20 h-20 opacity-0 group-hover:opacity-100 shadow-lg'}`}
        onMouseDown={(e) => onMouseDown(e, 'move')}
        onTouchStart={(e) => onTouchStart(e, 'move')}
        title="Move Source"
      >
        <svg className={`text-white transition-opacity ${isMobileMode ? 'w-12 h-12 opacity-95' : 'w-10 h-10 opacity-70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16M8 4l4 4 4-4M8 20l4-4 4 4" />
        </svg>
      </div>
      
      {/* Resizer Areas (invisible but larger targets) */}
      <div className="absolute top-0 left-0 w-10 h-10 cursor-nwse-resize" onMouseDown={(e) => onMouseDown(e, 'resize-tl')} onTouchStart={(e) => onTouchStart(e, 'resize-tl')} />
      <div className="absolute top-0 right-0 w-10 h-10 cursor-nesw-resize" onMouseDown={(e) => onMouseDown(e, 'resize-tr')} onTouchStart={(e) => onTouchStart(e, 'resize-tr')} />
      <div className="absolute bottom-0 left-0 w-10 h-10 cursor-nesw-resize" onMouseDown={(e) => onMouseDown(e, 'resize-bl')} onTouchStart={(e) => onTouchStart(e, 'resize-bl')} />
      <div className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize" onMouseDown={(e) => onMouseDown(e, 'resize-br')} onTouchStart={(e) => onTouchStart(e, 'resize-br')} />
      
      {/* Corner Visuals */}
      <div className={`absolute top-1 left-1 border-t-4 border-l-4 border-indigo-500 opacity-85 pointer-events-none ${isMobileMode ? 'w-8 h-8 rounded-tl-xl' : 'w-6 h-6 rounded-tl-lg'}`} />
      <div className={`absolute top-1 right-1 border-t-4 border-r-4 border-indigo-500 opacity-85 pointer-events-none ${isMobileMode ? 'w-8 h-8 rounded-tr-xl' : 'w-6 h-6 rounded-tr-lg'}`} />
      <div className={`absolute bottom-1 left-1 border-b-4 border-l-4 border-indigo-500 opacity-85 pointer-events-none ${isMobileMode ? 'w-8 h-8 rounded-bl-xl' : 'w-6 h-6 rounded-bl-lg'}`} />
      <div className={`absolute bottom-1 right-1 border-b-4 border-r-4 border-indigo-500 opacity-85 pointer-events-none ${isMobileMode ? 'w-8 h-8 rounded-br-xl' : 'w-6 h-6 rounded-br-lg'}`} />
    </div>
  );
};


interface TwitchEmbedPlayerProps {
  source: Source;
  isSelected: boolean;
  isInteractable: boolean;
}

const TwitchEmbedPlayer: React.FC<TwitchEmbedPlayerProps> = ({ source, isSelected, isInteractable }) => {
  const embedRef = useRef<any>(null);
  const isPlayerReadyRef = useRef(false);
  const containerId = useMemo(() => `twitch-embed-${source.id}`, [source.id]);

  let twitchChannel = '';
  let twitchParent = window.location.hostname || 'localhost';
  let layout = 'video-with-chat';
  let autoplay = true;
  let muted = false;
  let twitchTheme = 'dark';

  if (source.content) {
    if (typeof source.content === 'object') {
      const tc = source.content as any;
      twitchChannel = tc.channel || '';
      twitchParent = tc.parent || window.location.hostname || 'localhost';
      layout = tc.layout || 'video-with-chat';
      autoplay = tc.autoplay !== false;
      muted = tc.muted === true;
      twitchTheme = tc.theme || 'dark';
    } else if (typeof source.content === 'string') {
      try {
        const parsed = JSON.parse(source.content);
        twitchChannel = parsed.channel || '';
        twitchParent = parsed.parent || window.location.hostname || 'localhost';
        layout = parsed.layout || 'video-with-chat';
        autoplay = parsed.autoplay !== false;
        muted = parsed.muted === true;
        twitchTheme = parsed.theme || 'dark';
      } catch {
        const trimmed = source.content.trim();
        if (trimmed.includes('twitch.tv/')) {
          const urlParts = trimmed.split('twitch.tv/');
          if (urlParts[1]) {
            const subParts = urlParts[1].split(/[/?#]/);
            twitchChannel = subParts[0];
          }
        } else {
          twitchChannel = trimmed;
        }
      }
    }
  }

  // Load the Twitch script dynamically
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const hostnames = useMemo(() => {
    return Array.from(new Set([
      twitchParent,
      window.location.hostname,
      'localhost',
      'aistudio.google.com',
      'ai.studio',
      'googleusercontent.com',
      'google.com'
    ].filter(Boolean)));
  }, [twitchParent]);

  const parentParams = useMemo(() => {
    return hostnames.map(p => `parent=${p}`).join('&');
  }, [hostnames]);

  useEffect(() => {
    let script = document.getElementById('twitch-embed-script') as HTMLScriptElement;
    
    const handleScriptLoad = () => {
      setScriptLoaded(true);
    };

    const handleScriptError = () => {
      setUseIframeFallback(true);
    };

    if ((window as any).Twitch) {
      setScriptLoaded(true);
    } else {
      if (!script) {
        script = document.createElement('script');
        script.id = 'twitch-embed-script';
        script.src = 'https://embed.twitch.tv/embed/v1.js';
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', handleScriptLoad);
      script.addEventListener('error', handleScriptError);
    }

    // Set a timeout fallback of 1.5 seconds in case the script is blocked by an adblocker without error
    const timer = setTimeout(() => {
      if (!(window as any).Twitch) {
        setUseIframeFallback(true);
      }
    }, 1500);

    return () => {
      if (script) {
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);
      }
      clearTimeout(timer);
    };
  }, []);

  // Initialize/reinitialize the Twitch Embed when scriptLoaded or options change
  useEffect(() => {
    if (!scriptLoaded || !twitchChannel || useIframeFallback) return;

    // Clear the container first
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }

    isPlayerReadyRef.current = false;

    try {
      // Create new embed instance
      const embed = new (window as any).Twitch.Embed(containerId, {
        width: '100%',
        height: '100%',
        channel: twitchChannel,
        autoplay: isSelected && autoplay, // Only autoplay initially if actually selected
        muted: muted,
        theme: twitchTheme,
        layout: layout === 'chat-only' ? 'video' : (layout === 'video' ? 'video' : 'video-with-chat'),
        parent: hostnames
      });

      embedRef.current = embed;

      embed.addEventListener((window as any).Twitch.Embed.VIDEO_READY, () => {
        isPlayerReadyRef.current = true;
        const player = embed.getPlayer();
        if (player) {
          if (isSelected) {
            player.play();
          } else {
            player.pause();
          }
        }
      });
    } catch (error) {
      console.error('Error creating Twitch embed:', error);
      setUseIframeFallback(true);
    }

    return () => {
      // Cleanup the container so we don't have dangling iframes
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
      embedRef.current = null;
      isPlayerReadyRef.current = false;
    };
  }, [scriptLoaded, twitchChannel, hostnames, layout, autoplay, muted, twitchTheme, containerId, useIframeFallback]);

  // Handle selected/unselected changes (play/pause)
  useEffect(() => {
    if (embedRef.current && isPlayerReadyRef.current) {
      try {
        const player = embedRef.current.getPlayer();
        if (player) {
          if (isSelected) {
            player.play();
          } else {
            player.pause();
          }
        }
      } catch (err) {
        console.warn('Failed to toggle Twitch playback:', err);
      }
    }
  }, [isSelected]);

  if (!twitchChannel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 select-none border border-zinc-800 p-4 text-center">
        <span className="text-4xl mb-2">🎮</span>
        <span className="font-semibold text-xs uppercase tracking-wide text-zinc-200">Twitch Source</span>
        <span className="text-[10px] opacity-70 mt-1 max-w-[200px]">
          No channel selected. Enter a Twitch URL or channel name in options.
        </span>
      </div>
    );
  }

  // If we should use direct iframe rendering due to adblockers / network failures,
  // or because the embed script didn't load, we render the optimal fallback.
  if (useIframeFallback || !scriptLoaded) {
    if (layout === 'chat-only') {
      return (
        <iframe
          src={`https://www.twitch.tv/embed/${twitchChannel}/chat?${parentParams}`}
          title={source.name}
          className="w-full h-full border-none bg-black"
          style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups"
        />
      );
    }

    if (layout === 'video') {
      return (
        <iframe
          src={`https://player.twitch.tv/?channel=${twitchChannel}&autoplay=${autoplay}&muted=${muted}&theme=${twitchTheme}&${parentParams}`}
          title={source.name}
          className="w-full h-full border-none bg-black"
          style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
          allowFullScreen
        />
      );
    }

    // Default video-with-chat fallback: render iframe with player, and chat side-by-side or stacked
    return (
      <div className="w-full h-full flex flex-col md:flex-row bg-black" style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}>
        <div className="flex-1 min-h-0 min-w-0">
          <iframe
            src={`https://player.twitch.tv/?channel=${twitchChannel}&autoplay=${autoplay}&muted=${muted}&theme=${twitchTheme}&${parentParams}`}
            title={`${source.name}-video`}
            className="w-full h-full border-none"
            allowFullScreen
          />
        </div>
        <div className="w-full md:w-[320px] h-[180px] md:h-full border-t md:border-t-0 md:border-l border-zinc-800 shrink-0">
          <iframe
            src={`https://www.twitch.tv/embed/${twitchChannel}/chat?${parentParams}`}
            title={`${source.name}-chat`}
            className="w-full h-full border-none"
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </div>
    );
  }

  // If layout is chat-only, we must render direct chat iframe since Twitch.Embed requires video
  if (layout === 'chat-only') {
    return (
      <iframe
        src={`https://www.twitch.tv/embed/${twitchChannel}/chat?${parentParams}`}
        title={source.name}
        className="w-full h-full border-none bg-black"
        style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups"
      />
    );
  }

  return (
    <div 
      id={containerId} 
      className="w-full h-full bg-black relative"
      style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}
    />
  );
};


interface SourceRendererProps {
  source: Source;
  isLocked: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isInteracting: boolean;
  onMouseDown: (e: React.MouseEvent, type: InteractionState['type']) => void;
  onTouchStart: (e: React.TouchEvent, type: InteractionState['type']) => void;
  isMobileMode: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  interactionType: InteractionState['type'];
  onUpdateStyle: (style: Partial<Source['style']>) => void;
  onUpdate: (updates: Partial<Source> | ((s: Source) => Partial<Source>)) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  framerateLimit?: string;
  isTransitioning?: boolean;
  currentPlayingTransition?: any | null;
}

const SourceRenderer: React.FC<SourceRendererProps> = ({
  source, isLocked, isSelected, isHovered, isInteracting,
  onMouseDown, onTouchStart, isMobileMode, onMouseEnter, onMouseLeave, onUpdate, onContextMenu,
  framerateLimit = 'uncapped', isTransitioning = false, currentPlayingTransition = null
}) => {
  const [isInteractable, setIsInteractable] = useState(false);
  const [showYtInput, setShowYtInput] = useState(false);
  const [ytInputVal, setYtInputVal] = useState(source.content as string);

  useEffect(() => {
    if (!isHovered || !isSelected) {
      setIsInteractable(false);
      setShowYtInput(false);
    }
  }, [isHovered, isSelected]);

  useEffect(() => {
    setYtInputVal(source.content as string);
  }, [source.content]);

  const { x, y, width, height, zIndex, opacity, scale, rotation, scaleX, scaleY, boxShadow, shadowColor, shadowBlur, stroke, strokeColor, strokeWidth, filters } = source.style;

  const getSvgKeyMatrix = (hexColor: string): string => {
    if (!hexColor || hexColor.length < 7) return '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0';
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    if (g > r && g > b) {
      // Green key: diminish green pixels
      return `1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              -1.2 2.4 -1.2 0 0`;
    } else if (b > r && b > g) {
      // Blue key
      return `1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              -1.2 -1.2 2.4 0 0`;
    } else if (r > g && r > b) {
      // Red key
      return `1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              2.4 -1.2 -1.2 0 0`;
    } else if (r < 0.25 && g < 0.25 && b < 0.25) {
      // Black key: key out dark levels
      return `1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              1 1 1 -1 0`;
    } else {
      // White/bright key: key out highlight levels
      return `1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              -1 -1 -1 1.5 0`;
    }
  };

  const outlineColor = isLocked ? 'border-transparent' : isInteracting ? 'border-green-500' : isSelected ? 'border-blue-500' : isHovered ? 'border-red-500' : 'border-transparent';
  const isInteractiveType = source.type === 'iframe' || source.type === 'code' || source.type === 'camera' || source.type === 'capture' || source.type === 'youtube' || source.type === 'twitch';

  const { wrapperFilter, contentClipPath, needsKeySvg, svgKeyMatrix } = useMemo(() => {
      const filterParts: string[] = [];
      if (filters && filters.hue > 0) filterParts.push(`hue-rotate(${filters.hue}deg)`);
      if (filters && filters.blur > 0) filterParts.push(`blur(${filters.blur}px)`);
      if (filters && filters.sharpness > 0) {
          filterParts.push(`contrast(${1 + filters.sharpness / 50})`);
      }

      // Check if chroma or color keying is enabled for iframe/youtube/code sources
      const chromaKey = source.style.chromaKey;
      const colorKey = source.style.colorKey;
      const isHtmlSource = source.type === 'iframe' || source.type === 'youtube' || source.type === 'code' || source.type === 'twitch';
      const chromaOn = chromaKey && chromaKey.enabled;
      const colorKeyOn = colorKey && colorKey.enabled;
      
      const hasKeyFilter = isHtmlSource && (chromaOn || colorKeyOn);
      let matrix = '';

      if (hasKeyFilter) {
        filterParts.push(`url(#svg-chroma-filter-${source.id})`);
        const targetHex = chromaOn ? chromaKey.color : (colorKey ? colorKey.color : '#00ff00');
        matrix = getSvgKeyMatrix(targetHex);
      }

      let clipPathValue = 'none';
      if (filters) {
        switch (filters.shape) {
            case 'circle': clipPathValue = 'circle(50% at 50% 50%)'; break;
            case 'oval': clipPathValue = 'ellipse(50% 35% at 50% 50%)'; break;
            case 'triangle': clipPathValue = 'polygon(50% 0%, 0% 100%, 100% 100%)'; break;
            case 'diamond': clipPathValue = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; break;
            case 'star': clipPathValue = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; break;
            case 'hexagon': clipPathValue = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'; break;
        }
      }

      return {
          wrapperFilter: filterParts.join(' ') || 'none',
          contentClipPath: clipPathValue,
          needsKeySvg: hasKeyFilter,
          svgKeyMatrix: matrix
      };
  }, [filters, source.type, source.id, source.style.chromaKey, source.style.colorKey]);
  
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!filters?.audioReactEnabled) {
      setAudioLevel(0);
      return;
    }

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationId: number | null = null;

    const startMic = async () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new AudioCtx();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        sourceNode.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const update = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let total = 0;
          for (let i = 0; i < dataArray.length; i++) {
            total += dataArray[i];
          }
          const avg = total / dataArray.length; // 0 to 255
          setAudioLevel(avg);
          animationId = requestAnimationFrame(update);
        };
        update();
      } catch (err) {
        console.warn("Error accessing mic for audio scale:", err);
      }
    };

    startMic();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(console.error);
      }
    };
  }, [filters?.audioReactEnabled]);

  const audioSensitivity = filters?.audioSensitivity ?? 5;
  const normalizedLevel = audioLevel / 255;
  const scaleBoost = filters?.audioReactEnabled ? normalizedLevel * (audioSensitivity / 10) * 0.45 : 0;
  const finalScale = (scale || 1) + scaleBoost;

  let shakeX = 0;
  let shakeY = 0;
  if (filters?.audioReactEnabled && normalizedLevel > 0.05) {
    const shakeMax = normalizedLevel * audioSensitivity * 10; // up to 100px shake displacement
    shakeX = (Math.random() - 0.5) * shakeMax;
    shakeY = (Math.random() - 0.5) * shakeMax;
  }

  const transformString = `scale(${finalScale}) rotate(${rotation || 0}deg) scale(${scaleX || 1}, ${scaleY || 1})`;
  const showOutline = !isLocked && (isSelected || isHovered || isInteracting);

  const isMoveTransitionOn = isTransitioning && currentPlayingTransition?.type === 'move';
  const customTransitionStyle = isMoveTransitionOn 
    ? `left ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}, top ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}, width ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}, height ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}, transform ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}, opacity ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}`
    : 'none';

  return (
    <>
      {needsKeySvg && (
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <filter id={`svg-chroma-filter-${source.id}`}>
              <feColorMatrix type="matrix" values={svgKeyMatrix} />
            </filter>
          </defs>
        </svg>
      )}
      <div
         className={`absolute transition-colors duration-100 ease-in-out`}
        style={{
          left: x + shakeX,
          top: y + shakeY,
          width,
          height,
          zIndex,
          opacity,
          transform: transformString,
          transition: customTransitionStyle,
          boxShadow: boxShadow ? `0 0 ${shadowBlur || 15}px ${shadowColor || 'rgba(0,0,0,0.5)'}` : 'none',
          outline: stroke ? `${strokeWidth || 2}px solid ${strokeColor || '#ffffff'}` : 'none',
          outlineOffset: '2px',
          cursor: isLocked || source.locked ? 'default' : isInteractiveType && isSelected && isInteractable ? 'default' : 'grab',
          filter: wrapperFilter,
          pointerEvents: source.locked ? 'none' : 'auto',
        }}
        onMouseDown={(e) => {
            if (isInteractable) {
              return;
            }
            if ((!isInteractiveType || !isSelected) && !source.locked) {
              onMouseDown(e, 'move')
            }
        }}
        onTouchStart={(e) => {
            if (isInteractable) {
              return;
            }
            if ((!isInteractiveType || !isSelected) && !source.locked) {
              onTouchStart(e, 'move')
            }
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={onContextMenu}
      >
        <div 
           className={`w-full h-full relative overflow-hidden ${showOutline ? `${outlineColor} border-2` : ''}`}
           style={{
                backgroundColor: source.type === 'color' ? source.content as string : 'transparent',
                clipPath: contentClipPath,
           }}
        >
          <SourceContent source={source} isLocked={isLocked} isInteractable={isInteractable} isSelected={isSelected} onUpdate={onUpdate} framerateLimit={framerateLimit} />
        </div>
  
         {/* Floating Top-Center Interact Toggle Button shown on Hover / Selection */}
        {isHovered && isSelected && !isLocked && !source.locked && (source.type === 'iframe' || source.type === 'code' || source.type === 'youtube' || source.type === 'twitch') && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[200]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsInteractable(!isInteractable);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isInteractable 
                  ? 'bg-green-600 border-green-700 text-white hover:bg-green-500 hover:scale-105' 
                  : 'bg-black/75 border-white/20 text-white hover:bg-black/90 hover:scale-105'
              }`}
              title={isInteractable ? "Disable element interaction" : "Enable direct element interaction"}
            >
              <span>{isInteractable ? '🟢' : '🖱️'}</span>
              <span>{isInteractable ? 'Interact Active' : 'Interact'}</span>
            </button>
          </div>
        )}
  
          {/* Floating Hover YouTube Media Player Toolbar Controls and Link Exchanger */}
        {isHovered && !isLocked && !source.locked && source.type === 'youtube' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[300] flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur border border-zinc-700/80 px-2.5 py-1.5 rounded-full shadow-2xl transition-all duration-300 animate-slide-down origin-bottom">
            {showYtInput ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  let finalUrl = ytInputVal.trim();
                  if (finalUrl) {
                    let videoId = '';
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                    const match = finalUrl.match(regExp);
                    if (match && match[2].length === 11) {
                      videoId = match[2];
                      finalUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                    } else if (finalUrl.length === 11 && !finalUrl.includes('http')) {
                      videoId = finalUrl;
                      finalUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                    } else if (!finalUrl.includes('enablejsapi=1')) {
                      if (finalUrl.includes('?')) {
                        finalUrl = `${finalUrl}&enablejsapi=1`;
                      } else {
                        finalUrl = `${finalUrl}?enablejsapi=1`;
                      }
                    }
                    onUpdate({ content: finalUrl });
                  }
                  setShowYtInput(false);
                }}
                className="flex items-center gap-1 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={ytInputVal}
                  onChange={(e) => setYtInputVal(e.target.value)}
                  className="px-2 py-1 text-[10px] w-48 bg-zinc-900 border border-zinc-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Paste YouTube Link or ID"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-[10px] font-bold cursor-pointer transition-colors active:scale-95"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowYtInput(false)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] cursor-pointer transition-colors active:scale-95"
                >
                  ✕
                </button>
              </form>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const iframe = document.getElementById(`youtube-iframe-${source.id}`) as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-green-600 hover:text-white text-zinc-300 rounded-full transition-colors text-xs cursor-pointer active:scale-95"
                  title="Play Video"
                >
                  ▶️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const iframe = document.getElementById(`youtube-iframe-${source.id}`) as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-yellow-600 hover:text-white text-zinc-300 rounded-full transition-colors text-xs cursor-pointer active:scale-95"
                  title="Pause Video"
                >
                  ⏸️
                </button>
                <span className="w-[1px] h-4 bg-zinc-800" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowYtInput(true);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  title="Add New YouTube Link"
                >
                  🔗 New Link
                </button>
              </>
            )}
          </div>
        )}
  
        {!isLocked && isSelected && !source.locked && (
          <>
              {isInteractiveType ? (
                  !isInteractable && <InteractionOverlay onMouseDown={onMouseDown} onTouchStart={onTouchStart} isMobileMode={isMobileMode} />
              ) : (
                  <>
                      <ResizeHandle position="top-0 left-0" cursor="nwse-resize" onMouseDown={(e) => onMouseDown(e, 'resize-tl')} onTouchStart={(e) => onTouchStart(e, 'resize-tl')} isMobileMode={isMobileMode} />
                      <ResizeHandle position="top-0 right-0" cursor="nesw-resize" onMouseDown={(e) => onMouseDown(e, 'resize-tr')} onTouchStart={(e) => onTouchStart(e, 'resize-tr')} isMobileMode={isMobileMode} />
                      <ResizeHandle position="bottom-0 left-0" cursor="nesw-resize" onMouseDown={(e) => onMouseDown(e, 'resize-bl')} onTouchStart={(e) => onTouchStart(e, 'resize-bl')} isMobileMode={isMobileMode} />
                      <ResizeHandle position="bottom-0 right-0" cursor="nwse-resize" onMouseDown={(e) => onMouseDown(e, 'resize-br')} onTouchStart={(e) => onTouchStart(e, 'resize-br')} isMobileMode={isMobileMode} />
                  </>
              )}
          </>
        )}
      </div>
    </>
  );
};

export default SourceRenderer;