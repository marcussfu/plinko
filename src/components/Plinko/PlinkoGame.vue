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
    // timing: {
    //   timeScale: 1,
    // },
    gravity: {
      scale: 0.0007,
    },
  });
  
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
    // const { friction, frictionAirByRowCount } = PlinkoEngine.ballFrictions;

    const ball = Bodies.circle(
      getRandomBetween(
        canvas.value!.width / 2 - ballOffsetRangeX,
        canvas.value!.width / 2 + ballOffsetRangeX,
      ),
      0,
      ballRadius,
      {
        label: "Ball",
        restitution: 0.6,
        render: {
          fillStyle: "#f23",
        },
      }
      // {
      //   restitution: 0.8, // Bounciness
      //   friction,
      //   frictionAir: frictionAirByRowCount[game.rowCount],
      //   collisionFilter: {
      //     category: BALL_CATEGORY,
      //     mask: PIN_CATEGORY, // Collide with pins only, but not other balls
      //   },
      //   render: {
      //     fillStyle: '#ff0000',
      //   },
      // },
    );
    Composite.add(engine.world, ball);

    // this.game.betAmountOfExistingBalls.update((value) => ({ ...value, [ball.id]: this.betAmount }));
    // this.game.balance.update((balance) => balance - this.betAmount);








    // const dropLeft = width / 2 - GAP;
    // const dropRight = width / 2 + GAP;
    // const dropWidth = dropRight - dropLeft;
    // const x = Math.random() * dropWidth + dropLeft;
    // const y = -PEG_RAD;

    // const ball = Bodies.circle(x, y, BALL_RAD, {
    //   label: "Ball",
    //   restitution: 0.6,
    //   render: {
    //     fillStyle: "#f23",
    //   },
    // });
    // Composite.add(engine.world, [ball]);
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

    // // Create pegs
    // const pegs = [];
    // for (let r = 0; r < rowCount; r++) {
    //   const pegsInRow = r + 3;
    //   for (let c = 0; c < pegsInRow; c++) {
    //     const x = width / 2 + (c - (pegsInRow - 1) / 2) * GAP;
    //     const y = GAP + r * GAP;
    //     const peg = Bodies.circle(x, y, PEG_RAD, {
    //       isStatic: true,
    //       label: "Peg",
    //       render: {
    //         fillStyle: "#fff",
    //       },
    //     });
    //     pegs.push(peg);
    //   }
    // }
    // Composite.add(engine.world, pegs);


    // const { PADDING_X, PADDING_TOP, PADDING_BOTTOM, PIN_CATEGORY, BALL_CATEGORY } = PlinkoEngine;

    
    // if (this.pinsLastRowXCoords.length > 0) {
    //   this.pinsLastRowXCoords = [];
    // }
    // if (this.walls.length > 0) {
    //   Matter.Composite.remove(this.engine.world, this.walls);
    //   this.walls = [];
    // }

    // for (let row = 0; row < this.rowCount; ++row) {
    //   const rowY =
    //     PADDING_TOP +
    //     ((this.canvas.height - PADDING_TOP - PADDING_BOTTOM) / (this.rowCount - 1)) * row;

    //   /** Horizontal distance between canvas left/right boundary and first/last pin of the row. */
    //   const rowPaddingX = PADDING_X + ((this.rowCount - 1 - row) * this.pinDistanceX) / 2;

    //   for (let col = 0; col < 3 + row; ++col) {
    //     const colX = rowPaddingX + ((this.canvas.width - rowPaddingX * 2) / (3 + row - 1)) * col;
    //     const pin = Matter.Bodies.circle(colX, rowY, this.pinRadius, {
    //       isStatic: true,
    //       render: {
    //         fillStyle: '#ffffff',
    //       },
    //       collisionFilter: {
    //         category: PIN_CATEGORY,
    //         mask: BALL_CATEGORY, // Collide with balls
    //       },
    //     });
    //     this.pins.push(pin);

    //     if (row === this.rowCount - 1) {
    //       this.pinsLastRowXCoords.push(colX);
    //     }
    //   }
    // }
    // Matter.Composite.add(this.engine.world, this.pins);

    // const firstPinX = this.pins[0].position.x;
    // const leftWallAngle = Math.atan2(
    //   firstPinX - this.pinsLastRowXCoords[0],
    //   this.canvas.height - PADDING_TOP - PADDING_BOTTOM,
    // );
    // const leftWallX =
    //   firstPinX - (firstPinX - this.pinsLastRowXCoords[0]) / 2 - this.pinDistanceX * 0.25;

    // const leftWall = Matter.Bodies.rectangle(
    //   leftWallX,
    //   this.canvas.height / 2,
    //   10,
    //   this.canvas.height,
    //   {
    //     isStatic: true,
    //     angle: leftWallAngle,
    //     render: { visible: false },
    //   },
    // );
    // const rightWall = Matter.Bodies.rectangle(
    //   this.canvas.width - leftWallX,
    //   this.canvas.height / 2,
    //   10,
    //   this.canvas.height,
    //   {
    //     isStatic: true,
    //     angle: -leftWallAngle,
    //     render: { visible: false },
    //   },
    // );
    // this.walls.push(leftWall, rightWall);
    // Matter.Composite.add(this.engine.world, this.walls);
  }
  
  const checkCollision = (event, label1, label2, callback) => {
    event.pairs.forEach(({ bodyA, bodyB }) => {
      let body1 = null, body2 = null;
      if (bodyA.label === label1 && bodyB.label === label2) {
        body1 = bodyA;
        body2 = bodyB;
      } else if (bodyA.label === label2 && bodyB.label === label1) {
        body1 = bodyB;
        body2 = bodyA;
      }

      if (body1 && body2) {
        callback(body1, body2);
      }
    });
  }

  // Trigger event on ball hitting ground
  Matter.Events.on(engine, "collisionStart", (event) => {console.log("XZZZZZ");
    event.pairs.forEach(({ bodyA, bodyB }) => {
      // check for ball hitting the ground
      // checkCollision(event, "Ball", "Ground", (ballToRemove) => {
      //   Matter.Composite.remove(engine.world, ballToRemove);
      //   const index = Math.floor(
      //     (ballToRemove.position.x - width / 2) / GAP + 17 / 2
      //   );
      //   if (index >= 0 && index < 17) {
      //     // Register ball
      //     const ballsWon = Math.floor(multipliers[index]);
      //     // balls += ballsWon;
      //     // Ball hit note at bottom
      //     const el = document.getElementById(`note-${index}`);
      //     if (el.dataset.pressed !== "true") {
      //       el.dataset.pressed = true;
      //       setTimeout(() => {
      //         el.dataset.pressed = false;
      //       }, 500);
      //     }
      //   }
      // });

      // track animations for pegs
      const pegAnims = new Array(pins.value.length).fill(null);

      // check for ball hitting pin
      checkCollision(event, "Peg", "Ball", (pegToAnimate) => {
        const index = pins.value.findIndex((peg) => peg === pegToAnimate);
        if (index === -1) {
          throw new Error(
            "Could not find peg in pegs array even though we registered an ball hitting this peg"
          );
        }
        if (!pegAnims[index]) {
          pegAnims[index] = new Date().getTime();
        }
      });
    });
  });
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
      <!-- <BinsRow /> -->
    </div>
    <div class="absolute right-[5%] top-1/2 -translate-y-1/2">
      <!-- <LastWins /> -->
    </div>
  </div>
</template>

