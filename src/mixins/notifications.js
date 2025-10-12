// src/mixins/notifications.js
export default {
  methods: {
    $notify(message, type = 'success') {
      const colors = {
        success: 'green',
        error: 'red', 
        warning: 'orange',
        info: 'blue'
      }
      
      const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information'
      }
      
      // Emitir evento global que nuestro layout escuchará
      this.$root.$emit('show-snackbar', {
        message,
        color: colors[type] || 'blue',
        icon: icons[type] || 'mdi-information',
        timeout: type === 'error' ? 6000 : 4000
      })
    }
  }
}