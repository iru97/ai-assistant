/**
 * Crisis Resource Type Definitions
 * For Journal Safe MVP - Mental Health Crisis Support
 */

export interface CrisisResource {
  id: string;
  name: string;
  name_es?: string;
  category: 'immediate' | 'eating-disorder' | 'lgbtq' | 'international' | 'other';
  phone?: string;
  textLine?: string;
  textInstructions?: string;
  textInstructions_es?: string;
  webChatUrl?: string;
  hours: string;
  hours_es?: string;
  languages: string[];
  specialties: string[];
  description: string;
  description_es?: string;
  priority: number; // Lower number = higher priority in list
}

export interface CrisisResourceCategory {
  id: string;
  title: string;
  title_es?: string;
  description?: string;
  description_es?: string;
  resources: CrisisResource[];
}
