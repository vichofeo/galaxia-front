<!-- components/galaxia/WorkitemList.vue -->
<template>
    <v-card>
        <v-toolbar color="indigo" dark flat>
            <v-toolbar-title>
                <v-icon left>mdi-format-list-checks</v-icon>
                Tareas Pendientes
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <!-- FILTROS -->
            <v-select v-model="filters.priority" :items="priorityOptions" label="Prioridad" dense outlined hide-details
                class="mr-2" style="max-width: 150px;"></v-select>

            <v-select v-model="filters.process" :items="processOptions" label="Proceso" dense outlined hide-details
                style="max-width: 200px;"></v-select>
        </v-toolbar>

        <v-card-text>
            <!-- LISTA DE WORKITEMS -->

            <v-data-table :headers="headers" :items="filteredWorkitems" :loading="loading" :items-per-page="10"
                class="elevation-1" loading-text="Cargando tareas..." no-data-text="No tienes tareas pendientes">
                <!-- COLUMNA: PRIORIDAD -->
                <template v-slot:item.priority="{ item }">
                    <v-chip small :color="getPriorityColor(item.priority)" dark>
                        <v-icon small left>{{ getPriorityIcon(item.priority) }}</v-icon>
                        {{ getPriorityText(item.priority) }}
                    </v-chip>
                </template>

                <!-- COLUMNA: ACTIVIDAD -->
                <template v-slot:item.gw_ga_activity="{ item }">
                    <div>
                        <strong>{{ item.gw_ga_activity.name }}</strong>
                        <div class="caption">
                            <v-chip x-small :color="getActivityTypeColor(item.gw_ga_activity.type)" dark>
                                {{ getActivityTypeText(item.gw_ga_activity.type) }}
                            </v-chip>
                            <span v-if="item.gw_ga_activity.isInteractive === 'y'" class="ml-1">
                                <v-icon x-small color="green">mdi-account</v-icon>
                            </span>
                            <span v-else class="ml-1">
                                <v-icon x-small color="blue">mdi-robot</v-icon>
                            </span>
                        </div>
                    </div>
                </template>

                <!-- COLUMNA: INSTANCIA -->
                <template v-slot:item.gw_gi_instance="{ item }">
                    <div>
                        <strong>{{ item.gw_gi_instance.name }}</strong>
                        <div class="caption">{{ item.gw_gi_instance.gi_gp_process.name }} v{{
                            item.gw_gi_instance.gi_gp_process.version }}</div>
                    </div>
                </template>

                <!-- COLUMNA: FECHA -->
                <template v-slot:item.started="{ item }">
                    {{ formatDate(item.started) }}
                </template>

                <!-- COLUMNA: TIEMPO TRANSCURRIDO -->
                <template v-slot:item.elapsedTime="{ item }">
                    <v-chip x-small :color="getElapsedTimeColor(item.started)" dark>
                        {{ calculateElapsedTime(item.started) }}
                    </v-chip>
                </template>

                <!-- COLUMNA: ACCIONES -->
                <template v-slot:item.actions="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn x-small color="primary" @click="executeWorkitem(item)" v-on="on"
                                :loading="executingWorkitem === item.itemId">
                                <v-icon left small>mdi-play</v-icon>
                                Ejecutar
                            </v-btn>
                        </template>
                        <span>Ejecutar esta tarea</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn small icon @click="viewInstance(item.gw_gi_instance)" color="info" class="ml-1"
                                v-on="on">
                                <v-icon small>mdi-eye</v-icon>
                            </v-btn>
                        </template>
                        <span>Ver instancia</span>
                    </v-tooltip>
                </template>

                <!-- LOADING -->
                <template v-slot:loading>
                    <v-row justify="center" align="center" class="py-4">
                        <v-col cols="auto">
                            <v-progress-circular indeterminate color="primary" />
                        </v-col>
                        <v-col cols="auto">
                            <span class="ml-2">Cargando tareas...</span>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>

            <!-- SIN TAREAS -->
            <div v-if="!loading && filteredWorkitems.length === 0" class="text-center py-8">
                <v-icon size="64" color="green lighten-2">mdi-check-circle-outline</v-icon>
                <div class="text-h6 green--text mt-2">¡No tienes tareas pendientes!</div>
                <div class="caption grey--text">Todo está al día</div>
                <v-btn color="primary" class="mt-4" @click="$emit('refresh')">
                    <v-icon left>mdi-refresh</v-icon>
                    Actualizar
                </v-btn>
            </div>
        </v-card-text>
        <!-- ACTIVITY EXECUTOR MODAL - NUEVO -->
        <v-dialog v-model="showActivityExecutor" max-width="800" persistent>
            <ActivityExecutor v-if="selectedWorkitem" :workitem="selectedWorkitem" @completed="handleActivityCompleted"
                @close="closeActivityExecutor" />
        </v-dialog>
    </v-card>
</template>

<script>
import ActivityExecutor from '@/components/galaxia/ActivityExecutor.vue'
export default {
    name: 'WorkitemList',
    components: { ActivityExecutor },
    props: {
        workitems: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false }
    },
    data() {
        return {
            filters: {
                priority: 'all',
                process: 'all'
            },
            headers: [
                { text: 'Prioridad', value: 'priority', width: '120px' },
                { text: 'Actividad', value: 'gw_ga_activity' },
                { text: 'Instancia', value: 'gw_gi_instance' },
                { text: 'Iniciada', value: 'started', width: '140px' },
                { text: 'Tiempo', value: 'elapsedTime', width: '100px' },
                { text: 'Acciones', value: 'actions', sortable: false, width: '150px' }
            ],
            priorityOptions: [
                { text: 'Todas', value: 'all' },
                { text: 'Alta', value: 'high' },
                { text: 'Media', value: 'medium' },
                { text: 'Baja', value: 'low' }
            ],
            // NUEVAS PROPIEDADES
            showActivityExecutor: false,
            selectedWorkitem: null,
            executingWorkitem: null
        }
    },
    computed: {
        filteredWorkitems() {
            let filtered = this.workitems

            // Filtrar por prioridad
            if (this.filters.priority !== 'all') {
                filtered = filtered.filter(item => item.priority === this.filters.priority)
            }

            // Filtrar por proceso
            if (this.filters.process !== 'all') {
                filtered = filtered.filter(item => item.gw_gi_instance.pId == this.filters.process)
            }

            return filtered
        },

        processOptions() {
            const processes = this.workitems.map(item => ({
                text: item.gw_gi_instance.gi_gp_process.name,
                value: item.gw_gi_instance.pId
            }))


            // Eliminar duplicados
            const unique = [...new Map(processes.map(p => [p.value, p])).values()]
            return [{ text: 'Todos', value: 'all' }, ...unique]
        }
    },
    methods: {
        getPriorityColor(priority) {
            const colors = {
                high: 'red',
                medium: 'orange',
                low: 'blue'
            }
            return colors[priority] || 'grey'
        },

        getPriorityIcon(priority) {
            const icons = {
                high: 'mdi-alert',
                medium: 'mdi-clock',
                low: 'mdi-calendar'
            }
            return icons[priority] || 'mdi-help'
        },

        getPriorityText(priority) {
            const texts = {
                high: 'Alta',
                medium: 'Media',
                low: 'Baja'
            }
            return texts[priority] || priority
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

        formatDate(timestamp) {
            if (!timestamp) return 'N/A'
            return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        },

        calculateElapsedTime(startTimestamp) {
            const now = Math.floor(Date.now() / 1000)
            const elapsed = now - startTimestamp

            if (elapsed < 3600) {
                return `${Math.floor(elapsed / 60)}m`
            } else if (elapsed < 86400) {
                return `${Math.floor(elapsed / 3600)}h`
            } else {
                return `${Math.floor(elapsed / 86400)}d`
            }
        },

        getElapsedTimeColor(startTimestamp) {
            const now = Math.floor(Date.now() / 1000)
            const elapsed = now - startTimestamp

            if (elapsed > 86400) return 'red'    // Más de 1 día
            if (elapsed > 3600) return 'orange'  // Más de 1 hora
            return 'green'                        // Menos de 1 hora
        },

        viewInstance(instance) {
            this.$router.push(`/galaxia/instance/${instance.instanceId}`)
        },
        // --- NUEVOS MÉTODOS PARA EJECUCIÓN ---
        executeWorkitem(workitem) {
            this.selectedWorkitem = workitem
            this.showActivityExecutor = true
        },

        handleActivityCompleted(result) {
            this.$notify('✅ Actividad completada exitosamente', 'success')
            this.closeActivityExecutor()
            // Emitir evento para recargar datos
            this.$emit('refresh')
        },

        closeActivityExecutor() {
            this.showActivityExecutor = false
            this.selectedWorkitem = null
            this.executingWorkitem = null
        }

    }
}
</script>

<style scoped>
.v-data-table>>>tbody tr {
    cursor: pointer;
}

.v-data-table>>>tbody tr:hover {
    background-color: #f0f8ff;
}
</style>