<template>
  <!-- Height clamping in mobile: From 10px at 370px viewport width to 16px at 600px viewport width -->
  <div class="flex h-[clamp(10px,0.352px+2.609vw,16px)] w-full justify-center lg:h-7">
      <div class="flex gap-[1%]" :style="{ width: (binsWidthPercentage * 100) + '%' }">
        <!-- Font-size clamping:
              - Mobile (< 1024px): From 6px at 370px viewport width to 8px at 600px viewport width
              - Desktop (>= 1024px): From 10px at 1024px viewport width to 12px at 1100px viewport width
         -->
        <div v-for="(item, index) in binPayouts[game.rowCount][game.riskLevel]" :key="index"
          class="flex min-w-0 flex-1 items-center justify-center rounded-sm text-[clamp(6px,2.784px+0.87vw,8px)] font-bold text-gray-950 shadow-[0_2px_var(--shadow-color)] lg:rounded-md lg:text-[clamp(10px,-16.944px+2.632vw,12px)] lg:shadow-[0_3px_var(--shadow-color)]"
          :style="{ backgroundColor: binColorsByRowCount[game.rowCount].background[index], '--shadow-color': binColorsByRowCount[game.rowCount].shadow[index] }"
        >
          {{item + (item < 100? 'x' : '')}}
        </div>
      </div>
</div>
</template>

<script setup lang="ts">
  import { binColorsByRowCount, binPayouts } from '../../constants/game';
  import { useGameStore } from '@/stores/game';
  const game = useGameStore();
  // const { riskLevel, rowCount, winRecords } = game;

  // import { plinkoEngine, riskLevel, rowCount, winRecords } from '../../stores/game';
  // import { isAnimationOn } from '$lib/stores/settings';
  // import type { Action } from 'svelte/action';

  interface Props {
    binsWidthPercentage: number;
  }

  defineProps<Props>();

  /**
   * Bounce animations for each bin, which is played when a ball falls into the bin.
   */
  const binAnimations: Animation[] = [];

  // $: {
  //   if ($winRecords.length) {
  //     const lastWinBinIndex = $winRecords[$winRecords.length - 1].binIndex;
  //     playAnimation(lastWinBinIndex);
  //   }
  // }

  // const initAnimation: Action<HTMLDivElement> = (node) => {
  //   const bounceAnimation = node.animate(
  //     [
  //       { transform: 'translateY(0)' },
  //       { transform: 'translateY(30%)' },
  //       { transform: 'translateY(0)' },
  //     ],
  //     {
  //       duration: 300,
  //       easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  //     },
  //   );
  //   bounceAnimation.pause(); // Don't run the animation immediately
  //   binAnimations.push(bounceAnimation);
  // };

  // function playAnimation(binIndex: number) {
  //   if (!$isAnimationOn) {
  //     return;
  //   }

  //   const animation = binAnimations[binIndex];

  //   // Always reset animation before playing. Safari has a weird behavior where
  //   // the animation will not play the second time if it's not cancelled.
  //   animation.cancel();

  //   animation.play();
  // }
</script>
