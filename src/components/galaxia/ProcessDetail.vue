<!-- views/galaxia/processes/ProcessDetail.vue -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-btn icon @click="$router.push('/galaxia')">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>
              <v-icon left>mdi-workflow</v-icon>
              Proceso: {{ processName }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip color="info" dark>
              ID: {{ $route.params.id }}
            </v-chip>
          </v-toolbar>

          <v-card-text class="pa-4">
            <!-- Información del proceso -->
            <v-row v-if="currentProcess" class="mb-6">
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title class="subtitle-1">Información del Proceso</v-card-title>
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
                  <v-card-title class="subtitle-1">Estado del Proceso</v-card-title>
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

            <!-- Placeholder para próximas funcionalidades -->
            <v-alert type="info" class="mb-4">
              <strong>Vista de Detalle del Proceso</strong><br>
              En la siguiente fase aquí estarán:
              <ul class="mt-2">
                <li>✅ Gestión de Actividades</li>
                <li>✅ Configuración de Roles</li>
                <li>✅ Editor de Transiciones</li>
                <li>✅ Validador de Procesos</li>
              </ul>
            </v-alert>

            <!-- Botones de acción -->
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ProcessDetail',
  data() {
    return {
      processName: 'Cargando...'
    }
  },
  computed: {
    currentProcess() {
      const processId = this.$route.params.id
      return this.$store.getters['galaxia/getProcessById'](processId)
    }
  },
  watch: {
    currentProcess: {
      immediate: true,
      handler(process) {
        if (process) {
          this.processName = process.name
        } else {
          this.processName = 'Proceso no encontrado'
        }
      }
    }
  },
  methods: {
    editProcess() {
      this.$notify('Funcionalidad de edición disponible en la siguiente fase', 'info')
    },
    manageActivities() {
      this.$notify('Gestor de actividades disponible en la siguiente fase', 'info')
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
    // Si el proceso no está cargado, cargar todos los procesos
    if (!this.currentProcess) {
      this.$store.dispatch('galaxia/loadProcesses')
    }
  }
}
</script>