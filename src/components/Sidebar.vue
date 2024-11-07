<template>
    <div class="flex flex-col gap-5 bg-slate-700 p-3 lg:max-w-80 w-[320px] h-[590px]">
        <div class="flex gap-1 rounded-full bg-slate-900 p-1">
            <button v-for="item in betModes" :key="item.label" :value="item.value"
                class='flex-1 rounded-full py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50
                hover:[&:not(:disabled)]:bg-slate-600 active:[&:not(:disabled)]:bg-slate-500'
                :class="{ 'bg-slate-600' : betMode === item.value }"
                @click="betMode = item.value"
                :disabled="autoBetInterval !== null"
            >
                {{ item.label }}
            </button>
        </div>
        <div v-if="!simulation.isSimulationing" class="relative">
            <label for="betAmount" class="text-sm font-medium text-slate-300">Bet Amount</label>
            <div class="flex">
              <div class="relative flex-1">
                <input
                  id="betAmount"
                  v-model="currentBetAmount"
                  on:focusout={handleBetAmountFocusOut}
                  :disabled="autoBetInterval !== null"
                  type="number"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  class='w-full rounded-l-md border-2 border-slate-600 bg-slate-900 py-2 pl-7 pr-2 text-sm text-white transition:}colors hover:cursor-pointer focus:border-slate-500 focus:outline-none disabled:cursor-not-allowed  disabled:opacity-50 hover:[&:not(:disabled)]:border-slate-500'
                  :class="{'border-red-500 focus:border-red-400 hover:[&:not(:disabled)]:border-red-400':isBetAmountNegative || isBetExceedBalance}"
                />
                <div class="absolute left-3 top-2 select-none text-slate-500" aria-hidden>$</div>
              </div>
              <button
                :disabled="autoBetInterval !== null"
                @click="changeBetAmount(parseFloat((currentBetAmount / 2).toFixed(2)))"
                class="touch-manipulation bg-slate-600 px-4 font-bold diagonal-fractions text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:[&:not(:disabled)]:bg-slate-500 active:[&:not(:disabled)]:bg-slate-400"
              >
                1/2
              </button>
              <button
                :disabled="autoBetInterval !== null"
                @click="changeBetAmount(parseFloat((currentBetAmount * 2).toFixed(2)))"
                class="relative touch-manipulation rounded-r-md bg-slate-600 px-4 text-sm font-bold text-white transition-colors after:absolute after:left-0 after:inline-block after:h-1/2 after:w-[2px] after:bg-slate-800 after:content-[''] disabled:cursor-not-allowed disabled:opacity-50 hover:[&:not(:disabled)]:bg-slate-500 active:[&:not(:disabled)]:bg-slate-400"
              >
                2×
              </button>
            </div>
            <p v-if="isBetAmountNegative" class="absolute text-xs leading-5 text-red-400">
              This must be greater than or equal to 0.
            </p>
            <p v-else-if="isBetExceedBalance" class="absolute text-xs leading-5 text-red-400">Can't bet more than your balance!</p>
        </div>

        <div v-if="!simulation.isSimulationing" class="flex flex-col">
            <label for="riskLevel" class="text-sm font-medium text-slate-300 pb-[2px]">Risk</label>
            <select id="riskLevel" v-model="currentRiskLevel" :disabled="hasOutstandingBalls || autoBetInterval !== null" @change="changeRiskLevel">
                <option v-for="item in riskLevels" :key="item.label" :value="item.value">
                    {{ item.label }}
                </option>
            </select>
        </div>

        <div class="flex flex-col">
            <label for="rowCount" class="text-sm font-medium text-slate-300 pb-[2px]">Rows</label>
            <select id="rowCount" v-model="currentRowCount" :disabled="hasOutstandingBalls || autoBetInterval !== null" @change="changeRowCount">
                <option v-for="item in rowCounts" :key="item.label" :value="item.value">
                    {{ item.label }}
                </option>
            </select>
        </div>

        <div v-if="betMode === BetMode.AUTO">
            <div class="flex flex-col gap-1">
                <div class="relative flex items-center">
                    <label for="autoBetInput" class="text-sm font-medium text-slate-300">Number of Bets</label>
                    <PhQuestion class="text-slate-300 ml-[6px]" :class="{'cursor-pointer':isMouseEnterNumberBetHint}" weight="bold"
                        @mouseenter="isMouseEnterNumberBetHint = true" @mouseleave="isMouseEnterNumberBetHint = false" />
                    <div v-if="isMouseEnterNumberBetHint" class="absolute top-[24px] left-[18px] z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl">
                        <p>Enter '0' for unlimited bets.</p>
                        <div class="tooltip-arrow" data-popper-arrow></div>
                    </div>
                </div>

                <div class="relative">
                    <input
                        id="autoBetInput"
                        v-model="autoBetInputValue"
                        :disabled="autoBetInterval !== null"
                        type="number"
                        min="0"
                        inputmode="numeric"
                        class='w-full rounded-md border-2 border-slate-600 bg-slate-900 py-2 pl-3 pr-8 text-sm text-white
                        transition-colors hover:cursor-pointer focus:border-slate-500 focus:outline-none disabled:cursor-not-allowed
                        disabled:opacity-50 hover:[&:not(:disabled)]:border-slate-500'
                        :class="{ 'border-red-500 hover:border-red-400 focus:border-red-400':isAutoBetInputNegative }"
                    />
                    <!-- @focusout="handleAutoBetInputFocusOut" -->
                    <PhInfinity v-if="autoBetInput === 0" class="absolute right-3 top-3 size-4 text-slate-400" weight="bold" />
                </div>
                <p v-if="isAutoBetInputNegative" class="text-xs leading-5 text-red-400">This must be greater than or equal to 0.</p>
            </div>
        </div>

        <button
            @click="handleBetClick"
            :disabled="isDropBallDisabled"
            class='touch-manipulation rounded-md bg-green-500 py-3 font-semibold text-slate-900 transition-colors
            hover:bg-green-400 active:bg-green-600 disabled:bg-neutral-600 disabled:text-neutral-400'
            :class="{ 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600':autoBetInterval !== null }"
        >
            {{ betMode === BetMode.MANUAL? 'Drop Ball': autoBetInterval === null? 'Start Autobet': 'Stop Autobet' }}
        </button>

        <button
            v-if="simulation.isSimulationing"
            @click="simulation.exportToJsonFile"
            class='touch-manipulation rounded-md bg-green-500 py-3 font-semibold text-slate-900 transition-colors
            hover:bg-green-400 active:bg-green-600 disabled:bg-neutral-600 disabled:text-neutral-400'
        >
            {{ 'Export to JSON' }}
        </button>

        <div v-if="env === 'Dev'" class="mt-auto pt-5">
          <div class="flex items-center gap-4 border-t border-slate-600 pt-3">
            <div class="flex item-center">
              <div class="text-[16px] text-[white] pr-[2px]">{{ 'Open Simulation' }}</div>
              <Switch v-model="simulation.isSimulationing" />
            </div>
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { autoBetIntervalMs, rowCountOptions } from '../constants/game';
import { BetMode, RiskLevel, type RowCount } from '../types';
import { PhChartLine, PhGearSix, PhInfinity, PhQuestion } from '@phosphor-icons/vue';
import { useGameStore } from '../stores/game';
import { useSimulationStore } from '../stores/simulation';
import Switch from '../components/UI/Switch.vue';

const game = useGameStore();
const simulation = useSimulationStore();

const { rowCount, riskLevel } = game;

const env = ref<string>(import.meta.env.VITE_ENV);

const isMouseEnterNumberBetHint = ref<boolean>(false);

const betMode = ref(BetMode.MANUAL);

/**
 * When `betMode` is `AUTO`, the number of bets to be placed. Zero means infinite bets.
 */
const autoBetInput = ref<number>(0);

/**
 * Number of auto bets remaining when `betMode` is `AUTO`.
 *
 * - `number`: Finite count of how many bets left. It decrements from `autoBetInput` to 0.
 * - `null`: For infinite bets (i.e. `autoBetInput` is 0).
 */
const autoBetsLeft = ref<number | null>(null);

const autoBetInterval = ref<ReturnType<typeof setInterval> | null>(null);

const currentRowCount = ref<RowCount>(rowCount);

const currentRiskLevel = ref<RiskLevel>(riskLevel);

const currentBetAmount = computed({
  get() {
    return game.betAmount;
  },
  set(newValue) {
    game.setBetAmount(newValue);
  }
});

const isBetAmountNegative = computed(() => {
    return currentBetAmount.value < 0;
});

const isBetExceedBalance = computed(() => {
    return currentBetAmount.value > game.balance;
});

const isAutoBetInputNegative = computed(() => {
    return autoBetInput.value < 0;
});

const isDropBallDisabled = computed(() => {
    return isBetAmountNegative.value || isBetExceedBalance.value || isAutoBetInputNegative.value;
});

const hasOutstandingBalls = computed(() => {
    return Object.keys(game.betAmountOfExistingBalls).length > 0;
});

const autoBetInputValue = computed({
  get() {
    return autoBetInterval.value === null ? autoBetInput.value : autoBetsLeft.value ?? 0;
  },
  set(newValue) {
    autoBetInput.value = newValue;
  }
});

// const handleBetAmountFocusOut: FormEventHandler<HTMLInputElement> = (e) => {
//     const parsedValue = parseFloat(e.currentTarget.value.trim());
//     if (isNaN(parsedValue)) {
//       $betAmount = -1; // If input field is empty, this forces re-render so its value resets to 0
//       $betAmount = 0;
//     } else {
//       $betAmount = parsedValue;
//     }
//   };

const resetAutoBetInterval = () => {
    if (autoBetInterval.value !== null) {
        clearInterval(autoBetInterval.value);
        autoBetInterval.value = null;
    }
};

const autoBetDropBall = () => {
    if (isBetExceedBalance.value) {
      resetAutoBetInterval();
      return;
    }

    // Infinite mode
    if (autoBetsLeft.value === null) {
      game.setDropBall(true);
      return;
    }

    // Finite mode
    if (autoBetsLeft.value > 0) {
      game.setDropBall(true);
      autoBetsLeft.value -= 1;
    }
    if (autoBetsLeft.value === 0 && autoBetInterval.value !== null) {
      resetAutoBetInterval();
      return;
    }
};

// const handleAutoBetInputFocusOut = () => {
//     if (isNaN(autoBetInputValue.value)) {
//       autoBetInput.value = -1; // If input field is empty, this forces re-render so its value resets to 0
//       autoBetInput.value = 0;
//     } else {
//       autoBetInput.value = autoBetInputValue.value;
//     }
// };

const handleBetClick = () => {
    if (betMode.value === BetMode.MANUAL) {
        console.log("Drop Ball");
        game.setDropBall(true);
    } else if (autoBetInterval.value === null) {
        autoBetsLeft.value = autoBetInput.value === 0? null : autoBetInput.value;
        autoBetInterval.value = setInterval(autoBetDropBall, autoBetIntervalMs)
    } else if (autoBetInterval.value !== null) {
        resetAutoBetInterval();
    }
};

const betModes = [
    { value: BetMode.MANUAL, label: 'Manual' },
    { value: BetMode.AUTO, label: 'Auto' },
];
const riskLevels = [
    { value: RiskLevel.LOW, label: 'Low' },
    { value: RiskLevel.MEDIUM, label: 'Medium' },
    { value: RiskLevel.HIGH, label: 'High' },
];
const rowCounts = rowCountOptions.map((value) => ({ value, label: value.toString() }));

const changeRiskLevel = () => {
    game.setRiskLevel(currentRiskLevel.value);
}

const changeRowCount = () => {
    game.setRowCount(currentRowCount.value);
}

const changeBetAmount = (value: number) => {
  currentBetAmount.value = value;
  game.setBetAmount(currentBetAmount.value);
}
</script>

<style scoped>
select {
  padding: 8px 2px 8px 2px;
  background-color: #0f172a;
  color: #fff;
}
select option {
  margin: 40px;
  background-color: #0f172a;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}
</style>
