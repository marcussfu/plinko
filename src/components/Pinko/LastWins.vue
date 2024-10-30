<template>
  <!-- Clamps in mobile:
        - Width: From 1.5rem at 340px viewport width to 2rem at 620px viewport width
        - Font size: From 8px at 340px viewport width to 10px at 620px viewport width
  -->
  <div
    class="flex w-[clamp(1.5rem,0.893rem+2.857vw,2rem)] flex-col overflow-hidden rounded-sm text-[clamp(8px,5.568px+0.714vw,10px)] md:rounded-md lg:w-12 lg:text-sm"
    :style="{ aspectRatio: 1/winCount }"
  >
  <!-- style:aspect-ratio={`1 / ${winCount}`} -->
    <!-- <div v-for="item in lastWins" :key="item.binIndex"
      class="flex aspect-square items-center justify-center font-bold text-gray-950"
    >
      {{ item.multiplier + item.multiplier < 100 ? '×' : '' }}
    </div> -->
  
    <!-- {#each lastWins as { binIndex, rowCount, payout: { multiplier } }}
      <div
        class="flex aspect-square items-center justify-center font-bold text-gray-950"
        style:background-color={binColorsByRowCount[rowCount].background[binIndex]}
      >
        {multiplier}{multiplier < 100 ? '×' : ''}
      </div>
    {/each} -->
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { binColorsByRowCount } from '../../constants/game';
  import { useGameStore } from '@/stores/game';
  const game = useGameStore();

  /**
   * Number of last wins to display.
   */
  const winCount = 4;

  // const lastWins = computed(() => {
  //   return game.winRecords.slice(-winCount);
  // });

  // $: lastWins = $winRecords.slice(-winCount).reverse();
</script>
