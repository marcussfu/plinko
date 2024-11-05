import { ref, computed } from 'vue';
import { defineStore } from 'pinia'
// import PlinkoEngine from '../components/Plinko/PlinkoEngine';
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
  //  const plinkoEngine  = ref<PlinkoEngine | null>(null);

   const betAmount = ref<number>(1);

   const setBetAmount = (value: number) => {
    betAmount.value = value;
   }

   const betAmountOfExistingBalls = ref<BetAmountOfExistingBalls>({});

   const updateBetAmountOfExistingBalls = (ballId:number) => {
    betAmountOfExistingBalls.value = {...betAmountOfExistingBalls.value, [ballId]: betAmount.value};
   }

   const initBetAmountOfExistingBalls = () => {
    betAmountOfExistingBalls.value = {};
   }

   const deleteItemFromBetAmountOfExistingBalls = (ballId:number) => {
    // const newValue = {...betAmountOfExistingBalls.value};
    // delete newValue[ballId];
    // betAmountOfExistingBalls.value = {...newValue};
    delete betAmountOfExistingBalls.value[ballId];
   }

   const rowCount = ref<RowCount>(16);

   const setRowCount = (value:RowCount) => {
    rowCount.value = value;
   }

   const riskLevel = ref<RiskLevel>(RiskLevel.MEDIUM);

   const setRiskLevel = (value: RiskLevel) => {
    riskLevel.value = value;
   }

   const winRecords = ref<WinRecord[]>([]);

   const updateWinRecords = (value:WinRecord) => {
    winRecords.value.push(value);
   }

   const isDropBall = ref<boolean>(false);

   const setDropBall = (value: boolean) => {
    isDropBall.value = value;
   }

   const isBallEnterBins = ref<boolean[]>([]);

   const setIsBallEnterBins = (index: number, value: boolean) => {
    if (isBallEnterBins.value.length > 0)
      isBallEnterBins.value[index] = value;
   }

/**
 * History of total profits. Should be updated whenever a new win record is pushed
 * to `winRecords` store.
 *
 * We deliberately don't use `derived(winRecords, ...)` to optimize performance.
 */
 const totalProfitHistory = ref<number[]>([0]);

 const updateTotalProfitHistory = (profit:number) => {
    const lastTotalProfit = totalProfitHistory.value.slice(-1)[0];
    totalProfitHistory.value = [...totalProfitHistory.value, lastTotalProfit + profit];
 }

/**
 * Game balance, which is saved to local storage.
 *
 * We only save the balance to local storage on browser `beforeunload` event instead of
 * on every balance change. This prevents unnecessary writes to local storage, which can
 * be slow on low-end devices.
 */
 const balance = ref<number>(200);

 const updateBalance = (value:number) => {
  balance.value += value;
 }

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

  return {
    // plinkoEngine,
    betAmount,
    betAmountOfExistingBalls,
    rowCount,
    riskLevel,
    winRecords,
    totalProfitHistory,
    balance,
    binColors,
    binProbabilities,
    isDropBall,
    isBallEnterBins,
    setDropBall,
    setBetAmount,
    setRiskLevel,
    setRowCount,
    setIsBallEnterBins,
    initBetAmountOfExistingBalls,
    deleteItemFromBetAmountOfExistingBalls,
    updateBalance,
    updateWinRecords,
    updateTotalProfitHistory,
    updateBetAmountOfExistingBalls,
   }
})
