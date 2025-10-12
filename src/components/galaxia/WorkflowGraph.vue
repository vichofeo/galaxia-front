<!-- components/galaxia/WorkflowGraph.vue -->
<template>
    <v-card-text>
        <!-- BARRA DE HERRAMIENTAS -->
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex justify-space-between align-center">
                <v-btn color="primary" @click="loadData">
                    <v-icon left>mdi-refresh</v-icon>
                    Actualizar Diagrama
                </v-btn>

                <v-chip :color="isValidProcess ? 'green' : 'orange'" dark>
                    {{ isValidProcess ? 'Proceso Válido' : 'Proceso Inválido' }}
                </v-chip>
            </v-col>
        </v-row>

        <!-- VALIDACIONES -->
        <v-alert v-if="validationErrors.length > 0" type="warning" class="mb-4">
            <strong>Problemas en el flujo:</strong>
            <ul class="mt-2 mb-0">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
        </v-alert>

        <!-- DIAGRAMA AUTOMÁTICO -->
        <v-card outlined class="pa-4 workflow-diagram">
            <div class="graph-container">
                <!-- ACTIVIDADES ORGANIZADAS EN FILAS -->
                <div v-for="(row, rowIndex) in organizedActivities" :key="rowIndex" class="graph-row">
                    <div v-for="activity in row" :key="activity.activityId" class="graph-node"
                        :class="getNodeClasses(activity)">
                        <div class="node-icon">
                            <v-icon>{{ getActivityIcon(activity.type) }}</v-icon>
                        </div>
                        <div class="node-name">{{ activity.name }}</div>
                        <div class="node-type">{{ getActivityTypeText(activity.type) }}</div>

                        <!-- INDICADOR DE ROLES -->
                        <div v-if="activity.ga_gr_roles && activity.ga_gr_roles.length > 0" class="node-roles">
                            <v-chip x-small color="primary" dark>
                                {{ activity.ga_gr_roles.length }} rol(es)
                            </v-chip>
                        </div>
                    </div>
                </div>

                <!-- FLECHAS ENTRE ACTIVIDADES (SIMPLIFICADO) -->
                <div class="graph-arrows">
                    <div v-for="transition in transitions" :key="`${transition.actFromId}-${transition.actToId}`"
                        class="graph-arrow" :style="getArrowStyle(transition)">
                        <v-icon small class="arrow-head">mdi-arrow-right</v-icon>
                    </div>
                </div>
            </div>
        </v-card>

        <!-- LEYENDA -->
        <v-card class="mt-4">
            <v-card-text>
                <div class="d-flex flex-wrap gap-3">
                    <div class="d-flex align-center">
                        <div class="legend-color start-node"></div>
                        <span class="ml-2">Actividad Inicio</span>
                    </div>
                    <div class="d-flex align-center">
                        <div class="legend-color end-node"></div>
                        <span class="ml-2">Actividad Fin</span>
                    </div>
                    <div class="d-flex align-center">
                        <div class="legend-color interactive-node"></div>
                        <span class="ml-2">Interactiva</span>
                    </div>
                    <div class="d-flex align-center">
                        <div class="legend-color automatic-node"></div>
                        <span class="ml-2">Automática</span>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-card-text>
</template>

<script>
export default {
    name: 'WorkflowGraph',
    props: {
        processId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            activities: [],
            transitions: [],
            loading: false
        }
    },
    computed: {
        organizedActivities() {
            // Organizar actividades en filas para mejor visualización
            // (Algoritmo simplificado - se puede mejorar)
            const rows = [[]]
            let currentRow = 0

            this.activities.forEach(activity => {
                if (rows[currentRow].length >= 3) {
                    currentRow++
                    rows[currentRow] = []
                }
                rows[currentRow].push(activity)
            })

            return rows
        },

        validationErrors() {
            const errors = []

            // Validar que tenga start y end
            const hasStart = this.activities.some(a => a.type === 'start')
            const hasEnd = this.activities.some(a => a.type === 'end')

            if (!hasStart) errors.push('Falta actividad de inicio')
            if (!hasEnd) errors.push('Falta actividad de fin')

            // Validar actividades desconectadas
            const connectedActivities = new Set()
            this.transitions.forEach(t => {
                connectedActivities.add(t.actFromId)
                connectedActivities.add(t.actToId)
            })

            const disconnected = this.activities.filter(a => !connectedActivities.has(a.activityId))
            if (disconnected.length > 0) {
                errors.push(`Actividades desconectadas: ${disconnected.map(a => a.name).join(', ')}`)
            }

            return errors
        },

        isValidProcess() {
            return this.validationErrors.length === 0
        }
    },
    methods: {
        getActivityIcon(type) {
            const icons = {
                start: 'mdi-play',
                end: 'mdi-stop',
                activity: 'mdi-cog',
                switch: 'mdi-source-branch',
                standalone: 'mdi-star'
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

        getNodeClasses(activity) {
            return {
                'node-start': activity.type === 'start',
                'node-end': activity.type === 'end',
                'node-interactive': activity.isInteractive === 'y',
                'node-automatic': activity.isInteractive === 'n'
            }
        },

        getArrowStyle(transition) {
            // Posicionamiento simplificado de flechas
            // (Esto se puede hacer mucho más sofisticado)
            const fromIndex = this.getActivityIndex(transition.actFromId)
            const toIndex = this.getActivityIndex(transition.actToId)

            return {
                left: `${(fromIndex % 3) * 200 + 80}px`,
                top: `${Math.floor(fromIndex / 3) * 120 + 50}px`,
                width: `${Math.abs(toIndex - fromIndex) * 50}px`
            }
        },

        getActivityIndex(activityId) {
            return this.activities.findIndex(a => a.activityId === activityId)
        },

        async loadData() {
            this.loading = true
            try {
                // Cargar actividades
                await this.$store.dispatch('galaxia/loadProcessActivities', this.processId)
                this.activities = this.$store.state.galaxia.activities.filter(
                    a => a.pId == this.processId
                )

                // Cargar transiciones
                const transitionsResult = await this.$store.dispatch('galaxia/getProcessTransitions', this.processId)
                if (transitionsResult.ok) {
                    this.transitions = transitionsResult.data
                }
            } catch (error) {
                console.error('Error loading graph data:', error)
                this.$notify('Error cargando diagrama', 'error')
            } finally {
                this.loading = false
            }
        }
    },

    created() {
        this.loadData()
    }
}
</script>

<style scoped>
.workflow-diagram {
    background: #f8f9fa;
    min-height: 500px;
}

.graph-container {
    position: relative;
    min-height: 400px;
}

.graph-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;
    position: relative;
    z-index: 2;
}

.graph-node {
    width: 160px;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    text-align: center;
    position: relative;
}

.node-start {
    border-color: #4caf50;
    background: #e8f5e8;
}

.node-end {
    border-color: #f44336;
    background: #ffebee;
}

.node-interactive {
    border-left: 4px solid #2196f3;
}

.node-automatic {
    border-left: 4px solid #ff9800;
}

.node-icon {
    margin-bottom: 8px;
}

.node-name {
    font-weight: bold;
    font-size: 0.85em;
    margin-bottom: 4px;
}

.node-type {
    font-size: 0.7em;
    color: #666;
    text-transform: uppercase;
}

.node-roles {
    position: absolute;
    top: -8px;
    right: -8px;
}

.graph-arrows {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.graph-arrow {
    position: absolute;
    height: 2px;
    background: #1976d2;
    display: flex;
    align-items: center;
}

.arrow-head {
    position: absolute;
    right: -12px;
    color: #1976d2;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
}

.start-node {
    background: #e8f5e8;
    border: 2px solid #4caf50;
}

.end-node {
    background: #ffebee;
    border: 2px solid #f44336;
}

.interactive-node {
    background: white;
    border-left: 4px solid #2196f3;
}

.automatic-node {
    background: white;
    border-left: 4px solid #ff9800;
}
</style>