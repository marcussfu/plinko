<template>
    <!-- <div class="controls">
      <div></div>
      <div>
        <div id="balls">-</div>
      </div>
      <div class="drop-container">
        <div class="drop">
          <button id="drop-button" type="button">Drop</button>
          <input id="checkbox" type="checkbox" />
          <label for="checkbox">
            <div class="box">
              <svg
                class="checked"
                xmlns="http://www.w3.org/2000/svg"
                width="8px"
                height="8px"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#ffffff"
                  d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
                />
              </svg>
            </div>
          </label>
        </div>
      </div>
      <div>
        <div id="multiplier">1</div>
      </div>
      <div></div>
    </div> -->
    <div class="canvas-container">
      <canvas id="canvas"></canvas>
    </div>
    <div class="notes">
      <div type="button" class="note" id="note-0">110</div>
      <div type="button" class="note" id="note-1">41x</div>
      <div type="button" class="note" id="note-2">10x</div>
      <div type="button" class="note" id="note-3">5x</div>
      <div type="button" class="note" id="note-4">3x</div>
      <div type="button" class="note" id="note-5">1.5x</div>
      <div type="button" class="note" id="note-6">1x</div>
      <div type="button" class="note" id="note-7">.5x</div>
      <div type="button" class="note" id="note-8">.3x</div>
      <div type="button" class="note" id="note-9">.5x</div>
      <div type="button" class="note" id="note-10">1x</div>
      <div type="button" class="note" id="note-11">1.5x</div>
      <div type="button" class="note" id="note-12">3x</div>
      <div type="button" class="note" id="note-13">5x</div>
      <div type="button" class="note" id="note-14">10x</div>
      <div type="button" class="note" id="note-15">41x</div>
      <div type="button" class="note" id="note-16">110</div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch } from "vue";
  import { useGameStore } from '../../stores/game';
  import Matter from "matter-js";

  const game = useGameStore();
  const width = 620;
  const height = 534;
  
  const multipliers = [50, 20, 7, 4, 3, 1, 1, 0, 0, 0, 1, 1, 3, 4, 7, 20, 50];

  // module aliases
  const Engine = Matter.Engine,
      Events = Matter.Events,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

  // create an engine
  const engine = Engine.create({
    gravity: {
      scale: 0.0007,
    },
  });
  
  const GAP = 32;
  const PEG_RAD = 4;

  onMounted(() => {
    multipliers.forEach((m, i) => {
      // console.log(document.getElementById(`note-${i}`));
      document.getElementById(`note-${i}`).innerHTML = m;
    });
  
    // let balls = 10;
    // const ballsEl = document.getElementById("balls");
  
    // Drop button
    // const dropButton = document.getElementById("drop-button");
    // const autoDropCheckbox = document.getElementById("checkbox");
    // let autoDropEnabled = false;
    // let autoDroppingInterval = null;
    // dropButton.addEventListener("click", () => {
    //   if (autoDropEnabled && autoDroppingInterval) {
    //     dropButton.innerHTML = "Start";
    //     clearInterval(autoDroppingInterval);
    //     autoDroppingInterval = null;
    //   } else if (autoDropEnabled && !autoDroppingInterval) {
    //     dropButton.innerHTML = "Stop";
    //     dropABall();
    //     autoDroppingInterval = setInterval(dropABall, 600);
    //   } else if (!autoDropEnabled) {
    //     dropABall();
    //   }
    // });
    // autoDropCheckbox.addEventListener("input", (e) => {
    //   autoDropEnabled = e.target.checked;
  
    //   if (autoDropEnabled) {
    //     dropButton.innerHTML = "Start";
    //   } else {
    //     dropButton.innerHTML = "Drop";
    //   }
  
    //   if (autoDroppingInterval) {
    //     clearInterval(autoDroppingInterval);
    //     autoDroppingInterval = null;
    //   }
    // });
  
    // create a renderer
    const canvas = document.getElementById("canvas");
    const render = Render.create({
      canvas,
      engine,
      options: {
        width,
        height,
        wireframes: false,
      },
    });
  
    // Create pegs
    const pegs = [];
    for (let r = 0; r < game.rowCount; r++) {
      const pegsInRow = r + 3;
      for (let c = 0; c < pegsInRow; c++) {
        const x = width / 2 + (c - (pegsInRow - 1) / 2) * GAP;
        const y = GAP + r * GAP;
        const peg = Bodies.circle(x, y, PEG_RAD, {
          isStatic: true,
          label: "Peg",
          render: {
            fillStyle: "#fff",
          },
        });
        pegs.push(peg);
      }
    }
    Composite.add(engine.world, pegs);
  
    // track animations for pegs
    const pegAnims = new Array(pegs.length).fill(null);
  
    // Create a ground
    const ground = Bodies.rectangle(width / 2, height + 22, width * 2, 40, {
      isStatic: true,
      label: "Ground",
    });
    Composite.add(engine.world, [ground]);
  
    function checkCollision(event, label1, label2, callback) {
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
    Matter.Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
        // check for ball hitting the ground
        checkCollision(event, "Ball", "Ground", (ballToRemove) => {
          Matter.Composite.remove(engine.world, ballToRemove);
          const index = Math.floor(
            (ballToRemove.position.x - width / 2) / GAP + 17 / 2
          );
          if (index >= 0 && index < 17) {
            // Register ball
            const ballsWon = Math.floor(multipliers[index]);
            // balls += ballsWon;
            // Ball hit note at bottom
            const el = document.getElementById(`note-${index}`);
            if (el.dataset.pressed !== "true") {
              el.dataset.pressed = true;
              setTimeout(() => {
                el.dataset.pressed = false;
              }, 500);
            }
          }
        });
  
        // check for ball hitting peg
        checkCollision(event, "Peg", "Ball", (pegToAnimate) => {
          const index = pegs.findIndex((peg) => peg === pegToAnimate);
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
  
    // run the renderer
    Render.run(render);
  
    // Create custom runner
    const ctx = canvas.getContext("2d");
    function run() {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = new Date().getTime();
  
      // Draw peg expansions
      pegAnims.forEach((anim, index) => {
        if (!anim) return;
        const delta = now - anim;
        if (delta > 1200) {
          pegAnims[index] = null;
          return;
        }
        const peg = pegs[index];
        if (!peg) throw new Error("Unknown peg at index " + index);
        const pct = delta / 1200;
        const expandProgression = 1 - Math.abs(pct * 2 - 1);
        const expandRadius = expandProgression * 12;
        ctx.fillStyle = "#fff2";
        ctx.beginPath();
        ctx.arc(peg.position.x, peg.position.y, expandRadius, 0, 2 * Math.PI);
        ctx.fill();
      });
      Engine.update(engine, 1000 / 60);
  
      // Update ball count
      // ballsEl.innerHTML = balls;
  
      requestAnimationFrame(run);
    }
  
    run();
  });

  // Drop a ball
  const BALL_RAD = 7;
  const dropABall = () => {
    // if (balls > 0) {
    //   balls -= 1;
    // }
    const dropLeft = width / 2 - GAP;
    const dropRight = width / 2 + GAP;
    const dropWidth = dropRight - dropLeft;
    const x = Math.random() * dropWidth + dropLeft;
    const y = -PEG_RAD;

    const ball = Bodies.circle(x, y, BALL_RAD, {
      label: "Ball",
      restitution: 0.6,
      render: {
        fillStyle: "#f23",
      },
    });
    Composite.add(engine.world, [ball]);
  }

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
  </script>
  
  <style scoped>
  html {
    font-family: "Montserrat", sans-serif;
  }
  
  body {
    background-color: #14151f;
  }
  
  button {
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    opacity: 0.8;
  
    &:hover {
      opacity: 1;
    }
    &:active {
      opacity: 0.8;
    }
  }
  
  .controls {
    display: grid;
    grid-template-columns: 0.5fr 1fr 1fr 1fr 0.5fr;
    align-items: center;
    justify-content: center;
    margin-top: 1em;
    gap: 1em;
  
    .drop-container {
      display: flex;
      justify-content: center;
  
      .drop {
        position: relative;
        display: inline-flex;
  
        button {
          flex-shrink: 0;
          border: none;
          border-radius: 10px;
          padding: 1em 1em 1em 1em;
          background: lime;
          width: 7em;
        }
  
        input[type="checkbox"] {
          display: none;
  
          &:not(:checked) + label {
            .checked {
              visibility: hidden;
            }
          }
        }
  
        label[for="checkbox"] {
          position: absolute;
          left: calc(100%);
          height: 100%;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0 10px 10px 0;
          padding: 0 0.5em;
          opacity: 0.8;
  
          &:hover {
            opacity: 1;
            .box {
              background-color: rgba(255, 255, 255, 0.1);
            }
          }
          &:active {
            opacity: 0.8;
          }
  
          .box {
            position: relative;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 0.2em;
            width: 0.8em;
            height: 0.8em;
  
            &:after {
              font-size: 0.6em;
              vertical-align: middle;
              position: absolute;
              left: calc(100% + 0.4em);
              color: #fff;
              content: "auto";
            }
  
            svg {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }
      }
    }
  }
  
  #balls,
  #multiplier {
    position: relative;
    font-weight: 900;
    font-size: 2.2em;
    margin-right: auto;
    color: rgba(255, 255, 255, 0.2);
  
    &:before {
      content: "-";
      position: absolute;
      bottom: 100%;
      font-size: 0.3em;
      font-weight: 400;
    }
  }
  
  #balls {
    &:before {
      content: "Balls";
    }
  }
  
  #multiplier {
    text-align: right;
  
    &:before {
      content: "Drop";
      right: 0;
    }
  }
  
  .canvas-container {
    display: flex;
    align-items: center;
    justify-content: center;
  
    canvas {
      display: block;
      margin: auto;
    }
  }
  
  .notes {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 5px;
  
    .note {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 27px;
      aspect-ratio: 30 / 26;
      border-radius: 5px;
      background-color: gray;
      flex-shrink: 0;
      border-bottom: solid 4px yellow;
      text-align: center;
      font-size: 0.8em;
      font-weight: 600;
  
      &[data-pressed="true"] {
        animation: press 0.5s;
      }
  
      @keyframes press {
        0% {
          border-bottom-width: 4px;
        }
        50% {
          border-bottom-width: 0;
        }
        100% {
          border-bottom-width: 4px;
        }
      }
  
      &:nth-child(1),
      &:nth-child(17) {
        background-color: #0f3;
        border-color: #0a0;
      }
      &:nth-child(2),
      &:nth-child(16) {
        background-color: #1f3;
        border-color: #0a0;
      }
      &:nth-child(3),
      &:nth-child(15) {
        background-color: #3f2;
        border-color: #0a0;
      }
      &:nth-child(4),
      &:nth-child(14) {
        background-color: #4f2;
        border-color: #0a0;
      }
      &:nth-child(5),
      &:nth-child(13) {
        background-color: #6f2;
        border-color: #0a0;
      }
      &:nth-child(6),
      &:nth-child(12) {
        background-color: #7f1;
        border-color: #3a0;
      }
      &:nth-child(7),
      &:nth-child(11) {
        background-color: #9f1;
        border-color: #4a0;
      }
      &:nth-child(8),
      &:nth-child(10) {
        background-color: #af0;
        border-color: #6a0;
      }
      &:nth-child(9) {
        background-color: #cf0;
        border-color: #7a0;
      }
    }
  }
  </style>
  