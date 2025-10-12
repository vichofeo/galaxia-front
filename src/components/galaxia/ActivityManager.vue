<!-- components/galaxia/ActivityManager.vue -->
<template>
    <v-card-text>
        <!-- BARRA DE HERRAMIENTAS -->
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex justify-space-between align-center">
                <div>
                    <v-btn color="primary" @click="showActivityCreator = true" class="mr-2">
                        <v-icon left>mdi-plus</v-icon>
                        Nueva Actividad
                    </v-btn>

                    <!-- BOTÓN VALIDAR PROCESO -->
                    <v-btn color="warning" @click="validateProcess" :loading="validating">
                        <v-icon left>mdi-check-circle</v-icon>
                        Validar Proceso
                    </v-btn>
                </div>

                <div class="d-flex align-center">
                    <!-- INDICADOR DE ESTADO -->
                    <v-chip :color="processStatus.color" dark class="mr-2">
                        <v-icon left small>{{ processStatus.icon }}</v-icon>
                        {{ processStatus.text }}
                    </v-chip>

                    <v-chip :color="activitiesCount > 0 ? 'green' : 'orange'" dark class="mr-2">
                        {{ activitiesCount }} Actividades
                    </v-chip>

                    <v-btn icon @click="loadActivities" :loading="loading">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
            </v-col>
        </v-row>

        <!-- ALERTA DE ERRORES SI EL PROCESO ES INVÁLIDO -->
        <v-alert v-if="validationErrors.length > 0" type="warning" class="mb-4">
            <strong>Proceso Inválido - Errores encontrados:</strong>
            <ul class="mt-2 mb-0">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
        </v-alert>

        <!-- LISTA DE ACTIVIDADES -->
        <v-data-table :headers="headers" :items="activities" :loading="loading" :items-per-page="10" class="elevation-1"
            loading-text="Cargando actividades..." no-data-text="No hay actividades en este proceso">
            <!-- COLUMNA: TIPO DE ACTIVIDAD -->
            <template v-slot:item.type="{ item }">
                <v-chip small :color="getActivityTypeColor(item.type)" dark>
                    <v-icon small left>{{ getActivityTypeIcon(item.type) }}</v-icon>
                    {{ getActivityTypeText(item.type) }}
                </v-chip>
            </template>

            <!-- COLUMNA: INTERACTIVA -->
            <template v-slot:item.isInteractive="{ item }">
                <v-icon :color="item.isInteractive === 'y' ? 'green' : 'red'">
                    {{ item.isInteractive === 'y' ? 'mdi-account' : 'mdi-robot' }}
                </v-icon>
                <span class="ml-1">{{ item.isInteractive === 'y' ? 'Sí' : 'No' }}</span>
            </template>

            <!-- COLUMNA: AUTO-ROUTED -->
            <template v-slot:item.isAutoRouted="{ item }">
                <v-icon :color="item.isAutoRouted === 'y' ? 'green' : 'orange'">
                    {{ item.isAutoRouted === 'y' ? 'mdi-auto-fix' : 'mdi-hand-pointing-right' }}
                </v-icon>
                <span class="ml-1">{{ item.isAutoRouted === 'y' ? 'Sí' : 'No' }}</span>
            </template>

            <!-- NUEVA COLUMNA: ROLES ASIGNADOS -->
            <template v-slot:item.roles="{ item }">
                <div v-if="item.isInteractive === 'y'">
                    <v-chip v-for="role in getActivityRoles(item)" :key="role.roleId" small color="primary" dark
                        class="mr-1 mb-1">
                        {{ role.name }}
                    </v-chip>
                    <v-btn v-if="item.isInteractive === 'y'" x-small icon @click="assignRolesToActivity(item)"
                        color="primary">
                        <v-icon x-small>mdi-plus</v-icon>
                    </v-btn>
                </div>
                <span v-else class="grey--text">No requiere</span>
            </template>

            <!-- COLUMNA: ACCIONES -->
            <template v-slot:item.actions="{ item }">
                <!-- Botón asignar roles (solo para actividades interactivas) -->
                <v-tooltip bottom v-if="item.isInteractive === 'y'">
                    <template v-slot:activator="{ on }">
                        <v-btn small icon @click="assignRolesToActivity(item)" color="info" v-on="on">
                            <v-icon small>mdi-account-key</v-icon>
                        </v-btn>
                    </template>
                    <span>Asignar roles</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn small icon @click="editActivity(item)" color="primary" v-on="on">
                            <v-icon small>mdi-pencil</v-icon>
                        </v-btn>
                    </template>
                    <span>Editar actividad</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn small icon @click="deleteActivity(item)" color="error" v-on="on">
                            <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                    </template>
                    <span>Eliminar actividad</span>
                </v-tooltip>
            </template>

            <!-- LOADING -->
            <template v-slot:loading>
                <v-row justify="center" align="center" class="py-4">
                    <v-col cols="auto">
                        <v-progress-circular indeterminate color="primary" />
                    </v-col>
                    <v-col cols="auto">
                        <span class="ml-2">Cargando actividades...</span>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>

        <!-- DIALOG CREAR ACTIVIDAD -->
        <ActivityCreator v-model="showActivityCreator" :processId="processId" @activity-created="onActivityCreated" />

        <!-- DIALOG ASIGNAR ROLES A ACTIVIDAD -->
        <ActivityRoleAssigner v-model="showRoleAssigner" :activity="selectedActivity" :processId="processId"
            @roles-updated="onRolesUpdated" />
    </v-card-text>
</template>

<script>
import ActivityCreator from './ActivityCreator.vue'
import ActivityRoleAssigner from './ActivityRoleAssigner.vue'


export default {
    name: 'ActivityManager',
    components: {
        ActivityCreator,ActivityRoleAssigner
    },
    props: {
        processId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            showActivityCreator: false,
            validating: false,

            showRoleAssigner: false,
            selectedActivity: null,

            headers: [
                { text: 'ID', value: 'activityId', width: '80px' },
                { text: 'Nombre', value: 'name' },
                { text: 'Tipo', value: 'type', width: '140px' },
                { text: 'Interactiva', value: 'isInteractive', width: '120px' },
                { text: 'Auto-Routed', value: 'isAutoRouted', width: '120px' },
                { text: 'Roles Asignados', value: 'roles', width: '200px' }, //  NUEVA COLUMNA
                { text: 'Descripción', value: 'description' },
                { text: 'Acciones', value: 'actions', sortable: false, width: '120px' }
            ]
        }
    },
    computed: {
        activities() {
            console.log(this.$store.state.galaxia)
            console.log(this.processId)

            return this.$store.state.galaxia.activities.filter(activity => activity.pId == this.processId)
        },
        activitiesCount() {
            return this.activities.length
        },
        loading() {
            return this.$store.state.galaxia.loading
        },
        currentProcess() {
            return this.$store.getters['galaxia/getProcessById'](this.processId)
        },
        // NUEVO: ESTADO DEL PROCESO
        processStatus() {
            if (!this.currentProcess) {
                return { color: 'grey', icon: 'mdi-help', text: 'Desconocido' }
            }

            if (this.currentProcess.isValid === 'y') {
                return { color: 'green', icon: 'mdi-check-circle', text: 'Válido' }
            } else {
                return { color: 'orange', icon: 'mdi-alert-circle', text: 'Inválido' }
            }
        },

        // NUEVO: VALIDACIÓN DE ERRORES
        validationErrors() {
            const errors = []
            const activities = this.activities
console.log("\n\n", "activities:::", activities,"\n\n")
            // Validar que tenga al menos una actividad de inicio
            const hasStartActivity = activities.some(a => a.type === 'start')
            if (!hasStartActivity) {
                errors.push('El proceso debe tener al menos una actividad de inicio')
            }

            // Validar que tenga al menos una actividad de fin
            const hasEndActivity = activities.some(a => a.type === 'end')
            if (!hasEndActivity) {
                errors.push('El proceso debe tener al menos una actividad de fin')
            }

            // Validar actividades interactivas sin roles
            const interactiveWithoutRoles = activities.filter(
                a => a.isInteractive === 'y' && (!a.ga_gr_roles || a.ga_gr_roles.length === 0)
            )
            if (interactiveWithoutRoles.length > 0) {
                errors.push(`Actividades interactivas sin roles asignados: ${interactiveWithoutRoles.map(a => a.name).join(', ')}`)
            }

            return errors
        }
    },
    methods: {
        getActivityTypeColor(type) {
            const colors = {
                start: 'green',
                end: 'red',
                activity: 'blue',
                switch: 'orange',
                standalone: 'purple',
                split: 'teal',
                join: 'indigo'
            }
            return colors[type] || 'grey'
        },
        getActivityTypeIcon(type) {
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
                standalone: 'Standalone',
                split: 'Split',
                join: 'Join'
            }
            return texts[type] || type
        },
        editActivity(activity) {
            this.$notify(`Editando actividad: ${activity.name}`, 'info')
            // TODO: Implementar edición en Fase 3
        },
        deleteActivity(activity) {
            this.$notify(`Eliminando actividad: ${activity.name}`, 'warning')
            // TODO: Implementar eliminación en Fase 3
        },
        onActivityCreated() {
            this.showActivityCreator = false
            this.loadActivities()
            this.$notify('Actividad creada exitosamente', 'success')
        },
        loadActivities() {
            this.$store.dispatch('galaxia/loadProcessActivities', this.processId)
        },
        // NUEVO: VALIDAR PROCESO
        async validateProcess() {
            this.validating = true
            try {
                // Simular validación - en la siguiente fase haremos validación real con APIs
                if (this.validationErrors.length === 0) {
                    this.$notify('✅ Proceso válido - Listo para activar', 'success')
                    // TODO: Llamar API para marcar proceso como válido
                } else {
                    this.$notify('❌ Proceso inválido - Corrige los errores', 'warning')
                }
            } catch (error) {
                this.$notify('Error validando proceso', 'error')
            } finally {
                this.validating = false
            }
        },

        onActivityCreated() {
            this.showActivityCreator = false
            this.loadActivities()
            this.$notify('Actividad creada exitosamente', 'success')

            // Auto-validar después de crear actividad
            setTimeout(() => {
                this.validateProcess()
            }, 500)
        },
        //asignacion de roles
        assignRolesToActivity(activity) {
            this.selectedActivity = activity
            this.showRoleAssigner = true
        },

        onRolesUpdated() {
            this.showRoleAssigner = false
            this.loadActivities() // Recargar para ver los cambios
            this.$notify('Roles asignados exitosamente', 'success')
        },

        getActivityRoles(activity) {
            // Retornar roles asignados a esta actividad
            return activity.ga_gr_roles || []
        }
    },
    created() {
        this.loadActivities()
    },
    watch: {
        processId: {
            immediate: true,
            handler() {
                this.loadActivities()
            }
        },
        activities: {
            handler() {
                // Auto-validar cuando cambien las actividades
                if (this.activities.length > 0) {
                    this.validateProcess()
                }
            },
            deep: true
        }
    }
}
</script>