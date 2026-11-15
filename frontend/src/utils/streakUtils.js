import { MILESTONES } from './constants';
export const nextMilestone = streak => {
  const days = MILESTONES.find(m => m > streak);
  if (!days) return null;
  const prev = [...MILESTONES].reverse().find(m => m <= streak) || 0;
  return { days, remaining: days - streak, pct: Math.round(((streak - prev) / (days - prev)) * 100) };
};
