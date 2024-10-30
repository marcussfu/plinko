<template>
    <div class="flex flex-col gap-5 bg-slate-700 p-3 lg:max-w-80 w-[320px] h-[590px]">
        <div class="flex gap-1 rounded-full bg-slate-900 p-1">
            <button v-for="item in betModes" :key="item.label" :value="item.value"
                class='flex-1 rounded-full py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:[&:not(:disabled)]:bg-slate-600 active:[&:not(:disabled)]:bg-slate-500'
            >
                {{ item.label }}
            </button>
        </div>
        <!-- <div class="relative">
            <label for="betAmount" class="text-sm font-medium text-slate-300">Bet Amount</label>
        </div> -->

        <div class="flex flex-col">
            <label for="riskLevel" class="text-sm font-medium text-slate-300 pb-[2px]">Risk</label>
            <select id="riskLevel" v-model="riskLevel">
                <option v-for="item in riskLevels" :key="item.label" :value="item.value">
                    {{ item.label }}
                </option>
            </select>
        </div>

        <div class="flex flex-col">
            <label for="rowCount" class="text-sm font-medium text-slate-300 pb-[2px]">Rows</label>
            <select id="rowCount" v-model="rowCount">
                <option v-for="item in rowCounts" :key="item.label" :value="item.value">
                    {{ item.label }}
                </option>
            </select>
        </div>
        <button
            @click="handleBetClick"
            class='touch-manipulation rounded-md bg-green-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-green-400 active:bg-green-600 disabled:bg-neutral-600 disabled:text-neutral-400'
        >
            {{ betMode === BetMode.MANUAL? 'Drop Ball': '' }}
            <!-- {#if betMode === BetMode.MANUAL}
            Drop Ball
            {:else if autoBetInterval === null}
            Start Autobet
            {:else}
            Stop Autobet
            {/if} -->
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BetMode, RiskLevel } from '../types';
import { autoBetIntervalMs, rowCountOptions } from '../constants/game';

const betMode: BetMode = BetMode.MANUAL;

const rowCount = ref(16);
const riskLevel = ref(BetMode.MANUAL);

const handleBetClick = () => {
    if (betMode === BetMode.MANUAL) {
        console.log("Drop Ball");
    //   $plinkoEngine?.dropBall();
    } 
    // else if (autoBetInterval === null) {
    //   autoBetsLeft = autoBetInput === 0 ? null : autoBetInput;
    //   autoBetInterval = setInterval(autoBetDropBall, autoBetIntervalMs);
    // } 
    // else if (autoBetInterval !== null) {
    //   resetAutoBetInterval();
    // }
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