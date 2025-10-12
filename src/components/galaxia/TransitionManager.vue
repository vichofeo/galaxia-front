<!-- components/galaxia/TransitionManager.vue -->
<template>
    <v-card-text>
        <!-- BARRA DE HERRAMIENTAS -->
         TRANSITION MANAGER
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex justify-space-between align-center">
                <v-btn color="primary" @click="enableLinking = !enableLinking"
                    :color="enableLinking ? 'red' : 'primary'">
                    <v-icon left>{{ enableLinking ? 'mdi-link-off' : 'mdi-link' }}</v-icon>
                    {{ enableLinking ? 'Cancelar Conexión' : 'Conectar Actividades' }}
                </v-btn>

                <div class="d-flex align-center">
                    <v-chip :color="transitionsCount > 0 ? 'green' : 'orange'" dark class="mr-2">
                        {{ transitionsCount }} Conexiones
                    </v-chip>
                    <v-btn icon @click="loadTransitions" :loading="loading">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
            </v-col>
        </v-row>

        <!-- ALERTA MODO CONEXIÓN -->
        <v-alert v-if="enableLinking" type="info" class="mb-4">
            <strong>Modo Conexión Activado:</strong> Haz clic en una actividad de ORIGEN y luego en una de DESTINO para
            crear una conexión.
        </v-alert>

        <!-- DIAGRAMA VISUAL DE ACTIVIDADES -->
        <v-card outlined class="pa-4 workflow-canvas">
            <div class="activities-grid">
                <!-- ACTIVIDADES ORDENADAS POR FLOWNUM -->
                <div v-for="activity in sortedActivities" :key="activity.activityId" class="activity-node" :class="{
                    'activity-start': activity.type === 'start',
                    'activity-end': activity.type === 'end',
                    'activity-interactive': activity.isInteractive === 'y',
                    'activity-selected': selectedActivity === activity.activityId
                }" @click="handleActivityClick(activity)">
                    <div class="activity-icon">
                        <v-icon>{{ getActivityIcon(activity.type) }}</v-icon>
                    </div>
                    <div class="activity-name">{{ activity.name }}</div>
                    <div class="activity-type">{{ getActivityTypeText(activity.type) }}</div>
                </div>
            </div>

            <!-- CONEXIONES VISUALES (SVG) -->
            <svg class="transitions-layer" width="100%" height="100%">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#1976d2" />
                    </marker>
                </defs>

                <!-- LINEAS DE CONEXIÓN -->
                <line v-for="transition in transitions" :key="`${transition.actFromId}-${transition.actToId}`"
                    :x1="getActivityPosition(transition.actFromId).x" :y1="getActivityPosition(transition.actFromId).y"
                    :x2="getActivityPosition(transition.actToId).x" :y2="getActivityPosition(transition.actToId).y"
                    stroke="#1976d2" stroke-width="2" marker-end="url(#arrowhead)" class="transition-line" />
            </svg>
        </v-card>

        <!-- LISTA DE TRANSICIONES EXISTENTES -->
        <v-card v-if="transitionsCount > 0" class="mt-4">
            <v-card-title>
                <v-icon left>mdi-vector-line</v-icon>
                Conexiones Existentes
            </v-card-title>
            <v-card-text>
                <v-list dense>
                    <v-list-item v-for="transition in transitions"
                        :key="`${transition.actFromId}-${transition.actToId}`">
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-arrow-right</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{ getActivityName(transition.actFromId) }} → {{ getActivityName(transition.actToId) }}
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon small @click="deleteTransition(transition)" color="error">
                                <v-icon small>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-card-text>
</template>

<script>
export default {
    name: 'TransitionManager',
    props: {
        processId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            loading: false,
            enableLinking: false,
            selectedActivity: null,
            activities: [],
            transitions: []
        }
    },
    computed: {
        sortedActivities() {
            return [...this.activities].sort((a, b) => a.flowNum - b.flowNum)
        },
        transitionsCount() {
            return this.transitions.length
        }
    },
    methods: {
        getActivityIcon(type) {
            
            const icons = {
                start: 'mdi-play',
                end: 'mdi-stop',
                activity: 'mdi-cog',
                switch: 'mdi-source-branch',
                standalone: 'mdi-star',
                split: 'mdi-call-split',
                join: 'mdi-merge'
            }
            return icons[type] || 'mdi-help'
        },
        getActivityTypeText(type) {
            const texts = {
                start: 'Inicio',
                end: 'Fin',
                activity: 'Actividad',
                switch: 'Switch',
                standalone: 'Standalone'
            }
            return texts[type] || type
        },
        async handleActivityClick(activity) {
            if (!this.enableLinking) return

            if (!this.selectedActivity) {
                // Primera selección - actividad ORIGEN
                this.selectedActivity = activity.activityId
                this.$notify(`Seleccionada ORIGEN: ${activity.name}`, 'info')
            } else {
                // Segunda selección - actividad DESTINO
                if (this.selectedActivity === activity.activityId) {
                    this.$notify('No puedes conectar una actividad consigo misma', 'warning')
                    return
                }

                try {
                    await this.$store.dispatch('galaxia/addTransition', {
                        processId: this.processId,
                        fromActivityId: this.selectedActivity,
                        toActivityId: activity.activityId
                    })

                    this.$notify('Conexión creada exitosamente', 'success')
                    this.loadTransitions()
                } catch (error) {
                    this.$notify('Error creando conexión', 'error')
                } finally {
                    this.selectedActivity = null
                    this.enableLinking = false
                }
            }
        },
        getActivityPosition(activityId) {
            // Posición simplificada para el ejemplo
            const activity = this.activities.find(a => a.activityId === activityId)
            const index = this.sortedActivities.findIndex(a => a.activityId === activityId)

            return {
                x: (index % 3) * 200 + 100,
                y: Math.floor(index / 3) * 150 + 75
            }
        },
        getActivityName(activityId) {
            const activity = this.activities.find(a => a.activityId === activityId)
            return activity ? activity.name : 'Desconocida'
        },
        async deleteTransition(transition) {
            try {
                await this.$store.dispatch('galaxia/deleteTransition', {
                    processId: this.processId,
                    fromActivityId: transition.actFromId,
                    toActivityId: transition.actToId
                })

                this.$notify('Conexión eliminada', 'success')
                this.loadTransitions()
            } catch (error) {
                this.$notify('Error eliminando conexión', 'error')
            }
        },
        async loadActivities() {
            try {
                await this.$store.dispatch('galaxia/loadProcessActivities', this.processId)
                this.activities = this.$store.state.galaxia.activities.filter(
                    activity => activity.pId == this.processId
                )
            } catch (error) {
                console.error('Error loading activities:', error)
            }
        },
        async loadTransitions() {
            this.loading = true
            try {
                const result = await this.$store.dispatch('galaxia/getProcessTransitions', this.processId)
                if (result.ok) {
                    this.transitions = result.data
                }
            } catch (error) {
                console.error('Error loading transitions:', error)
            } finally {
                this.loading = false
            }
        }
    },
    created() {
        this.loadActivities()
        this.loadTransitions()
    }
}
</script>

<style scoped>
.workflow-canvas {
    position: relative;
    min-height: 400px;
    background: #fafafa;
}

.activities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    position: relative;
    z-index: 2;
}

.activity-node {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    text-align: center;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.activity-node:hover {
    border-color: #1976d2;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.activity-node.activity-selected {
    border-color: #ff9800;
    background: #fff3e0;
}

.activity-node.activity-start {
    border-color: #4caf50;
    background: #e8f5e8;
}

.activity-node.activity-end {
    border-color: #f44336;
    background: #ffebee;
}

.activity-node.activity-interactive {
    border-left: 4px solid #2196f3;
}

.activity-icon {
    margin-bottom: 8px;
}

.activity-name {
    font-weight: bold;
    font-size: 0.9em;
    margin-bottom: 4px;
}

.activity-type {
    font-size: 0.7em;
    color: #666;
    text-transform: uppercase;
}

.transitions-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
}

.transition-line {
    pointer-events: none;
}
</style>