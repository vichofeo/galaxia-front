<template>
  <v-container>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      top
    >
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
    <InstanceList
      @error="showError"
    />
  </v-container>
</template>

<script>
import InstanceList from '@/components/galaxia/InstanceList.vue';

export default {
  name: 'ProcessMonitor',
  components: {
    InstanceList
  },
  data() {
    return {
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success'
    };
  },
  methods: {
    showSuccess(message) {
      this.snackbarText = message;
      this.snackbarColor = 'success';
      this.snackbar = true;
    },
    showError(message) {
      this.snackbarText = message;
      this.snackbarColor = 'error';
      this.snackbar = true;
    }
  }
};
</script>

<style scoped>
.v-container {
  padding: 16px;
}
</style>