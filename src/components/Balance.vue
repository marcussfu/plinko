<template>
    <div class="flex overflow-hidden rounded-md">
        <div class="flex gap-2 bg-slate-900 px-3 py-2 text-sm font-semibold tabular-nums text-white sm:text-base">
            <span class="select-none text-gray-500">$</span>
            <span class="min-w-16 text-right">
            {{ balanceFormatted }}
            </span>
        </div>
        <div
          class="bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 active:bg-blue-700 sm:text-base cursor-pointer"
          @click="isShowAddMoney = true">
            Add
        </div>
        <div v-if="isShowAddMoney" ref="target" class="absolute top-[44px] left-1/2 -translate-x-1/2 z-30 max-w-lg space-y-2 rounded-md bg-slate-600 p-3">
          <p class="text-sm font-medium text-gray-200">Add money</p>
          <div class="flex gap-2">
            <button v-for="amount in addMoneyAmounts" :key="amount"
              @click="game.updateBalance(amount)"
              class="touch-manipulation rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-green-400 active:bg-green-600 disabled:bg-neutral-600 disabled:text-neutral-400"
            >
              +${{ amount }}
            </button>
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useGameStore } from '@/stores/game';
  import { onClickOutside } from '@vueuse/core';

  const isShowAddMoney = ref<boolean>(false);
  const target = ref(null);
  const game = useGameStore();
  const addMoneyAmounts = [100, 500, 1000];

  const balanceFormatted = computed(() => {
    return game.balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  onClickOutside(
    target,
    () => {
      isShowAddMoney.value = false;
    }
  );

</script>
