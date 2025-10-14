<!-- components/galaxia/ActivityExecutor.vue -->
<template>
  <v-card v-if="currentWorkitem" class="activity-executor">
    <v-toolbar color="primary" dark>
      <v-toolbar-title>
        <v-icon left>mdi-play-circle</v-icon>
        Ejecutar: {{ currentWorkitem.gw_ga_activity.name }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="close" :disabled="executing">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-card-text class="pa-4">
      <!-- INFO DE LA INSTANCIA -->
      <v-alert type="info" dense class="mb-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <strong>Proceso:</strong> {{ currentWorkitem.gw_gi_instance.gi_gp_process.name }} v{{
              currentWorkitem.gw_gi_instance.gi_gp_process.version }}<br>
            <strong>Instancia:</strong> {{ currentWorkitem.gw_gi_instance.name }}<br>
            <strong>Actividad:</strong> {{ currentWorkitem.gw_ga_activity.name }}
            <v-chip x-small :color="getActivityTypeColor(currentWorkitem.gw_ga_activity.type)" dark class="ml-1">
              {{ getActivityTypeText(currentWorkitem.gw_ga_activity.type) }}
            </v-chip>
          </div>
          <v-chip :color="getPriorityColor(currentWorkitem.priority)" dark>
            {{ getPriorityText(currentWorkitem.priority) }}
          </v-chip>
        </div>
      </v-alert>

      <!-- DESCRIPCIÓN DE LA ACTIVIDAD -->
      <v-alert v-if="currentWorkitem.gw_ga_activity.description" type="info" outlined class="mb-4">
        <strong>Descripción:</strong> {{ currentWorkitem.gw_ga_activity.description }}
      </v-alert>

      <!-- FORMULARIO DINÁMICO SEGÚN TIPO DE ACTIVIDAD -->
      <div v-if="currentWorkitem.gw_ga_activity.type === 'standalone'">
        <GenericActivityForm :workitem="currentWorkitem" :loading="executing" @execute="executeActivity"
          @cancel="close" />
      </div>

      <div v-else-if="currentWorkitem.gw_ga_activity.normalized_name === 'browse_cds'">
        <CdAvailabilityTable :workitem="currentWorkitem" :loading="executing" @execute="executeActivity"
          @cancel="close" />
      </div>

      <div v-else>
        <!-- FORMULARIO GENÉRICO PARA ACTIVIDADES NO ESPECÍFICAS -->
        <v-form v-model="valid" @submit.prevent="executeGenericActivity">
          <v-card outlined class="mb-4">
            <v-card-title class="subtitle-1">
              <v-icon left>mdi-form-textbox</v-icon>
              Datos de Ejecución
            </v-card-title>
            <v-card-text>
              <v-textarea v-model="genericData.notes" label="Observaciones / Comentarios"
                placeholder="Ingresa cualquier observación relevante para esta actividad..." rows="3" outlined clearable
                :rules="[v => !!v || 'Las observaciones son requeridas']"></v-textarea>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="genericData.status" :items="statusOptions" label="Resultado de la actividad"
                    outlined :rules="[v => !!v || 'El resultado es requerido']"></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="genericData.reference" label="Número de Referencia"
                    placeholder="Ej: REF-001, TICKET-123" outlined clearable></v-text-field>
                </v-col>
              </v-row>

              <!-- CAMPOS ADICIONALES DINÁMICOS -->
              <v-row v-if="genericData.status === 'rejected'">
                <v-col cols="12">
                  <v-textarea v-model="genericData.rejection_reason" label="Motivo del Rechazo"
                    placeholder="Explica por qué se rechaza esta actividad..." rows="2" outlined
                    :rules="[v => !!v || 'El motivo del rechazo es requerido']"></v-textarea>
                </v-col>
              </v-row>

              <v-row v-if="genericData.status === 'pending_review'">
                <v-col cols="12">
                  <v-textarea v-model="genericData.review_notes" label="Notas para Revisión"
                    placeholder="Detalla qué aspectos necesitan revisión..." rows="2" outlined
                    :rules="[v => !!v || 'Las notas de revisión son requeridas']"></v-textarea>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- INFORMACIÓN ADICIONAL -->
          <v-card outlined class="mb-4">
            <v-card-title class="subtitle-1">
              <v-icon left>mdi-information</v-icon>
              Información de la Tarea
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <strong>Iniciada:</strong><br>
                  {{ formatDate(currentWorkitem.started) }}
                </v-col>
                <v-col cols="6">
                  <strong>Tiempo transcurrido:</strong><br>
                  <v-chip x-small :color="getElapsedTimeColor(currentWorkitem.started)" dark>
                    {{ calculateElapsedTime(currentWorkitem.started) }}
                  </v-chip>
                </v-col>
              </v-row>
              <v-row class="mt-2">
                <v-col cols="12">
                  <strong>Asignado a:</strong> {{ currentWorkitem.user || 'Usuario actual' }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="close" :disabled="executing" color="grey">
              <v-icon left>mdi-close</v-icon>
              Cancelar
            </v-btn>
            <v-btn color="primary" type="submit" :loading="executing" :disabled="!valid" large>
              <v-icon left>mdi-check-all</v-icon>
              Completar Actividad
            </v-btn>
          </v-card-actions>
        </v-form>
      </div>
    </v-card-text>

    <!-- SNACKBAR DE CONFIRMACIÓN -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000">
      <v-icon left>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>
  </v-card>
</template>

<script>
export default {
  name: 'ActivityExecutor',
  props: {
    workitem: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      executing: false,
      valid: false,
      showSuccess: false,
      successMessage: '',
      genericData: {
        notes: '',
        status: 'completed',
        reference: '',
        rejection_reason: '',
        review_notes: ''
      },
      statusOptions: [
        { text: '✅ Completado', value: 'completed' },
        { text: '❌ Rechazado', value: 'rejected' },
        { text: '⏳ Pendiente de Revisión', value: 'pending_review' },
        { text: '📝 En Progreso', value: 'in_progress' }
      ]
    }
  },
  computed: {
    currentWorkitem() {
      return this.workitem
    }
  },
  methods: {
    async executeActivity(inputData = {}) {
      this.executing = true
      try {
        console.log('🔨 Ejecutando actividad:', this.currentWorkitem.itemId, 'con datos:', inputData)

        const result = await this.$store.dispatch('galaxia/executeWorkitem', {
          workitemId: this.currentWorkitem.itemId,
          inputData: {
            ...this.genericData,
            ...inputData,
            executed_at: Math.floor(Date.now() / 1000),
            activity_type: this.currentWorkitem.gw_ga_activity.type,
            activity_name: this.currentWorkitem.gw_ga_activity.name
          }
        })

        if (result.ok) {
          this.successMessage = '✅ Actividad completada exitosamente'
          this.showSuccess = true

          // Esperar un momento antes de cerrar para que el usuario vea el mensaje
          setTimeout(() => {
            this.$emit('completed', result.data)
          }, 1500)
        } else {
          this.$notify(result.message || 'Error ejecutando actividad', 'error')
        }
      } catch (error) {
        console.error('❌ Error ejecutando actividad:', error)
        this.$notify('Error ejecutando actividad: ' + error.message, 'error')
      } finally {
        this.executing = false
      }
    },

    async executeGenericActivity() {
      await this.executeActivity(this.genericData)
    },

    close() {
      if (!this.executing) {
        this.$emit('close')
      }
    },

    getActivityTypeText(type) {
      const types = {
        start: 'Inicio',
        end: 'Fin',
        activity: 'Actividad',
        switch: 'Switch',
        standalone: 'Standalone'
      }
      return types[type] || type
    },

    getActivityTypeColor(type) {
      const colors = {
        start: 'green',
        end: 'red',
        activity: 'blue',
        switch: 'orange',
        standalone: 'purple'
      }
      return colors[type] || 'grey'
    },

    getPriorityColor(priority) {
      const colors = {
        high: 'red',
        medium: 'orange',
        low: 'blue'
      }
      return colors[priority] || 'grey'
    },

    getPriorityText(priority) {
      const texts = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
      }
      return texts[priority] || priority
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    calculateElapsedTime(startTimestamp) {
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - startTimestamp

      if (elapsed < 60) {
        return 'Ahora'
      } else if (elapsed < 3600) {
        return `${Math.floor(elapsed / 60)} minutos`
      } else if (elapsed < 86400) {
        return `${Math.floor(elapsed / 3600)} horas`
      } else {
        return `${Math.floor(elapsed / 86400)} días`
      }
    },

    getElapsedTimeColor(startTimestamp) {
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - startTimestamp

      if (elapsed > 86400) return 'red'    // Más de 1 día
      if (elapsed > 3600) return 'orange'  // Más de 1 hora
      return 'green'                        // Menos de 1 hora
    }
  },

  mounted() {
    console.log('🎯 ActivityExecutor montado para workitem:', this.currentWorkitem)

    // Auto-completar algunos campos basados en la actividad
    if (this.currentWorkitem.gw_ga_activity.description) {
      this.genericData.notes = `Ejecutado: ${this.currentWorkitem.gw_ga_activity.description}`
    }

    // Generar referencia automática
    this.genericData.reference = `REF-${this.currentWorkitem.itemId}-${Math.floor(Date.now() / 1000)}`
  }
}
</script>

<style scoped>
.activity-executor {
  max-width: 800px;
  margin: 0 auto;
}

.v-card__text {
  max-height: 70vh;
  overflow-y: auto;
}

/* Estilos para mejorar la legibilidad */
::v-deep .v-alert {
  border-left: 4px solid;
}

::v-deep .v-alert[type="info"] {
  border-left-color: #2196F3;
}
</style>