export function latinToCyrillic(text: string): string {
  const replacements: [RegExp, string | ((match: string) => string)][] = [
    // Multi-character sequences first
  [/sh/gi, (m: string) => (m === m.toUpperCase() ? "Ш" : "ш")],
  [/ch/gi, (m: string) => (m === m.toUpperCase() ? "Ч" : "ч")],
  [/o['’ʻ`]/gi, (m: string) => (m[0] === m[0].toUpperCase() ? "Ў" : "ў")],
  [/g['’ʻ`]/gi, (m: string) => (m[0] === m[0].toUpperCase() ? "Ғ" : "ғ")],
  [/ng/gi, (m: string) => (m === m.toUpperCase() ? "НГ" : "нг")],

  // Single letters
  [/a/gi, (m: string) => (m === m.toUpperCase() ? "А" : "а")],
  [/b/gi, (m: string) => (m === m.toUpperCase() ? "Б" : "б")],
  [/d/gi, (m: string) => (m === m.toUpperCase() ? "Д" : "д")],
  [/e/gi, (m: string) => (m === m.toUpperCase() ? "Е" : "е")],
  [/f/gi, (m: string) => (m === m.toUpperCase() ? "Ф" : "ф")],
  [/g/gi, (m: string) => (m === m.toUpperCase() ? "Г" : "г")],
  [/h/gi, (m: string) => (m === m.toUpperCase() ? "Ҳ" : "ҳ")],
  [/i/gi, (m: string) => (m === m.toUpperCase() ? "И" : "и")],
  [/j/gi, (m: string) => (m === m.toUpperCase() ? "Ж" : "ж")],
  [/k/gi, (m: string) => (m === m.toUpperCase() ? "К" : "к")],
  [/l/gi, (m: string) => (m === m.toUpperCase() ? "Л" : "л")],
  [/m/gi, (m: string) => (m === m.toUpperCase() ? "М" : "м")],
  [/n/gi, (m: string) => (m === m.toUpperCase() ? "Н" : "н")],
  [/o/gi, (m: string) => (m === m.toUpperCase() ? "О" : "о")],
  [/p/gi, (m: string) => (m === m.toUpperCase() ? "П" : "п")],
  [/q/gi, (m: string) => (m === m.toUpperCase() ? "Қ" : "қ")],
  [/r/gi, (m: string) => (m === m.toUpperCase() ? "Р" : "р")],
  [/s/gi, (m: string) => (m === m.toUpperCase() ? "С" : "с")],
  [/t/gi, (m: string) => (m === m.toUpperCase() ? "Т" : "т")],
  [/u/gi, (m: string) => (m === m.toUpperCase() ? "У" : "у")],
  [/v/gi, (m: string) => (m === m.toUpperCase() ? "В" : "в")],
  [/x/gi, (m: string) => (m === m.toUpperCase() ? "Х" : "х")],
  [/y/gi, (m: string) => (m === m.toUpperCase() ? "Й" : "й")],
  [/z/gi, (m: string) => (m === m.toUpperCase() ? "З" : "з")],
  ];

  let output = text;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement as any);
  }
  return output;
}

export function cyrillicToLatin(text: string): string {
  const replacements: [RegExp, string][] = [
    // Multi-character first
    [/Ш/gu, "Sh"],
    [/ш/gu, "sh"],
    [/Ч/gu, "Ch"],
    [/ч/gu, "ch"],
    [/Ў/gu, "O'"],
    [/ў/gu, "o'"],
    [/Ғ/gu, "G'"],
    [/ғ/gu, "g'"],
    [/НГ/gu, "Ng"],
    [/нг/gu, "ng"],

    // Single letters
    [/А/gu, "A"],
    [/а/gu, "a"],
    [/Б/gu, "B"],
    [/б/gu, "b"],
    [/Д/gu, "D"],
    [/д/gu, "d"],
    [/Е/gu, "E"],
    [/е/gu, "e"],
    [/Ф/gu, "F"],
    [/ф/gu, "f"],
    [/Г/gu, "G"],
    [/г/gu, "g"],
    [/Ҳ/gu, "H"],
    [/ҳ/gu, "h"],
    [/И/gu, "I"],
    [/и/gu, "i"],
    [/Ж/gu, "J"],
    [/ж/gu, "j"],
    [/К/gu, "K"],
    [/к/gu, "k"],
    [/Л/gu, "L"],
    [/л/gu, "l"],
    [/М/gu, "M"],
    [/м/gu, "m"],
    [/Н/gu, "N"],
    [/н/gu, "n"],
    [/О/gu, "O"],
    [/о/gu, "o"],
    [/П/gu, "P"],
    [/п/gu, "p"],
    [/Қ/gu, "Q"],
    [/қ/gu, "q"],
    [/Р/gu, "R"],
    [/р/gu, "r"],
    [/С/gu, "S"],
    [/с/gu, "s"],
    [/Т/gu, "T"],
    [/т/gu, "t"],
    [/У/gu, "U"],
    [/у/gu, "u"],
    [/В/gu, "V"],
    [/в/gu, "v"],
    [/Х/gu, "X"],
    [/х/gu, "x"],
    [/Й/gu, "Y"],
    [/й/gu, "y"],
    [/З/gu, "Z"],
    [/з/gu, "z"],
  ];

  let output = text;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}
