import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia'
// import PlinkoEngine from '../components/Pinko/PlinkoEngine';
import { binColor } from '../constants/game';
import {
  RiskLevel,
  type BetAmountOfExistingBalls,
  type RowCount,
  type WinRecord,
} from '../types';
import { interpolateRgbColors } from '../utils/colors';
import { countValueOccurrences } from '../utils/numbers';

export const useGameStore = defineStore('game', () => {
   const plinkoEngine  = ref(null)//: Ref<PlinkoEngine | null> = ref(null);

   const betAmount : Ref<number> = ref(1);

   const betAmountOfExistingBalls : Ref<BetAmountOfExistingBalls> = ref({});

   const rowCount : Ref<RowCount> = ref(16);

   const riskLevel : Ref<RiskLevel> = ref(RiskLevel.MEDIUM);

   const winRecords : Ref<WinRecord[]> = ref([]);

/**
 * History of total profits. Should be updated whenever a new win record is pushed
 * to `winRecords` store.
 *
 * We deliberately don't use `derived(winRecords, ...)` to optimize performance.
 */
 const totalProfitHistory : Ref<number[]> = ref([0]);

/**
 * Game balance, which is saved to local storage.
 *
 * We only save the balance to local storage on browser `beforeunload` event instead of
 * on every balance change. This prevents unnecessary writes to local storage, which can
 * be slow on low-end devices.
 */
 const balance : Ref<number> = ref(200);

/**
 * RGB colors for every bin. The length of the array is the number of bins.
 */
const binColors = computed<{ background: string[]; shadow: string[] }>(() => {
  const binCount = rowCount.value + 1;
  const isBinsEven = binCount % 2 === 0;
  const redToYellowLength = Math.ceil(binCount / 2);

  const redToYellowBg = interpolateRgbColors(
    binColor.background.red,
    binColor.background.yellow,
    redToYellowLength,
  ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

  const redToYellowShadow = interpolateRgbColors(
    binColor.shadow.red,
    binColor.shadow.yellow,
    redToYellowLength,
  ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

  return {
    background: [...redToYellowBg, ...redToYellowBg.reverse().slice(isBinsEven ? 0 : 1)],
    shadow: [...redToYellowShadow, ...redToYellowShadow.reverse().slice(isBinsEven ? 0 : 1)],
  };
});

const binProbabilities = computed<{ [binIndex: number]: number }>(() => {
  const occurrences = countValueOccurrences(winRecords.value.map(({ binIndex }) => binIndex));
  const probabilities: Record<number, number> = {};
  for (let i = 0; i < rowCount.value + 1; ++i) {
    probabilities[i] = occurrences[i] / winRecords.value.length || 0;
  }
  return probabilities;
});

  return { plinkoEngine, betAmount, betAmountOfExistingBalls, rowCount, riskLevel, winRecords, totalProfitHistory, balance, binColors, binProbabilities }
})
