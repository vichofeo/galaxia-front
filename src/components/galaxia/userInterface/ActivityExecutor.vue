<template>
  <v-container fluid v-if="workitem">
    <v-card>
      <!-- Header de la Actividad -->
      <v-card-title class="primary white--text">
        <v-icon left>{{ getActivityIcon(workitem.gw_ga_activity.type) }}</v-icon>
        {{ workitem.gw_ga_activity.name }}
        <v-spacer></v-spacer>
        <v-chip dark>{{ workitem.gw_ga_activity.type }}</v-chip>
      </v-card-title>

      <v-card-subtitle class="pt-3">
        <v-row>
          <v-col cols="12" md="6">
            <strong>Proceso:</strong> {{ workitem.gw_gi_instance.gi_gp_process.name }} v{{ workitem.gw_gi_instance.gi_gp_process.version }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>Instancia:</strong> #{{ workitem.gw_gi_instance.id }} •
            <v-chip x-small :color="getStatusColor(workitem.gw_gi_instance.status)">
              {{ workitem.gw_gi_instance.status }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <!-- Contenido de la Actividad -->
      <v-card-text class="pa-6">
        <!-- Descripción -->
        <div class="mb-6" v-if="workitem.gw_ga_activity.description">
          <h4 class="subtitle-1">Descripción:</h4>
          <p class="body-1">{{ workitem.gw_ga_activity.description }}</p>
        </div>

        <!-- Formulario Interactivo -->
        <div v-if="workitem.gw_ga_activity.isInteractive && !activityCompleted">
          <v-form ref="activityForm" v-model="formValid">
            <v-alert type="info" class="mb-4">
              <v-icon left>mdi-information</v-icon>
              Esta es una actividad interactiva. Complete el formulario y presione "Completar Actividad".
            </v-alert>

            <!-- Campos Dinámicos según el tipo de actividad -->
            <v-text-field v-model="formData.name" label="Nombre" :rules="[v => !!v || 'Nombre requerido']"
              class="mb-4"></v-text-field>

            <v-textarea v-model="formData.description" label="Descripción" rows="3" class="mb-4"></v-textarea>

            <v-select v-model="formData.priority" :items="priorityOptions" label="Prioridad" class="mb-4"></v-select>

            <!-- Aquí irían campos específicos según la actividad -->
            <div class="mb-4">
              <h4 class="subtitle-2 mb-2">Datos de Instancia Actuales:</h4>
              <v-chip v-for="(value, key) in workitem.gw_gi_instance.data" :key="key" class="ma-1" small>
                {{ key }}: {{ value }}
              </v-chip>
            </div>
          </v-form>
        </div>

        <!-- Actividad Automática -->
        <div v-else-if="!workitem.gw_ga_activity.isInteractive && !activityCompleted">
          <v-alert type="warning" class="mb-4">
            <v-icon left>mdi-robot</v-icon>
            Esta es una actividad automática. Se ejecutará inmediatamente al iniciar.
          </v-alert>
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
            <div>Ejecutando actividad automática...</div>
          </div>
        </div>

        <!-- Actividad Completada -->
        <div v-else>
          <v-alert type="success" class="mb-4">
            <v-icon left>mdi-check-circle</v-icon>
            Actividad completada exitosamente.
          </v-alert>
          <div class="text-center">
            <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
            <div class="headline">¡Actividad Completada!</div>
            <div class="subtitle-1 mt-2">La instancia ha avanzado a la siguiente actividad.</div>
          </div>
        </div>
      </v-card-text>

      <!-- Acciones -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>

        <v-btn text @click="$router.go(-1)" :disabled="executing">
          <v-icon left>mdi-arrow-left</v-icon>
          Volver
        </v-btn>

        <v-btn v-if="workitem.gw_ga_activity.isInteractive && !activityCompleted" color="primary" @click="completeActivity"
          :loading="executing" :disabled="!formValid">
          <v-icon left>mdi-check</v-icon>
          Completar Actividad
        </v-btn>

        <v-btn v-else-if="!workitem.gw_ga_activity.isInteractive && !activityCompleted" color="primary"
          @click="executeAutomaticActivity" :loading="executing">
          <v-icon left>mdi-play</v-icon>
          Ejecutar Automáticamente
        </v-btn>

        <v-btn v-else color="success" @click="$router.push('/galaxia/dashboard')">
          <v-icon left>mdi-home</v-icon>
          Volver al Dashboard
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>

  <v-container v-else>
    <v-alert type="error">
      Workitem no encontrado o no disponible.
    </v-alert>
    <v-btn @click="$router.push('/galaxia/dashboard')" color="primary">
      Volver al Dashboard
    </v-btn>
  </v-container>
</template>

<script>
import * as srv from "@/services/galaxia/uiWorkItemService"
export default {
  name: 'ActivityExecutor',
  data() {
    return {
      workitem: null,
      executing: false,
      activityCompleted: false,
      formValid: false,
      formData: {
        name: '',
        description: '',
        priority: 'medium'
      },
      priorityOptions: [
        { text: 'Baja', value: 'low' },
        { text: 'Media', value: 'medium' },
        { text: 'Alta', value: 'high' }
      ]
    }
  },
  async mounted() {
    await this.loadWorkitem()

    // Si es automática, ejecutar inmediatamente
    if (this.workitem && !this.workitem.gw_ga_activity.isInteractive) {
      this.executeAutomaticActivity()
    }
  },
  methods: {
    async loadWorkitem() {
      try {
        const workitemId = this.$route.params.workitemId
        const response = await srv.getDetailWorkItem(workitemId)
        //await this.$axios.get(`/api/workitems/${workitemId}`)
        this.workitem = response.data
        console.log(this.workitem)
      } catch (error) {
        console.error('Error loading workitem:', error)
        this.$notify('Error al cargar la actividad', 'error')

      }
    },
    async completeActivity() {
      this.executing = true
      try {
        await srv.saveCompleteWorkItem(this.workitem.itemId, this.formData)
        /*await this.$axios.post(`/api/workitems/${this.workitem.id}/complete`, {
          resultData: this.formData
        })*/

        this.activityCompleted = true
        this.$notify('Actividad completada exitosamente', 'success')

      } catch (error) {
        console.error('Error completing activity:', error)
        this.$notify('Error al completar la actividad', 'error')

      } finally {
        this.executing = false
      }
    },
    async executeAutomaticActivity() {
      this.executing = true
      try {
        // Simular ejecución automática
        await new Promise(resolve => setTimeout(resolve, 2000))
        const resultData = { automated: true, ended: Math.floor(Date.now() / 1000) }
        await srv.saveCompleteWorkItem(this.workitem.itemId, resultData)
        /*await this.$axios.post(`/api/workitems/${this.workitem.id}/complete`, {
          resultData: { automated: true, executedAt: new Date().toISOString() }
        })*/

        this.activityCompleted = true
        this.$notify('Actividad automática ejecutada', 'success')

      } catch (error) {
        console.error('Error executing automatic activity:', error)
        this.$notify('Error en actividad automática', 'error')

      } finally {
        this.executing = false
      }
    },
    getActivityIcon(type) {
      const icons = {
        start: 'mdi-play',
        end: 'mdi-stop',
        activity: 'mdi-cog',
        switch: 'mdi-swap-horizontal',
        standalone: 'mdi-star',
        split: 'mdi-call-split',
        join: 'mdi-merge'
      }
      return icons[type] || 'mdi-circle'
    },
    getStatusColor(status) {
      const colors = {
        active: 'primary',
        completed: 'success',
        aborted: 'error'
      }
      return colors[status] || 'grey'
    }
  }
}
</script>