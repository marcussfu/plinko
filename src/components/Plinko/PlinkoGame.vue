<script setup lang="ts">
  import { useGameStore } from '../../stores/game';
  // import { PhCircleNotch } from '@phosphor-icons/vue';
  import BinsRow from './BinsRow.vue';
  import LastWins from './LastWins.vue';
  import type { RowCount } from '../../types';
  import { getRandomBetween } from '../../utils/numbers';
  import { binPayouts } from '../../constants/game';
  import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
  import Matter, { type IBodyDefinition } from 'matter-js';
  import { v4 as uuidv4 } from 'uuid';
  import axios from 'axios';

  type BallFrictionsByRowCount = {
    friction: NonNullable<IBodyDefinition['friction']>;
    frictionAirByRowCount: Record<RowCount, NonNullable<IBodyDefinition['frictionAir']>>;
  };

  const game = useGameStore();

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

  /**
   * Every pin of the game.
   */
  const pins = ref<Matter.Body[]>([]);

  /**
   * Walls are invisible, slanted "guard rails" at the left and right sides of the
   * pin triangle. It prevents balls from falling outside the pin triangle and not
   * hitting a bin.
   */
  const walls = ref<Matter.Body[]>([]);

  /**
   * "Sensor" is an invisible body at the bottom of the canvas. It detects whether
   * a ball arrives at the bottom and enters a bin.
   */
  const sensor = ref<Matter.Body>();

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

  const ballFrictions: BallFrictionsByRowCount = {
    friction: 0.3,// range (0, 1) 0.5
    frictionAirByRowCount: {// faster a body slows when moving through space, 0 means never slow, default 0.01
      8: 0.02,//0.0395,
      9: 0.022,//0.041,
      10: 0.02,//0.038,
      11: 0.02,//0.0355,
      12: 0.022,//0.0414,
      13: 0.02,//0.0437,
      14: 0.025,//0.0401,
      15: 0.026,//0.0418,
      16: 0.025,
    },
    // frictionAirByRowCount: {// faster a body slows when moving through space, 0 means never slow, default 0.01
    //   8: 0.0395,
    //   9: 0.041,
    //   10: 0.038,
    //   11: 0.0355,
    //   12: 0.0414,
    //   13: 0.0437,
    //   14: 0.0401,
    //   15: 0.0418,
    //   16: 0.025,
    // },
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

    sensor.value = Bodies.rectangle(
      canvas.value.width / 2,
      canvas.value.height,
      canvas.value.width,
      10,
      {
        isSensor: true,
        isStatic: true,
        render: {
          visible: false,
        },
      },
    );
    Composite.add(engine.world, [sensor.value]);
    Events.on(engine, 'collisionStart', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        if (bodyA === sensor.value) {
          handleBallEnterBin(bodyB);
        } else if (bodyB === sensor.value) {
          handleBallEnterBin(bodyA);
        }
      });
    });

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
      if (newVal) {
        callToDrop();
      }
    }
  );

  const callToDrop = async () => {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/game`, {
      rowCount: game.rowCount,
    });
    dropABall(response.data.point);
    game.setDropBall(false);  // Reset `isDropBall` after handling
  };

  const dropABall = (point: number) => {
    // const ballOffsetRangeX = pinDistanceX.value;// * 0.8;
    const ballRadius = pinRadius.value * 2;
    const { friction, frictionAirByRowCount } = ballFrictions;

    const ball = Bodies.circle(
      // getRandomBetween(
      //   canvas.value!.width / 2 - ballOffsetRangeX,
      //   canvas.value!.width / 2 + ballOffsetRangeX,
      // ),
      point,
      0,
      ballRadius,
      {
        restitution: 0.8, // Bounciness
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

    game.updateBetAmountOfExistingBalls(ball.id);
    game.updateBalance(-game.betAmount);
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
    game.initBetAmountOfExistingBalls();
  }

  const placePinsAndWalls = () => {
    if (pins.value.length > 0) {
      Composite.remove(engine.world, pins.value);
      pins.value = [];
      game.isBallEnterBins = [];
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
      game.isBallEnterBins.push(false);
    }
    Composite.add(engine.world, pins.value);

    // setting wall rectangle
    // // const firstPinX = pins.value[0].position.x;
    // const leftWallAngle = Math.atan2(
    //   //firstPinX - pinsLastRowXCoords.value[0],
    //   0,
    //   canvas.value!.height - PADDING_TOP - PADDING_BOTTOM,
    // );
    // // const leftWallX = firstPinX - (firstPinX - pinsLastRowXCoords.value[0]) / 2 - pinDistanceX.value * 0.25;
    // const leftWallX = pinsLastRowXCoords.value[0] - pinDistanceX.value * 0.5;

    // const leftWall = Matter.Bodies.rectangle(
    //   leftWallX,
    //   canvas.value!.height / 2,
    //   10,
    //   canvas.value!.height,
    //   {
    //     isStatic: true,
    //     angle: leftWallAngle,
    //     render: { fillStyle: '#ffffff', visible: true },
    //   },
    // );
    // const rightWall = Matter.Bodies.rectangle(
    //   canvas.value!.width - leftWallX,
    //   canvas.value!.height / 2,
    //   10,
    //   canvas.value!.height,
    //   {
    //     isStatic: true,
    //     angle: -leftWallAngle,
    //     render: { fillStyle: '#ffffff', visible: true },
    //   },
    // );
    // walls.value.push(leftWall, rightWall);
    // Composite.add(engine.world, walls.value);
  }

  const handleBallEnterBin = (ball: Matter.Body) => {
    // let binIndex = -1;
    // for (let i = pinsLastRowXCoords.value.length - 1; i>=0; i--) {
    //   if (pinsLastRowXCoords.value[i] < ball.position.x) {
    //     binIndex = i;
    //     break;
    //   }
    // }

    const binIndex = pinsLastRowXCoords.value.findLastIndex((pinX) => pinX < ball.position.x);

    if (binIndex !== -1 && binIndex < pinsLastRowXCoords.value.length - 1) {
      const betAmount = game.betAmountOfExistingBalls[ball.id] ?? 0;
      const multiplier = binPayouts[game.rowCount][game.riskLevel][binIndex];
      const payoutValue = betAmount * multiplier;
      const profit = payoutValue - betAmount;

      game.updateWinRecords({
        id: uuidv4(),
        betAmount,
        rowCount: game.rowCount,
        binIndex,
        payout: {
          multiplier,
          value: payoutValue,
        },
        profit,
      });
      game.updateTotalProfitHistory(profit);
      game.updateBalance(payoutValue);
    }

    Composite.remove(engine.world, ball);
    game.deleteItemFromBetAmountOfExistingBalls(ball.id);
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
      </div>
      <BinsRow :binsWidthPercentage="binsWidthPercentage" />
    </div>
    <div class="absolute right-[5%] top-1/2 -translate-y-1/2">
      <LastWins />
    </div>
  </div>
</template>

