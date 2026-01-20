/**
 * Caption Parser Utility
 *
 * Utilitário para separar, validar e unir legendas e hashtags.
 * Usado para manter caption e hashtags separados no banco de dados,
 * mas unidos quando enviados para o Instagram.
 */

// Regex para identificar hashtags válidas
const HASHTAG_REGEX = /#[a-zA-Z0-9_\u00C0-\u024F]+/g;

// Limites do Instagram
export const INSTAGRAM_LIMITS = {
  MAX_CAPTION_LENGTH: 2200,
  MAX_HASHTAGS: 30,
  MAX_HASHTAG_LENGTH: 30,
} as const;

/**
 * Extrai todas as hashtags de um texto
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];

  // Remove duplicatas e retorna
  return [...new Set(matches)];
}

/**
 * Remove todas as hashtags de um texto, retornando apenas a legenda
 */
export function extractCaption(text: string): string {
  return text
    .replace(HASHTAG_REGEX, '')
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

/**
 * Separa um texto em caption e hashtags
 */
export function separateCaptionAndHashtags(text: string): {
  caption: string;
  hashtags: string;
} {
  const hashtags = extractHashtags(text);
  const caption = extractCaption(text);

  return {
    caption,
    hashtags: hashtags.join(' '),
  };
}

/**
 * Une caption e hashtags em um único texto para publicação
 */
export function joinCaptionAndHashtags(
  caption: string,
  hashtags: string
): string {
  const cleanCaption = caption.trim();
  const cleanHashtags = hashtags.trim();

  if (!cleanHashtags) {
    return cleanCaption;
  }

  // Adiciona duas quebras de linha entre legenda e hashtags (padrão Instagram)
  return `${cleanCaption}\n\n${cleanHashtags}`;
}

/**
 * Valida se uma hashtag é válida
 */
export function isValidHashtag(hashtag: string): boolean {
  // Deve começar com #
  if (!hashtag.startsWith('#')) return false;

  // Remove o # para verificar o conteúdo
  const content = hashtag.slice(1);

  // Não pode estar vazio
  if (!content) return false;

  // Não pode exceder o limite de caracteres
  if (content.length > INSTAGRAM_LIMITS.MAX_HASHTAG_LENGTH) return false;

  // Só pode conter letras, números, underscores e caracteres acentuados
  if (!/^[a-zA-Z0-9_\u00C0-\u024F]+$/.test(content)) return false;

  return true;
}

/**
 * Valida um array de hashtags e retorna apenas as válidas
 */
export function validateHashtags(hashtags: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const hashtag of hashtags) {
    if (isValidHashtag(hashtag)) {
      valid.push(hashtag);
    } else {
      invalid.push(hashtag);
    }
  }

  return { valid, invalid };
}

/**
 * Formata hashtags (remove espaços extras, normaliza)
 */
export function formatHashtags(hashtagsText: string): string {
  const hashtags = extractHashtags(hashtagsText);
  return hashtags.join(' ');
}

/**
 * Conta quantas hashtags existem em um texto
 */
export function countHashtags(hashtagsText: string): number {
  const hashtags = extractHashtags(hashtagsText);
  return hashtags.length;
}

/**
 * Valida se o conteúdo está dentro dos limites do Instagram
 */
export function validateInstagramLimits(
  caption: string,
  hashtags: string
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verificar comprimento total
  const fullText = joinCaptionAndHashtags(caption, hashtags);
  if (fullText.length > INSTAGRAM_LIMITS.MAX_CAPTION_LENGTH) {
    errors.push(
      `O texto total excede ${INSTAGRAM_LIMITS.MAX_CAPTION_LENGTH} caracteres (atual: ${fullText.length})`
    );
  }

  // Verificar número de hashtags
  const hashtagCount = countHashtags(hashtags);
  if (hashtagCount > INSTAGRAM_LIMITS.MAX_HASHTAGS) {
    errors.push(
      `Número de hashtags excede o limite de ${INSTAGRAM_LIMITS.MAX_HASHTAGS} (atual: ${hashtagCount})`
    );
  }

  // Verificar hashtags inválidas
  const extractedHashtags = extractHashtags(hashtags);
  const { invalid } = validateHashtags(extractedHashtags);
  if (invalid.length > 0) {
    errors.push(`Hashtags inválidas: ${invalid.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Adiciona hashtags a um texto existente, evitando duplicatas
 */
export function addHashtags(
  existingHashtags: string,
  newHashtags: string[]
): string {
  const existing = extractHashtags(existingHashtags);
  const existingSet = new Set(existing.map((h) => h.toLowerCase()));

  const toAdd = newHashtags.filter(
    (h) => !existingSet.has(h.toLowerCase())
  );

  return [...existing, ...toAdd].join(' ');
}

/**
 * Remove hashtags específicas de um texto
 */
export function removeHashtags(
  hashtagsText: string,
  hashtagsToRemove: string[]
): string {
  const removeSet = new Set(hashtagsToRemove.map((h) => h.toLowerCase()));
  const existing = extractHashtags(hashtagsText);

  return existing
    .filter((h) => !removeSet.has(h.toLowerCase()))
    .join(' ');
}

/**
 * Sugestão: Limita hashtags ao máximo permitido
 */
export function limitHashtags(
  hashtags: string,
  max: number = INSTAGRAM_LIMITS.MAX_HASHTAGS
): string {
  const extracted = extractHashtags(hashtags);
  return extracted.slice(0, max).join(' ');
}
