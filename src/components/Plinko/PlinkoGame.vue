<script setup lang="ts">
  import { useGameStore } from '../../stores/game';
  import { PhCircleNotch } from '@phosphor-icons/vue';
  // import type { Action } from 'svelte/action';
  import BinsRow from './BinsRow.vue';
  import LastWins from './LastWins.vue';
  import PlinkoEngine from './PlinkoEngine';
  import {
    RiskLevel,
    type BetAmountOfExistingBalls,
    type RowCount,
    type WinRecord,
  } from '../../types';
  import { getRandomBetween } from '../../utils/numbers';

  import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
  import Matter, { type IBodyDefinition } from 'matter-js';

  const game = useGameStore();

  const { riskLevel, rowCount, winRecords } = game;

  // const { WIDTH, HEIGHT } = PlinkoEngine;

  const WIDTH = 760;
  const HEIGHT = 570;

  const PADDING_X = 52;
  const PADDING_TOP = 36;
  const PADDING_BOTTOM = 28;

  const PIN_CATEGORY = 0x0001;
  const BALL_CATEGORY = 0x0002;

  // module aliases
  const Engine = Matter.Engine,
      Events = Matter.Events,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

  const pins = ref<Matter.Body[]>([]);

  const walls = ref<Matter.Body[]>([]);

  const pinsLastRowXCoords = ref<number[]>([]);

  const canvas = ref<HTMLCanvasElement | null>(null);

  const runner = Matter.Runner.create();

  // create an engine
  const engine = Engine.create({
    timing: {
      timeScale: 1,
    },
    // gravity: {
    //   scale: 0.0007,
    // },
  });

  type BallFrictionsByRowCount = {
    friction: NonNullable<IBodyDefinition['friction']>;
    frictionAirByRowCount: Record<RowCount, NonNullable<IBodyDefinition['frictionAir']>>;
  };

  const ballFrictions: BallFrictionsByRowCount = {
    friction: 0.5,
    frictionAirByRowCount: {
      8: 0.0395,
      9: 0.041,
      10: 0.038,
      11: 0.0355,
      12: 0.0414,
      13: 0.0437,
      14: 0.0401,
      15: 0.0418,
      16: 0.0364,
    },
  };
  
  onMounted(() => {
    // create a renderer
    canvas.value = document.getElementById("canvas") as HTMLCanvasElement;
    const render = Render.create({
      engine: engine,
      canvas: canvas.value,
      options: {
        width: WIDTH,
        height: HEIGHT,
        background: '#0f1728',
        wireframes: false,
      },
    });

    placePinsAndWalls();

    // run the renderer
    Render.run(render); // Renders the scene to canvas
    Runner.run(runner, engine); // Starts the simulation in physics engine
  });

  onUnmounted(() => {
    // Render.stop(render);
    Runner.stop(runner);
  });

  const binsWidthPercentage = computed<number>(() => {
    const lastPinX = pinsLastRowXCoords.value[pinsLastRowXCoords.value.length - 1];
    return (lastPinX - pinsLastRowXCoords.value[0]) / WIDTH;
  });

  /**
   * Gets the horizontal distance between each pin's center point.
   */
  const pinDistanceX = computed<number>(() => {
    if (canvas.value !== null ){
      const lastRowPinCount = 3 + game.rowCount - 1;
      return (canvas.value!.width - PADDING_X * 2) / (lastRowPinCount - 1);
    }
    return 0;
  });

  const pinRadius = computed<number>(() => {
    return (24 - game.rowCount) / 2;
  });

  watch(
    () => game.rowCount,
    (newVal) => {
      if (newVal) {
        updateRowCount(newVal);
      }
    }
  );

  watch(
    () => game.isDropBall,
    (newVal) => {
      console.log("isDropBall changed:", newVal);
      if (newVal) {
        dropABall();
        game.setDropBall(false);  // Reset `isDropBall` after handling
      }
    }
  );

  const dropABall = () => {
    const ballOffsetRangeX = pinDistanceX.value * 0.8;
    const ballRadius = pinRadius.value * 2;
    const { friction, frictionAirByRowCount } = ballFrictions;

    const ball = Bodies.circle(
      getRandomBetween(
        canvas.value!.width / 2 - ballOffsetRangeX,
        canvas.value!.width / 2 + ballOffsetRangeX,
      ),
      0,
      ballRadius,
      {
        restitution: 0.6, // Bounciness
        friction,
        frictionAir: frictionAirByRowCount[game.rowCount],
        collisionFilter: {
          category: BALL_CATEGORY,
          mask: PIN_CATEGORY, // Collide with pins only, but not other balls
        },
        render: {
          fillStyle: '#ff0000',
        },
      }
    );
    Composite.add(engine.world, ball);

    // game.betAmountOfExistingBalls.update((value) => ({ ...value, [ball.id]: this.betAmount }));
    // game.balance.update((balance) => balance - this.betAmount);
  }

  const updateRowCount = (currentRowCount:RowCount) => {
    // if (currentRowCount === game.rowCount) {
    //   return;
    // }
    removeAllBalls();

    game.setRowCount(currentRowCount);
    placePinsAndWalls();
  }

  const removeAllBalls = () => {
    Composite.allBodies(engine.world).forEach((body) => {
      if (body.collisionFilter.category === BALL_CATEGORY) {
        Composite.remove(engine.world, body);
      }
    });
    // game.betAmountOfExistingBalls.set({});
  }

  const placePinsAndWalls = () => {
    if (pins.value.length > 0) {
      Composite.remove(engine.world, pins.value);
      pins.value = [];
    }

    if (pinsLastRowXCoords.value.length > 0) {
      pinsLastRowXCoords.value = [];
    }

    if (walls.value.length > 0) {
      Composite.remove(engine.world, walls.value);
      walls.value = [];
    }

    for (let row = 0; row < game.rowCount; ++row) {
      const rowY =
        PADDING_TOP +
        ((canvas.value!.height - PADDING_TOP - PADDING_BOTTOM) / (game.rowCount - 1)) * row;

      /** Horizontal distance between canvas left/right boundary and first/last pin of the row. */
      const rowPaddingX = PADDING_X + ((game.rowCount - 1 - row) * pinDistanceX.value) / 2;

      for (let col = 0; col < 3 + row; ++col) {
        const colX = rowPaddingX + ((canvas.value!.width - rowPaddingX * 2) / (3 + row - 1)) * col;
        const pin = Bodies.circle(colX, rowY, pinRadius.value, {
          isStatic: true,
          label: "Peg",
          render: {
            fillStyle: '#ffffff',
          },
          collisionFilter: {
            category: PIN_CATEGORY,
            mask: BALL_CATEGORY, // Collide with balls
          },
        });
        pins.value.push(pin);

        if (row === game.rowCount - 1) {
          pinsLastRowXCoords.value.push(colX);
        }
      }
    }
    Composite.add(engine.world, pins.value);
  }
</script>

<template>
  <div class="relative bg-gray-900">
    <div class="mx-auto flex h-full flex-col px-4 pb-4" :style="{maxWidth: WIDTH +'px'}">
      <div class="relative w-full" :style="{aspectRatio: WIDTH / HEIGHT}">
          <!-- <div v-if="game.plinkoEngine === null" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <PhCircleNotch class="size-20 animate-spin text-slate-600" weight="bold" />
          </div> -->
          <canvas id="canvas" width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" />
          <!-- <canvas v-init-plinko="game" width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" /> -->
        <!-- <canvas use:initPlinko width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" /> -->
      </div>
      <BinsRow :binsWidthPercentage="binsWidthPercentage" />
    </div>
    <div class="absolute right-[5%] top-1/2 -translate-y-1/2">
      <!-- <LastWins /> -->
    </div>
  </div>
</template>

