export interface CulturalSlangTerm {
  term: string;
  language: string;
  meaning: string;
  culturalNote: string;
}

export const CULTURAL_DICTIONARY: Record<string, CulturalSlangTerm> = {
  macha: {
    term: "Macha",
    language: "Kannada / Tamil / Bengaluru Slang",
    meaning: "Brother, close buddy, pal",
    culturalNote: "Ubiquitous Bengaluru informal address among close friends and peers.",
  },
  bombat: {
    term: "Bombat",
    language: "Kannada",
    meaning: "Superb, top-tier, fantastic",
    culturalNote: "Used to describe extraordinary food, art, or weather.",
  },
  jugaad: {
    term: "Jugaad",
    language: "Hindi / Pan-Indian",
    meaning: "Ingenious, frugal hack or workaround",
    culturalNote: "A quintessential Indian mindset of resourcefulness and making things work.",
  },
  "swalpa adjust": {
    term: "Swalpa Adjust Maadi",
    language: "Kannada",
    meaning: "Please accommodate a little bit",
    culturalNote: "The golden rule of Bengaluru public transport, shared seating, and community living.",
  },
  bindass: {
    term: "Bindass",
    language: "Bambaiya Hindi",
    meaning: "Carefree, unbothered, relaxed",
    culturalNote: "Emphasizes taking things lightly without undue anxiety.",
  },
  adda: {
    term: "Adda",
    language: "Bengali / Hindi",
    meaning: "Informal friendly gathering spot",
    culturalNote: "A designated cafe corner, street corner, or campus tea stall where friends sit for hours talking about philosophy, cinema, and ideas.",
  },
  chalta: {
    term: "Chalta Hai",
    language: "Hindi",
    meaning: "It's alright, acceptable, let it be",
    culturalNote: "Everyday tolerance and flexibility in Indian urban life.",
  },
};

export interface BhashaTranslationResult {
  hasSlang: boolean;
  detectedSlangs: CulturalSlangTerm[];
  translatedText: string;
  sourceLanguage: string;
}

export const translateWithBhasha = (text: string): BhashaTranslationResult => {
  const lower = text.toLowerCase();
  const detectedSlangs: CulturalSlangTerm[] = [];

  for (const [key, termObj] of Object.entries(CULTURAL_DICTIONARY)) {
    if (lower.includes(key)) {
      detectedSlangs.push(termObj);
    }
  }

  // Sample contextual translations for Balaga demo posts
  let translatedText = text;
  let sourceLanguage = "Mixed Regional / Indlish";

  if (lower.includes("bombat") || lower.includes("macha")) {
    sourceLanguage = "Kannada-English Urban Vernacular";
    translatedText = text
      .replace(/macha/gi, "buddy")
      .replace(/bombat/gi, "fantastic")
      .replace(/swalpa adjust/gi, "kindly adjust a bit");
  } else if (lower.includes("jugaad") || lower.includes("adda") || lower.includes("bindass")) {
    sourceLanguage = "Hinglish / Cultural Dialect";
    translatedText = text
      .replace(/jugaad/gi, "ingenious creative hack")
      .replace(/adda/gi, "hangout spot")
      .replace(/bindass/gi, "carefree and confident");
  } else {
    sourceLanguage = "English (Nuanced Translation Ready)";
    translatedText = `[Bhasha Nuance]: "${text}" — Preserved with regional context and conversational warmth.`;
  }

  return {
    hasSlang: detectedSlangs.length > 0,
    detectedSlangs,
    translatedText,
    sourceLanguage,
  };
};
