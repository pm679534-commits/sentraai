/** Detection runs in memory. Callers must never persist or log input text or matched values. */
export const CATEGORIES = [
  "CARD",
  "AZ_FIN",
  "EMAIL",
  "PHONE",
  "SECRET",
  "IBAN",
  "FINANCIAL",
  "CONFIDENTIAL",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type DetectionMatch = {
  category: Category;
  start: number;
  end: number;
  confidence: number;
};
export type Classifier = { classify(text: string): Promise<DetectionMatch[]> };
export type ScanResult = {
  clean: boolean;
  matches: DetectionMatch[];
  maskedText: string;
};

const rules: {
  category: Category;
  pattern: RegExp;
  valid?: (value: string) => boolean;
  confidence: number;
}[] = [
  {
    category: "CARD",
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    valid: luhn,
    confidence: 0.99,
  },
  {
    category: "AZ_FIN",
    pattern: /\b[A-Z0-9]{7}\b/gi,
    valid: (value) => /\d/.test(value) && /[A-Z]/i.test(value),
    confidence: 0.79,
  },
  {
    category: "EMAIL",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    confidence: 0.98,
  },
  {
    category: "PHONE",
    pattern:
      /(?<!\w)(?:\+994|0)(?:10|50|51|55|70|77|99)[\s()-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}\b/g,
    confidence: 0.95,
  },
  {
    category: "SECRET",
    pattern:
      /\b(?:sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36,}|AKIA[0-9A-Z]{16}|(?:api[_-]?key|client[_-]?secret|password|token)\s*[:=]\s*["']?[A-Za-z0-9_\-/.+]{12,})/gi,
    confidence: 0.96,
  },
  { category: "IBAN", pattern: /\bAZ\d{2}[A-Z0-9]{24}\b/gi, confidence: 0.94 },
  {
    category: "FINANCIAL",
    pattern:
      /\b(?:revenue|net profit|ebitda|forecast|budget)\s*(?:is|of|:|=)\s*(?:AZN|USD|EUR|\$|€|₼)?\s*\d[\d,]*(?:\.\d+)?\s*(?:million|billion|m|bn)?\b/gi,
    confidence: 0.72,
  },
  {
    category: "CONFIDENTIAL",
    pattern:
      /\b(?:confidential|non-disclosure|nda|internal only)\s+(?:contract|agreement|clause|terms|document)\b/gi,
    confidence: 0.74,
  },
];

function luhn(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits))
    return false;
  let sum = 0,
    double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** The optional classifier receives text only in-process and must follow the same no-persistence contract. */
export async function scanText(
  text: string,
  classifier?: Classifier,
): Promise<ScanResult> {
  const found: DetectionMatch[] = [];
  for (const rule of rules) {
    for (const hit of text.matchAll(rule.pattern)) {
      if (hit.index === undefined || (rule.valid && !rule.valid(hit[0])))
        continue;
      found.push({
        category: rule.category,
        start: hit.index,
        end: hit.index + hit[0].length,
        confidence: rule.confidence,
      });
    }
  }
  if (classifier) found.push(...(await classifier.classify(text)));
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const matches: DetectionMatch[] = [];
  for (const hit of found)
    if (
      hit.start >= 0 &&
      hit.end <= text.length &&
      hit.end > hit.start &&
      (!matches.length || hit.start >= matches[matches.length - 1].end)
    )
      matches.push(hit);
  let maskedText = "",
    cursor = 0;
  for (const hit of matches) {
    maskedText += text.slice(cursor, hit.start) + `[${hit.category} REDACTED]`;
    cursor = hit.end;
  }
  maskedText += text.slice(cursor);
  return { clean: matches.length === 0, matches, maskedText };
}
