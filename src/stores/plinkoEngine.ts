
import { binPayouts } from '../constants/game'
import { useGameStore } from '../stores/game'
import type { RiskLevel, RowCount } from '../types';
import { getRandomBetween } from '../utils/numbers';
import Matter, { type IBodyDefinition } from 'matter-js';
import type { Ref } from 'vue';
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

type BallFrictionsByRowCount = {
    friction: NonNullable<IBodyDefinition['friction']>;
    frictionAirByRowCount: Record<RowCount, NonNullable<IBodyDefinition['frictionAir']>>;
};

export const usePlinkoEngineStore = defineStore('plinkoEngine', () => {
  const game = useGameStore();

  const canvas: Ref<HTMLCanvasElement> = ref(null);

  const betAmount: Ref<number> = ref(0);

  const rowCount: Ref<RowCount> = ref(null);
  /**
   * A cache value of the {@link riskLevel} store for faster access.
   */
  const riskLevel: Ref<RiskLevel> = ref(null);

  const engine: Ref<Matter.Engine> = ref(null);
  const render: Ref<Matter.Render> = ref(null);
  const runner: Ref<Matter.Runner> = ref(null);

  const pins: Ref<Matter.Body[]> = ref([]);
  /**
   * Walls are invisible, slanted "guard rails" at the left and right sides of the
   * pin triangle. It prevents balls from falling outside the pin triangle and not
   * hitting a bin.
   */
  const walls: Ref<Matter.Body[]> = ref([]);
  /**
   * "Sensor" is an invisible body at the bottom of the canvas. It detects whether
   * a ball arrives at the bottom and enters a bin.
   */
  const sensor: Ref<Matter.Body> = ref(null);

  /**
   * The x-coordinates of every pin's center in the last row. Useful for calculating
   * which bin a ball falls into.
   */
  const pinsLastRowXCoords: number[] = [];

  static WIDTH = 760;
  static HEIGHT = 570;

  const static PADDING_X = 52;
  const static PADDING_TOP = 36;
  const static PADDING_BOTTOM = 28;

  const static PIN_CATEGORY = 0x0001;
  const static BALL_CATEGORY = 0x0002;

  /**
   * Friction parameters to be applied to the ball body.
   *
   * Higher friction leads to more concentrated distribution towards the center. These numbers
   * are found by trial and error to make the actual weighted bin payout very close to the
   * expected bin payout.
   */
  const static ballFrictions: BallFrictionsByRowCount = {
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

  return {  }
})
