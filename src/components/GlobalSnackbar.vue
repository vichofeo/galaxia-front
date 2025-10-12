<!-- src/components/GlobalSnackbar.vue -->
<template>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout" bottom right>
    <v-icon left>{{ snackbar.icon }}</v-icon>
    {{ snackbar.message }}
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="snackbar.show = false">
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'GlobalSnackbar',
  data() {
    return {
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        icon: 'mdi-information',
        timeout: 4000
      }
    }
  },
  created() {
    // Escuchar eventos globales
    this.$root.$on('show-snackbar', (options) => {
      this.snackbar = {
        show: true,
        message: options.message,
        color: options.color,
        icon: options.icon,
        timeout: options.timeout || 4000
      }
    })
  },
  beforeDestroy() {
    this.$root.$off('show-snackbar')
  }
}
</script>