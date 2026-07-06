import type { ImageSourcePropType } from 'react-native';

const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export type MoonPhaseKey = 'nova' | 'crescente' | 'cheia' | 'minguante';

export type MoonPhaseInfo = {
  phase: MoonPhaseKey;
  label: string;
  description: string;
};

const PHASE_ORDER: MoonPhaseKey[] = ['nova', 'crescente', 'cheia', 'minguante'];

const PHASE_LABELS: Record<MoonPhaseKey, string> = {
  nova: 'Lua Nova',
  crescente: 'Lua Crescente',
  cheia: 'Lua Cheia',
  minguante: 'Lua Minguante',
};

const PHASE_DESCRIPTIONS: Record<MoonPhaseKey, string> = {
  nova: 'Momento de recomeço e intenção.',
  crescente: 'Momento de expansão e ação.',
  cheia: 'Momento de plenitude e celebração.',
  minguante: 'Momento de soltar e descansar.',
};

export const PHASE_ICONS: Record<MoonPhaseKey, ImageSourcePropType> = {
  nova: require('../../assets/icons/icon-fase-nova.png'),
  crescente: require('../../assets/icons/icon-fase-crescente.png'),
  cheia: require('../../assets/icons/icon-fase-cheia.png'),
  minguante: require('../../assets/icons/icon-fase-minguante.png'),
};

function getPhaseFraction(date: Date): number {
  const daysSinceReference = (date.getTime() - REFERENCE_NEW_MOON) / 86_400_000;
  const age = ((daysSinceReference % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  return age / SYNODIC_MONTH_DAYS;
}

function bucketize(fraction: number): MoonPhaseKey {
  const shifted = (fraction + 0.125) % 1;
  const index = Math.floor(shifted / 0.25);
  return PHASE_ORDER[index];
}

export function getMoonPhase(date: Date): MoonPhaseInfo {
  const phase = bucketize(getPhaseFraction(date));
  return { phase, label: PHASE_LABELS[phase], description: PHASE_DESCRIPTIONS[phase] };
}
