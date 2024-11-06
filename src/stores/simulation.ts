import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSimulationStore = defineStore('simulation', () => {
  const isSimulationing = ref<boolean>(true);

  const outputs = ref<{[key: number]: number[]}>({
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
      13: [],
      14: [],
      15: [],
      16: []
  });

  const setOutputs = (index: number, id: number) => {
    outputs.value[index].push(startXDatas.value[id]);
  };

  const startXDatas = ref<{[key: number]: number}>({});// ballId: startX

  const setStartXDatas = (id: number, startX: number) => {
    startXDatas.value[id] = startX;
  };

  const exportToJsonFile = () => {
    // remove duplicate startX
    for (const key of Object.keys(outputs.value)) {
      outputs.value[key] = Array.from(new Set(outputs.value[key]));
    }
    // trans to json format
    const dataStr = JSON.stringify(outputs.value);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement('a');
    // export to json file
    downloadLink.href = downloadUrl;
    downloadLink.download = 'outputs.json';
    downloadLink.click();

    URL.revokeObjectURL(downloadUrl); //Clean up
  };

  return {
    isSimulationing,
    outputs,
    startXDatas,
    setOutputs,
    setStartXDatas,
    exportToJsonFile
  }
});