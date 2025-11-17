/**
 * Crisis Resources Data
 * For Journal Safe MVP - Mental Health Crisis Support
 *
 * IMPORTANT: All resources are verified and legitimate
 * Last updated: 2025
 */

import { CrisisResource } from '~/types/crisis';

export const crisisResources: CrisisResource[] = [
  // IMMEDIATE CRISIS RESOURCES
  {
    id: '988-lifeline',
    name: '988 Suicide & Crisis Lifeline',
    name_es: 'Línea de Prevención del Suicidio 988',
    category: 'immediate',
    phone: '988',
    textLine: '988',
    textInstructions: 'Call or text 988',
    textInstructions_es: 'Llame o envíe un mensaje de texto al 988 (luego presione 2 para español)',
    webChatUrl: 'https://988lifeline.org/chat',
    hours: '24/7',
    hours_es: '24/7',
    languages: ['English', 'Spanish'],
    specialties: ['Suicide prevention', 'Mental health crisis', 'Emotional distress'],
    description: 'Free, confidential support 24/7 for people in suicidal crisis or emotional distress. Trained counselors provide compassionate care.',
    description_es: 'Apoyo gratuito y confidencial las 24 horas para personas en crisis suicida o angustia emocional. Consejeros capacitados brindan atención compasiva.',
    priority: 1,
  },
  {
    id: 'crisis-text-line',
    name: 'Crisis Text Line',
    name_es: 'Línea de Texto en Crisis',
    category: 'immediate',
    textLine: '741741',
    textInstructions: 'Text HELLO to 741741',
    textInstructions_es: 'Envíe un mensaje de texto con la palabra HOLA al 741741',
    hours: '24/7',
    hours_es: '24/7',
    languages: ['English', 'Spanish'],
    specialties: ['All crises', 'Text-based support', 'Anonymous'],
    description: 'Free 24/7 text support for any crisis. Text HELLO to connect with a trained Crisis Counselor. For Spanish, text HOLA.',
    description_es: 'Apoyo gratuito por mensaje de texto 24/7 para cualquier crisis. Envíe HOLA para conectarse con un consejero de crisis capacitado.',
    priority: 2,
  },

  // EATING DISORDER SPECIFIC
  {
    id: 'neda-hotline',
    name: 'NEDA Hotline',
    name_es: 'Línea Directa NEDA',
    category: 'eating-disorder',
    phone: '1-800-931-2237',
    textLine: '741741',
    textInstructions: 'Text "NEDA" to 741741',
    textInstructions_es: 'Envíe "NEDA" al 741741',
    hours: 'Mon-Thu: 9am-9pm ET, Fri: 9am-5pm ET',
    hours_es: 'Lun-Jue: 9am-9pm ET, Vie: 9am-5pm ET',
    languages: ['English', 'Spanish available'],
    specialties: ['Eating disorders', 'Anorexia', 'Bulimia', 'Binge eating', 'Body image'],
    description: 'National Eating Disorders Association support line. Trained volunteers provide support, information, and referrals for eating disorders.',
    description_es: 'Línea de apoyo de la Asociación Nacional de Trastornos Alimentarios. Voluntarios capacitados brindan apoyo, información y referencias.',
    priority: 3,
  },

  // LGBTQ+ SUPPORT
  {
    id: 'trevor-project',
    name: 'The Trevor Project',
    name_es: 'El Proyecto Trevor',
    category: 'lgbtq',
    phone: '1-866-488-7386',
    textLine: '678-678',
    textInstructions: 'Text START to 678-678',
    textInstructions_es: 'Envíe START al 678-678',
    webChatUrl: 'https://www.thetrevorproject.org/get-help/',
    hours: '24/7',
    hours_es: '24/7',
    languages: ['English'],
    specialties: ['LGBTQ+ youth', 'Suicide prevention', 'Crisis intervention', 'Coming out support'],
    description: 'Crisis support for LGBTQ+ young people under 25. Trained counselors understand LGBTQ+ experiences and provide affirming support.',
    description_es: 'Apoyo en crisis para jóvenes LGBTQ+ menores de 25 años. Consejeros capacitados que comprenden las experiencias LGBTQ+.',
    priority: 4,
  },
  {
    id: 'trans-lifeline',
    name: 'Trans Lifeline',
    name_es: 'Línea Trans',
    category: 'lgbtq',
    phone: '1-877-565-8860',
    hours: 'Daily 10am-4am ET',
    hours_es: 'Diario 10am-4am ET',
    languages: ['English', 'Spanish available'],
    specialties: ['Transgender', 'Non-binary', 'Gender questioning', 'Run by trans people'],
    description: 'Peer support hotline run by and for transgender people. All operators are transgender themselves.',
    description_es: 'Línea de apoyo entre pares dirigida por y para personas transgénero. Todos los operadores son transgénero.',
    priority: 5,
  },

  // INTERNATIONAL RESOURCES
  {
    id: 'findahelpline',
    name: 'Find A Helpline',
    name_es: 'Encuentra una Línea de Ayuda',
    category: 'international',
    webChatUrl: 'https://findahelpline.com',
    hours: 'Varies by country',
    hours_es: 'Varía según el país',
    languages: ['150+ countries', '1,300+ verified helplines'],
    specialties: ['International', 'Multi-country', 'Verified helplines'],
    description: 'Directory of 1,300+ verified crisis helplines in 150 countries. Find local mental health support anywhere in the world.',
    description_es: 'Directorio de más de 1,300 líneas de ayuda verificadas en 150 países. Encuentre apoyo local de salud mental en cualquier parte del mundo.',
    priority: 6,
  },

  // ADDITIONAL SUPPORT
  {
    id: 'samhsa',
    name: 'SAMHSA National Helpline',
    name_es: 'Línea de Ayuda Nacional SAMHSA',
    category: 'other',
    phone: '1-800-662-4357',
    hours: '24/7',
    hours_es: '24/7',
    languages: ['English', 'Spanish'],
    specialties: ['Substance abuse', 'Mental health', 'Treatment referral'],
    description: 'Substance Abuse and Mental Health Services Administration helpline. Free referrals to local treatment facilities and support groups.',
    description_es: 'Línea de ayuda de SAMHSA. Referencias gratuitas a centros de tratamiento locales y grupos de apoyo.',
    priority: 7,
  },
  {
    id: 'warm-line',
    name: 'Warmline Directory',
    name_es: 'Directorio de Líneas Cálidas',
    category: 'other',
    webChatUrl: 'https://warmline.org',
    hours: 'Varies by state',
    hours_es: 'Varía según el estado',
    languages: ['English'],
    specialties: ['Non-crisis support', 'Peer support', 'Mental health check-ins'],
    description: 'Non-crisis peer support lines for when you need to talk but are not in immediate crisis. Find your state warmline.',
    description_es: 'Líneas de apoyo entre pares para cuando necesita hablar pero no está en crisis inmediata. Encuentre la línea de su estado.',
    priority: 8,
  },
];

/**
 * Get resources by category
 */
export const getResourcesByCategory = (category: CrisisResource['category']): CrisisResource[] => {
  return crisisResources
    .filter((resource) => resource.category === category)
    .sort((a, b) => a.priority - b.priority);
};

/**
 * Get all resources sorted by priority
 */
export const getAllResourcesSorted = (): CrisisResource[] => {
  return [...crisisResources].sort((a, b) => a.priority - b.priority);
};

/**
 * Category metadata for organizing the help screen
 */
export const categoryMetadata = {
  immediate: {
    title: 'Immediate Crisis Support',
    title_es: 'Apoyo Inmediato en Crisis',
    description: 'Available 24/7 for urgent situations',
    description_es: 'Disponible 24/7 para situaciones urgentes',
    icon: '🆘',
  },
  'eating-disorder': {
    title: 'Eating Disorder Support',
    title_es: 'Apoyo para Trastornos Alimentarios',
    description: 'Specialized help for eating disorders',
    description_es: 'Ayuda especializada para trastornos alimentarios',
    icon: '💚',
  },
  lgbtq: {
    title: 'LGBTQ+ Support',
    title_es: 'Apoyo LGBTQ+',
    description: 'Affirming support for LGBTQ+ community',
    description_es: 'Apoyo afirmativo para la comunidad LGBTQ+',
    icon: '🏳️‍🌈',
  },
  international: {
    title: 'International Resources',
    title_es: 'Recursos Internacionales',
    description: 'Crisis support around the world',
    description_es: 'Apoyo en crisis en todo el mundo',
    icon: '🌍',
  },
  other: {
    title: 'Additional Support',
    title_es: 'Apoyo Adicional',
    description: 'More resources for mental health support',
    description_es: 'Más recursos para apoyo de salud mental',
    icon: '💙',
  },
};
