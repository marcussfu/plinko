import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSimulationStore = defineStore('simulation', () => {
  const isSimulationing = ref<boolean>(false);

  const outputs = ref<{[key: number]: number[]}>({});

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
    downloadLink.download = 'outputs' + (Object.keys(outputs.value).length-1) + '.json';
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
