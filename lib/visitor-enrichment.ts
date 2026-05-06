/** Extract visitor identity hints from free text (silent, server-side). */

export interface ExtractedVisitorHints {
  email?: string;
  name?: string;
  company?: string;
}

const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const NAME_PATTERNS: RegExp[] = [
  /(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]{2,}){0,3})/i,
  /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+){0,2})\s*[,.\-]/,
];

const COMPANY_PATTERNS: RegExp[] = [
  /tengo (?:un|una) ([^.!?]{3,60})/i,
  /trabajo en ([^.!?]{3,60})/i,
  /mi (?:empresa|negocio) (?:es)?\s*([^.!?]{3,60})/i,
];

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 120);
}

export function enrichFromMessage(text: string, prev: ExtractedVisitorHints): ExtractedVisitorHints {
  const out = { ...prev };
  const m = text.match(EMAIL);
  if (m?.[0]) out.email = m[0].toLowerCase();

  if (!out.name) {
    for (const re of NAME_PATTERNS) {
      const mm = text.match(re);
      if (mm?.[1] && mm[1].length >= 2) {
        out.name = clean(mm[1]);
        break;
      }
    }
  }

  if (!out.company) {
    for (const re of COMPANY_PATTERNS) {
      const mm = text.match(re);
      if (mm?.[1] && mm[1].length >= 3) {
        out.company = clean(mm[1]);
        break;
      }
    }
  }

  return out;
}
