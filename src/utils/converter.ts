export function latinToCyrillic(text: string): string {
  /**
   * This map contains the rules for converting Uzbek Latin script to Cyrillic.
   * The order of the rules is crucial for correct transliteration.
   * Multi-character combinations are processed before single characters
   * to avoid incorrect substitutions (e.g., 'sh' is handled before 's' and 'h').
   */
  const replacements: [RegExp, string | ((...args: string[]) => string)][] = [
    //
    // === Multi-character sequences MUST be processed first ===
    //

    // 'ts' digraph for loanwords (e.g., 'sement' -> 'цемент').
    // The letter 'c' was also used for this sound in older Latin versions.
    [/ts/gi, (m: string) => (m === "TS" || m === "Ts" ? "Ц" : "ц")],
    [/c/gi, (m: string) => (m === "C" ? "Ц" : "ц")],

    // Vowel combinations with 'Y'. These must be processed before the single 'y' rule.
    // Handles cases like 'Yevropa', 'yoz', 'yulduz', 'yaxshi'.
    [/ye/gi, (m: string) => (m === "YE" || m === "Ye" ? "Е" : "е")],
    [/yo/gi, (m: string) => (m === "YO" || m === "Yo" ? "Ё" : "ё")],
    [/yu/gi, (m: string) => (m === "YU" || m === "Yu" ? "Ю" : "ю")],
    [/ya/gi, (m: string) => (m === "YA" || m === "Ya" ? "Я" : "я")],

    // 'sh' and 'ch' digraphs with improved case handling.
    // This logic correctly handles 'SH', 'Sh', and 'sh'.
    [/sh/gi, (m: string) => (m[0] === m[0].toUpperCase() ? "Ш" : "ш")],
    [/ch/gi, (m: string) => (m[0] === m[0].toUpperCase() ? "Ч" : "ч")],

    // 'ng' is a special case because 'Ng' should become 'Нг' (mixed case).
    [
      /ng/gi,
      (m: string) => {
        if (m === "NG") return "НГ";
        if (m === "Ng") return "Нг";
        return "нг";
      },
    ],

    // Letters with apostrophes (oʻ, gʻ).
    // The regex handles various apostrophe-like characters: ', ’, ʻ, `, and ‘.
    // The standard is the modifier letter apostrophe (ʻ), U+02BB.
    [/o['’ʻ`‘]/gi, (m: string) => (m[0] === "O" ? "Ў" : "ў")],
    [/g['’ʻ`‘]/gi, (m: string) => (m[0] === "G" ? "Ғ" : "ғ")],

    // Stop sign (glottal stop) represented by various apostrophes, converted to hard sign.
    [
      /(\p{L})(['’ʻ`‘])(?=\p{L})/gu,
      (match, p1: string) => p1 + (p1.toUpperCase() === p1 ? "Ъ" : "ъ"),
    ],

    //
    // === Context-sensitive 'e' rules ===
    //

    // 'e' becomes 'э' at the start of a word or after a vowel.
    // This must come before the general 'e' -> 'е' rule below.
    // We use a negative lookbehind `(?<![yY])` to avoid incorrectly matching 'ye', which is handled above.
    // `\b` signifies a word boundary.
    [/(?<![yY])\b(e)/gi, (m: string) => (m === "E" ? "Э" : "э")],

    // This handles 'e' after a vowel.
    // The vowel list includes Latin and already-converted Cyrillic vowels to be safe.
    [
      /([aеёиоуўюяeoiuʻ])(e)/gi,
      (match, p1, p2) => p1 + (p2 === "E" ? "Э" : "э"),
    ],

    //
    // === Single letter replacements (final fallback) ===
    //
    [/a/gi, (m: string) => (m === "A" ? "А" : "а")],
    [/b/gi, (m: string) => (m === "B" ? "Б" : "б")],
    [/d/gi, (m: string) => (m === "D" ? "Д" : "д")],
    [/e/gi, (m: string) => (m === "E" ? "Е" : "е")], // All other 'e's become 'е'
    [/f/gi, (m: string) => (m === "F" ? "Ф" : "ф")],
    [/g/gi, (m: string) => (m === "G" ? "Г" : "г")], // For 'g' not followed by an apostrophe
    [/h/gi, (m: string) => (m === "H" ? "Ҳ" : "ҳ")],
    [/i/gi, (m: string) => (m === "I" ? "И" : "и")],
    [/j/gi, (m: string) => (m === "J" ? "Ж" : "ж")],
    [/k/gi, (m: string) => (m === "K" ? "К" : "к")],
    [/l/gi, (m: string) => (m === "L" ? "Л" : "л")],
    [/m/gi, (m: string) => (m === "M" ? "М" : "м")],
    [/n/gi, (m: string) => (m === "N" ? "Н" : "н")], // For 'n' not part of 'ng'
    [/o/gi, (m: string) => (m === "O" ? "О" : "о")], // For 'o' not followed by an apostrophe
    [/p/gi, (m: string) => (m === "P" ? "П" : "п")],
    [/q/gi, (m: string) => (m === "Q" ? "Қ" : "қ")],
    [/r/gi, (m: string) => (m === "R" ? "Р" : "р")],
    [/s/gi, (m: string) => (m === "S" ? "С" : "с")], // For 's' not part of 'sh'
    [/t/gi, (m: string) => (m === "T" ? "Т" : "т")],
    [/u/gi, (m: string) => (m === "U" ? "У" : "у")],
    [/v/gi, (m: string) => (m === "V" ? "В" : "в")],
    [/x/gi, (m: string) => (m === "X" ? "Х" : "х")],
    [/y/gi, (m: string) => (m === "Y" ? "Й" : "й")], // For 'y' not in 'yo', 'yu', 'ya'
    [/z/gi, (m: string) => (m === "Z" ? "З" : "з")],
  ];

  let output = text;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement as any);
  }
  return output;
}

export function cyrillicToLatin(text: string): string {
  /**
   * This map contains the rules for converting Uzbek Cyrillic script to Latin.
   * The order of rules is important. We use lookaheads `(?=...)` to handle
   * casing for words in ALL CAPS correctly.
   */
  const replacements: [RegExp, string][] = [
    //
    // === Context-sensitive 'е' rule (MUST be processed first) ===
    //
    // Before other replacements, convert 'е' to 'ye' at the start of a word or after a vowel.
    // This prevents incorrect transformations like 'Куеш' instead of 'Quyosh'.
    // `\b` is a word boundary. The vowel list includes all Cyrillic vowels.
    [/\bЕ/g, "Ye"],
    [/\bе/g, "ye"],
    [/([АаЕеЁёИиОоУуЎўЭэЮюЯя])Е/g, "$1Ye"],
    [/([АаЕеЁёИиОоУуЎўЭэЮюЯя])е/g, "$1ye"],

    //
    // === Multi-character replacements ===
    //

    // Handle ALL-CAPS digraphs by checking if the next letter is also uppercase.
    // e.g., 'ШЕР' -> 'SHER'. The lookahead `(?=[А-ЯЁЎҒҲ])` checks for an upcoming capital letter.
    [/Ц(?=[А-ЯЁЎҒҲ])/g, "TS"],
    [/Ч(?=[А-ЯЁЎҒҲ])/g, "CH"],
    [/Ш(?=[А-ЯЁЎҒҲ])/g, "SH"],
    [/Ё(?=[А-ЯЁЎҒҲ])/g, "YO"],
    [/Ю(?=[А-ЯЁЎҒҲ])/g, "YU"],
    [/Я(?=[А-ЯЁЎҒҲ])/g, "YA"],

    // Handle specific 'НГ' cases, which don't need a lookahead.
    [/НГ/g, "NG"],
    [/Нг/g, "Ng"],

    // Handle Title-Case and single uppercase digraphs.
    // e.g., 'Шер' -> 'Sher', 'Ёр' -> 'Yor'
    [/Ц/g, "Ts"],
    [/Ч/g, "Ch"],
    [/Ш/g, "Sh"],
    [/Ё/g, "Yo"],
    [/Ю/g, "Yu"],
    [/Я/g, "Ya"],

    // Handle lowercase digraphs.
    [/ц/g, "ts"],
    [/ч/g, "ch"],
    [/ш/g, "sh"],
    [/ё/g, "yo"],
    [/ю/g, "yu"],
    [/я/g, "ya"],
    [/нг/g, "ng"],

    //
    // === Single character replacements ===
    //
    // Using the standard apostrophe (') for better compatibility.
    [/Ў/g, "O'"],
    [/ў/g, "o'"],
    [/Ғ/g, "G'"],
    [/ғ/g, "g'"],
    [/Э/g, "E"], // 'э' always corresponds to 'e'
    [/э/g, "e"],
    [/Ъ/g, "'"],
    [/ъ/g, "'"],

    // Standard single letters
    [/А/g, "A"],
    [/а/g, "a"],
    [/Б/g, "B"],
    [/б/g, "b"],
    [/Д/g, "D"],
    [/д/g, "d"],
    [/Е/g, "E"],
    [/е/g, "e"], // Handles remaining 'е' (after consonants)
    [/Ф/g, "F"],
    [/ф/g, "f"],
    [/Г/g, "G"],
    [/г/g, "g"],
    [/Ҳ/g, "H"],
    [/ҳ/g, "h"],
    [/И/g, "I"],
    [/и/g, "i"],
    [/Ж/g, "J"],
    [/ж/g, "j"],
    [/К/g, "K"],
    [/к/g, "k"],
    [/Л/g, "L"],
    [/л/g, "l"],
    [/М/g, "M"],
    [/м/g, "m"],
    [/Н/g, "N"],
    [/н/g, "n"],
    [/О/g, "O"],
    [/о/g, "o"],
    [/П/g, "P"],
    [/п/g, "p"],
    [/Қ/g, "Q"],
    [/қ/g, "q"],
    [/Р/g, "R"],
    [/р/g, "r"],
    [/С/g, "S"],
    [/с/g, "s"],
    [/Т/g, "T"],
    [/т/g, "t"],
    [/У/g, "U"],
    [/у/g, "u"],
    [/В/g, "V"],
    [/в/g, "v"],
    [/Х/g, "X"],
    [/х/g, "x"],
    [/Й/g, "Y"],
    [/й/g, "y"],
    [/З/g, "Z"],
    [/з/g, "z"],
  ];

  let output = text;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}
