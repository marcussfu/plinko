<script setup lang="ts">
  import { useGameStore } from '../../stores/game';
  import { PhCircleNotch } from '@phosphor-icons/vue';
  // import type { Action } from 'svelte/action';
  import BinsRow from './BinsRow.vue';
  import LastWins from './LastWins.vue';
  import PlinkoEngine from './PlinkoEngine';

  import { onMounted, onUnmounted } from 'vue';
  import Matter, { type IBodyDefinition } from 'matter-js';

  const game = useGameStore();

  const { WIDTH, HEIGHT } = PlinkoEngine;

  // // module aliases
  // const Engine = Matter.Engine,
  //     Events = Matter.Events,
  //     Render = Matter.Render,
  //     Runner = Matter.Runner,
  //     Bodies = Matter.Bodies,
  //     Composite = Matter.Composite;
  
  onMounted(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    game.plinkoEngine = new PlinkoEngine(canvas);
    game.plinkoEngine.start();

    // const engine = Matter.Engine.create({
    //   timing: {
    //     timeScale: 1,
    //   },
    // });
    // const render = Matter.Render.create({
    //   engine: engine,
    //   canvas: canvas,
    //   options: {
    //     width: PlinkoEngine.WIDTH,
    //     height: PlinkoEngine.HEIGHT,
    //     background: '#0f1728',
    //     wireframes: false,
    //   },
    // });
    // const runner = Matter.Runner.create();

    // // placePinsAndWalls();console.log("TTTTT");

    // const sensor = Matter.Bodies.rectangle(
    //   canvas.width / 2,
    //   canvas.height,
    //   canvas.width,
    //   10,
    //   {
    //     isSensor: true,
    //     isStatic: true,
    //     render: {
    //       visible: false,
    //     },
    //   },
    // );
    // Matter.Composite.add(engine.world, [sensor]);
    // // Matter.Events.on(engine, 'collisionStart', ({ pairs }) => {
    // //   pairs.forEach(({ bodyA, bodyB }) => {
    // //     if (bodyA === sensor) {
    // //       handleBallEnterBin(bodyB);
    // //     } else if (bodyB === sensor) {
    // //       handleBallEnterBin(bodyA);
    // //     }
    // //   });
    // // });
  });

  onUnmounted(() => {
    game.plinkoEngine?.stop();
  });


  

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
          <canvas id="canvas" width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" />
          <!-- <canvas v-init-plinko="game" width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" /> -->
        <!-- <canvas use:initPlinko width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" /> -->
      </div>
      <BinsRow />
    </div>
    <div class="absolute right-[5%] top-1/2 -translate-y-1/2">
      <!-- <LastWins /> -->
    </div>
  </div>
</template>

