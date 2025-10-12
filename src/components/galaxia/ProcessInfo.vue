<!-- components/galaxia/ProcessInfo.vue -->
<template>
  <v-card-text class="pa-4">
    <!-- BOTONES DE VALIDACIÓN Y ACTIVACIÓN MEJORADOS -->
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <v-btn 
            color="warning" 
            @click="validateProcess" 
            :loading="validating"
            class="mr-2"
          >
            <v-icon left>mdi-check-circle</v-icon>
            {{ validating ? 'Validando...' : 'Validar Proceso' }}
          </v-btn>
          
          <v-btn 
            v-if="!currentProcess.isActive || currentProcess.isActive === 'n'"
            color="success" 
            @click="activateProcess" 
            :disabled="!canActivateProcess"
            :loading="activating"
            class="mr-2"
          >
            <v-icon left>mdi-play</v-icon>
            {{ activating ? 'Activando...' : 'Activar Proceso' }}
          </v-btn>

          <v-btn 
            v-else
            color="error" 
            @click="deactivateProcess" 
            :loading="deactivating"
            class="mr-2"
          >
            <v-icon left>mdi-stop</v-icon>
            {{ deactivating ? 'Desactivando...' : 'Desactivar Proceso' }}
          </v-btn>
        </div>
        
        <!-- ESTADO MEJORADO -->
        <div class="d-flex align-center">
          <v-chip :color="validationStatus.color" dark class="mr-2">
            <v-icon left>{{ validationStatus.icon }}</v-icon>
            {{ validationStatus.text }}
          </v-chip>
          <v-chip :color="activationStatus.color" dark>
            <v-icon left>{{ activationStatus.icon }}</v-icon>
            {{ activationStatus.text }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <!-- RESULTADO DE VALIDACIÓN -->
    <v-card v-if="validationResult" class="mb-4">
      <v-card-title class="headline" :class="validationResult.isValid ? 'success' : 'error'">
        {{ validationResult.isValid ? '✅ PROCESO VÁLIDO' : '❌ PROCESO INVÁLIDO' }}
      </v-card-title>
      
      <v-card-text>
        <!-- ERRORES -->
        <v-alert v-if="validationResult.errors.length > 0" type="error" class="mb-3">
          <strong>Errores de validación:</strong>
          <ul class="mt-2 mb-0">
            <li v-for="error in validationResult.errors" :key="error">
              <v-icon small color="error" class="mr-1">mdi-close-circle</v-icon>
              {{ error }}
            </li>
          </ul>
        </v-alert>

        <!-- ADVERTENCIAS -->
        <v-alert v-if="validationResult.warnings.length > 0" type="warning" class="mb-3">
          <strong>Advertencias:</strong>
          <ul class="mt-2 mb-0">
            <li v-for="warning in validationResult.warnings" :key="warning">
              <v-icon small color="warning" class="mr-1">mdi-alert</v-icon>
              {{ warning }}
            </li>
          </ul>
        </v-alert>

        <!-- RESUMEN -->
        <v-alert v-if="validationResult.isValid" type="success">
          <strong>✅ Proceso listo para activar</strong>
          <div class="mt-2">
            <v-row>
              <v-col cols="6">
                <strong>Actividades:</strong> {{ validationResult.summary.totalActivities }}
              </v-col>
              <v-col cols="6">
                <strong>Transiciones:</strong> {{ validationResult.summary.totalTransitions }}
              </v-col>
              <v-col cols="6">
                <strong>Interactivas:</strong> {{ validationResult.summary.interactiveActivities }}
              </v-col>
              <v-col cols="6">
                <strong>Inicio/Fin:</strong> {{ validationResult.summary.startActivities }}/{{ validationResult.summary.endActivities }}
              </v-col>
            </v-row>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- INFORMACIÓN DEL PROCESO -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1">
            <v-icon left>mdi-information</v-icon>
            Información del Proceso
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Nombre</v-list-item-title>
                  <v-list-item-subtitle>{{ currentProcess.name }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Versión</v-list-item-title>
                  <v-list-item-subtitle>{{ currentProcess.version }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Descripción</v-list-item-title>
                  <v-list-item-subtitle>{{ currentProcess.description || 'Sin descripción' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1">
            <v-icon left>mdi-cog</v-icon>
            Estado del Proceso
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Estado</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip small :color="currentProcess.isActive === 'y' ? 'green' : 'red'" dark>
                      <v-icon small left>
                        {{ currentProcess.isActive === 'y' ? 'mdi-play' : 'mdi-pause' }}
                      </v-icon>
                      {{ currentProcess.isActive === 'y' ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Validez</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip small :color="currentProcess.isValid === 'y' ? 'green' : 'orange'" dark>
                      <v-icon small left>
                        {{ currentProcess.isValid === 'y' ? 'mdi-check' : 'mdi-alert' }}
                      </v-icon>
                      {{ currentProcess.isValid === 'y' ? 'Válido' : 'Inválido' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Última Modificación</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(currentProcess.lastModif) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- BOTONES DE ACCIÓN -->
    <v-row class="mt-4">
      <v-col cols="12" class="text-center">
        <v-btn color="primary" @click="$router.push('/galaxia')" class="mr-2">
          <v-icon left>mdi-arrow-left</v-icon>
          Volver a la Lista
        </v-btn>
        
        <v-btn color="warning" @click="editProcess" class="mr-2">
          <v-icon left>mdi-pencil</v-icon>
          Editar Proceso
        </v-btn>

        <v-btn color="success" @click="manageActivities">
          <v-icon left>mdi-playlist-check</v-icon>
          Gestionar Actividades
        </v-btn>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
export default {
  name: 'ProcessInfo',
  props: {
    processId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      validating: false,
      activating: false,
      deactivating: false,
      validationResult: null
    }
  },
  computed: {
    currentProcess() {
      return this.$store.getters['galaxia/getProcessById'](this.processId)
    },
    
    validationStatus() {
      if (!this.currentProcess) {
        return { color: 'grey', icon: 'mdi-help', text: 'Desconocido' }
      }
      
      if (this.currentProcess.isValid === 'y') {
        return { color: 'green', icon: 'mdi-check-circle', text: 'Válido' }
      } else {
        return { color: 'orange', icon: 'mdi-alert-circle', text: 'Inválido' }
      }
    },
    
    activationStatus() {
      if (!this.currentProcess) {
        return { color: 'grey', icon: 'mdi-help', text: 'Desconocido' }
      }
      
      if (this.currentProcess.isActive === 'y') {
        return { color: 'green', icon: 'mdi-play', text: 'Activo' }
      } else {
        return { color: 'red', icon: 'mdi-pause', text: 'Inactivo' }
      }
    },
    
    canActivateProcess() {
      return this.currentProcess && 
             this.currentProcess.isValid === 'y' && 
             this.currentProcess.isActive === 'n'
    }
  },
  methods: {
    async validateProcess() {
      this.validating = true
      try {
        const result = await this.$store.dispatch('galaxia/validateProcess', this.processId)
        if (result.ok) {
          this.validationResult = result.data
          this.$notify(result.message, result.data.isValid ? 'success' : 'warning')
        }
      } catch (error) {
        this.$notify('Error validando proceso', 'error')
      } finally {
        this.validating = false
      }
    },
    
    async activateProcess() {
      this.activating = true
      try {
        const result = await this.$store.dispatch('galaxia/activateProcess', this.processId)
        if (result.ok) {
          this.$notify('✅ ' + result.message, 'success')
          // Recargar datos del proceso
          this.$store.dispatch('galaxia/loadProcesses')
        }
      } catch (error) {
        this.$notify('❌ Error activando proceso', 'error')
      } finally {
        this.activating = false
      }
    },

    async deactivateProcess() {
      if (!confirm('¿Estás seguro de desactivar este proceso? Las instancias en ejecución se pausarán.')) {
        return
      }

      this.deactivating = true
      try {
        const result = await this.$store.dispatch('galaxia/deactivateProcess', this.processId)
        if (result.ok) {
          this.$notify('⏸️ ' + result.message, 'info')
          // Recargar datos del proceso
          this.$store.dispatch('galaxia/loadProcesses')
        }
      } catch (error) {
        this.$notify('❌ Error desactivando proceso', 'error')
      } finally {
        this.deactivating = false
      }
    },
    
    editProcess() {
      this.$notify('Funcionalidad de edición disponible en la siguiente fase', 'info')
    },
    
    manageActivities() {
      // Navegar a la pestaña de actividades
      this.$emit('navigate-to-activities')
    },
    
    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  
  created() {
    if (!this.currentProcess) {
      this.$store.dispatch('galaxia/loadProcesses')
    }
  }
}
</script>

<style scoped>
.v-list-item {
  min-height: 48px;
}
</style>