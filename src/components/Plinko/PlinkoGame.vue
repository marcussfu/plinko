<script setup lang="ts">
  import { useGameStore } from '../../stores/game';
  import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
  import { PhCircleNotch } from '@phosphor-icons/vue';
  // import type { Action } from 'svelte/action';
  import BinsRow from './BinsRow.vue';
  import LastWins from './LastWins.vue';
  import PlinkoEngine from './PlinkoEngine';

  const game = useGameStore();

  const { WIDTH, HEIGHT } = PlinkoEngine;

  // const initPlinko: Action<HTMLCanvasElement> = (node) => {
  //   game.plinkoEngine = new PlinkoEngine(node);
  //   game.plinkoEngine.start();

  //   return {
  //     destroy: () => {
  //       game.plinkoEngine?.stop();
  //     },
  //   };
  // };
</script>

<template>
  <div class="relative bg-gray-900">
    <div class="mx-auto flex h-full flex-col px-4 pb-4" :style="{maxWidth: WIDTH +'px'}">
      <div class="relative w-full" :style="{aspectRatio: WIDTH / HEIGHT}">
          <div v-if="game.plinkoEngine === null" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <PhCircleNotch class="size-20 animate-spin text-slate-600" weight="bold" />
          </div>

        <!-- <canvas use:initPlinko width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" /> -->
      </div>
      <BinsRow />
    </div>
    <div class="absolute right-[5%] top-1/2 -translate-y-1/2">
      <!-- <LastWins /> -->
    </div>
  </div>
</template>

