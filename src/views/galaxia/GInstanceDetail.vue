<template>
  <v-container fluid v-if="instance">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card color="primary" dark>
          <v-card-title>
            <v-icon left>mdi-information</v-icon>
            Detalle de Instancia #{{ instance.id }}
          </v-card-title>
          <v-card-subtitle>
            {{ instance.process.name }} v{{ instance.process.version }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Información Principal -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-history</v-icon>
            Historial de Actividades
          </v-card-title>
          <v-card-text>
            <v-timeline dense>
              <v-timeline-item
                v-for="workitem in sortedWorkitems"
                :key="workitem.id"
                :color="getWorkitemColor(workitem)"
                small
              >
                <template v-slot:opposite>
                  <span class="caption">{{ formatDate(workitem.createdAt) }}</span>
                </template>
                <div>
                  <strong>{{ workitem.activity.name }}</strong>
                  <div class="caption">{{ workitem.activity.type }}</div>
                  <div class="caption" v-if="workitem.completedAt">
                    Completado: {{ formatDate(workitem.completedAt) }}
                  </div>
                  <v-chip x-small v-if="workitem.status === 'pending'" color="orange">
                    Pendiente
                  </v-chip>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sidebar Info -->
      <v-col cols="12" md="4">
        <!-- Estado -->
        <v-card class="mb-4">
          <v-card-title class="subtitle-1">
            Estado de la Instancia
          </v-card-title>
          <v-card-text>
            <v-chip :color="getStatusColor(instance.status)" large class="ma-2">
              <v-icon left>mdi-circle</v-icon>
              {{ getStatusText(instance.status) }}
            </v-chip>
            <div class="mt-2">
              <strong>Creado:</strong> {{ formatDate(instance.createdAt) }}
            </div>
            <div>
              <strong>Por:</strong> {{ instance.creator.username }}
            </div>
          </v-card-text>
        </v-card>

        <!-- Datos de Instancia -->
        <v-card class="mb-4">
          <v-card-title class="subtitle-1">
            Datos de la Instancia
          </v-card-title>
          <v-card-text>
            <div v-if="Object.keys(instance.data || {}).length > 0">
              <v-chip
                v-for="(value, key) in instance.data"
                :key="key"
                small
                class="ma-1"
              >
                {{ key }}: {{ value }}
              </v-chip>
            </div>
            <div v-else class="text--secondary caption">
              No hay datos almacenados
            </div>
          </v-card-text>
        </v-card>

        <!-- Acciones -->
        <v-card>
          <v-card-title class="subtitle-1">
            Acciones
          </v-card-title>
          <v-card-actions>
            <v-btn 
              color="primary" 
              block 
              @click="executeCurrentActivity"
              :disabled="!hasPendingWorkitems"
            >
              <v-icon left>mdi-play</v-icon>
              Continuar Ejecución
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn 
              text 
              color="secondary" 
              block 
              @click="$router.push('/galaxia/dashboard')"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Volver al Dashboard
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else>
    <v-alert type="error">
      Instancia no encontrada.
    </v-alert>
    <v-btn @click="$router.push('/galaxia/dashboard')" color="primary">
      Volver al Dashboard
    </v-btn>
  </v-container>
</template>

<script>
export default {
  name: 'InstanceDetail',
  data() {
    return {
      instance: null,
      loading: false
    }
  },
  computed: {
    sortedWorkitems() {
      if (!this.instance || !this.instance.Workitems) return []
      return [...this.instance.Workitems].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      )
    },
    hasPendingWorkitems() {
      return this.instance && this.instance.Workitems && 
             this.instance.Workitems.some(w => w.status === 'pending')
    }
  },
  async mounted() {
    await this.loadInstance()
  },
  methods: {
    async loadInstance() {
      this.loading = true
      try {
        const instanceId = this.$route.params.id
        const response = await this.$axios.get(`/api/instances/${instanceId}`)
        this.instance = response.data
      } catch (error) {
        console.error('Error loading instance:', error)
        this.$store.dispatch('showSnackbar', {
          message: 'Error al cargar la instancia',
          color: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    getWorkitemColor(workitem) {
      const colors = {
        pending: 'orange',
        completed: 'green',
        'in-progress': 'blue'
      }
      return colors[workitem.status] || 'grey'
    },
    getStatusColor(status) {
      const colors = {
        active: 'primary',
        completed: 'success',
        aborted: 'error'
      }
      return colors[status] || 'grey'
    },
    getStatusText(status) {
      const texts = {
        active: 'Activo',
        completed: 'Completado',
        aborted: 'Abortado'
      }
      return texts[status] || status
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    executeCurrentActivity() {
      if (!this.hasPendingWorkitems) return
      
      // TODO: Reemplazar con usuario real
      const userId = 'admin'
      const userWorkitem = this.instance.Workitems.find(w => 
        w.status === 'pending' && w.assignedTo === userId
      )
      
      if (userWorkitem) {
        this.$router.push({
          name: 'ActivityExecutor',
          params: { 
            instanceId: this.instance.id,
            workitemId: userWorkitem.id
          }
        })
      } else {
        this.$store.dispatch('showSnackbar', {
          message: 'No tienes tareas pendientes en esta instancia',
          color: 'warning'
        })
      }
    }
  }
}
</script>