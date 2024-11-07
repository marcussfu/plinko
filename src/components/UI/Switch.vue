<template>
  <div>
    <input
      class="mz-switch-rounded" type="checkbox" name="" id="mz-switch-rounded"
      :checked="modelValue"
      @change="handleInput"
    >
    <label for="mz-switch-rounded"></label>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>();

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    emit('update:modelValue', target.checked);
  }
};
</script>

<style scoped>
/* Hide the original checkbox */
.mz-switch-rounded {
  display: none;
}

/* Style for the label that represents the checkbox */
.mz-switch-rounded + label {
  display: inline-block;
  width: 40px;
  height: 24px;
  background-color: #adb5bd; /* Primary color */
  box-sizing: border-box;
  position: relative;
  transition: background-color 0.4s; /* Transition effect */
}

/* Style for the custom checkbox thumb */
.mz-switch-rounded + label:after {
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  background-color: #ffffff; /* Thumb color */
  position: absolute;
  left: 2px;
  bottom: 2px;
  -webkit-transition: 0.4s;
  -moz-transition: 0.4s; /* For better browser support */
  transition: 0.4s;
}

/* Transform the thumb when checked */
.mz-switch-rounded:checked + label:after {
  -webkit-transform: translateX(16px);
  -moz-transform: translateX(16px); /* For better browser support */
  transform: translateX(16px);
}

/* Change background color when checked */
.mz-switch-rounded:checked + label {
  background-color: #22C55E; /* Checked color */
}

/* Style for rounded checkboxes */
.mz-switch-rounded + label,
.mz-switch-rounded + label::after {
  border-radius: 50px;
}

/* Ensure cursor changes for better UX */
.mz-switch-rounded + label,
.mz-switch-rounded:checked + label,
.mz-switch-rounded:not(:checked) + label {
  cursor: pointer;
}

</style>
