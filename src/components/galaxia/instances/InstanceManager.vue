<template>
    <v-container fluid>
        <!-- Header -->
        <v-row class="mb-6">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="primary white--text">
                        <v-icon left>mdi-play-circle-outline</v-icon>
                        Gestor de Instancias
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-row align="center">
                            <v-col cols="12" md="6">
                                <v-btn color="primary" @click="showCreateDialog = true"
                                    :disabled="!availableProcesses.length">
                                    <v-icon left>mdi-plus</v-icon>
                                    Nueva Instancia
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar instancias..."
                                    single-line hide-details clearable></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Filtros -->
        <v-row class="mb-4">
            <v-col cols="12" md="4">
                <v-select v-model="filters.processId" :items="availableProcesses" item-text="name" item-value="pId"
                    label="Filtrar por proceso" clearable hide-details></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="filters.status" :items="statusOptions" label="Filtrar por estado" clearable
                    hide-details></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-btn @click="loadInstances" color="secondary" class="mr-2">
                    <v-icon left>mdi-refresh</v-icon>
                    Actualizar
                </v-btn>
                <v-btn @click="clearFilters" text>
                    Limpiar Filtros
                </v-btn>
            </v-col>
        </v-row>

        <!-- Lista de Instancias -->
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>
                        Mis Instancias ({{ filteredInstances.length }})
                    </v-card-title>
                    <v-card-text>
                        <v-data-table :headers="headers" :items="filteredInstances" :search="search" :loading="loading"
                            :items-per-page="10" class="elevation-1">

                            <template v-slot:item.instanceId="{ item }">
                                <strong>#{{ item.instanceId }}</strong>
                            </template>

                            <template v-slot:item.name="{ item }">
                                <div class="font-weight-medium">{{ item.name }}</div>
                                <div class="caption text--secondary">PID: {{ item.pId }}</div>
                            </template>

                            <template v-slot:item.owner="{ item }">
                                <v-chip x-small color="grey lighten-2">
                                    {{ item.owner || 'Sin propietario' }}
                                </v-chip>
                            </template>

                            <template v-slot:item.status="{ item }">
                                <v-chip :color="getStatusColor(item.status)" small>
                                    {{ getStatusText(item.status) }}
                                </v-chip>
                            </template>

                            <template v-slot:item.nextActivity="{ item }">
                                <div v-if="item.nextActivity">
                                    <v-icon small color="blue" class="mr-1">mdi-arrow-right</v-icon>
                                    <span class="caption">Actividad {{ item.nextActivity }}</span>
                                </div>
                                <div v-else class="text--secondary caption">
                                    Sin siguiente actividad
                                </div>
                            </template>

                            <template v-slot:item.pendingWorkitems="{ item }">
                                <v-badge :content="getPendingWorkitemsCount(item)"
                                    :color="getPendingWorkitemsCount(item) > 0 ? 'red' : 'grey'" overlap>
                                    <v-icon small>mdi-format-list-checks</v-icon>
                                </v-badge>
                            </template>

                            <template v-slot:item.started="{ item }">
                                {{ formatDate(item.started) }}
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon small @click="viewInstance(item)" v-on="on" color="primary">
                                            <v-icon small>mdi-eye</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Ver Detalle</span>
                                </v-tooltip>

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon small @click="executeInstance(item)" v-on="on" color="success"
                                            :disabled="!hasPendingWorkitems(item)"
                                            :loading="checkingWorkitems[item.id]">
                                            <v-icon small>mdi-play</v-icon>
                                        </v-btn>
                                    </template>
                                    <span v-if="hasPendingWorkitems(item)">Continuar Ejecución</span>
                                    <span v-else>No hay tareas pendientes</span>
                                </v-tooltip>
                            </template>

                            <template v-slot:no-data>
                                <div class="text-center py-4">
                                    <v-icon size="64" class="mb-4">mdi-inbox-outline</v-icon>
                                    <div>No hay instancias creadas</div>
                                    <v-btn class="mt-2" color="primary" @click="showCreateDialog = true">
                                        Crear Primera Instancia
                                    </v-btn>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Dialog Crear Instancia -->
        <v-dialog v-model="showCreateDialog" max-width="600px">
            <v-card>
                <v-card-title class="primary white--text">
                    <v-icon left>mdi-plus-circle</v-icon>
                    Crear Nueva Instancia
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-form ref="createForm" v-model="valid">
                        <v-select v-model="newInstance.processId" :items="availableProcesses" item-text="name"
                            item-value="pId" label="Seleccionar Proceso" :rules="[v => !!v || 'Proceso requerido']"
                            required></v-select>

                        <v-textarea v-model="newInstance.notes" label="Notas (opcional)" rows="2"
                            placeholder="Agregar descripción o comentarios sobre esta instancia..."></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showCreateDialog = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="createInstance" :disabled="!valid" :loading="creating">
                        Crear Instancia
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog Seleccionar Workitem -->
        <v-dialog v-model="showWorkitemDialog" max-width="500px">
            <v-card>
                <v-card-title class="primary white--text">
                    <v-icon left>mdi-format-list-checks</v-icon>
                    Seleccionar Tarea
                </v-card-title>
                <v-card-text class="pa-4">
                    <div class="subtitle-1 mb-2">Instancia: <strong>{{ selectedInstance?.process?.name }}</strong></div>
                    <div class="caption mb-4">Selecciona la tarea que deseas ejecutar:</div>

                    <v-list>
                        <v-list-item v-for="workitem in availableWorkitems" :key="workitem.id"
                            @click="selectWorkitem(workitem)" class="mb-2">
                            <v-list-item-icon>
                                <v-icon :color="getActivityColor(workitem.gw_ga_activity)">
                                    {{ getActivityIcon(workitem.gw_ga_activity.type) }}
                                </v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ workitem.gw_ga_activity.name }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ workitem.gw_ga_activity.type }} •
                                    <v-chip x-small>{{ workitem.status }}</v-chip>
                                </v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn icon color="primary">
                                    <v-icon>mdi-arrow-right</v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showWorkitemDialog = false">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import * as srv from '@/services/galaxia/instancesService';
import { galaxiaService } from '@/services/galaxia/galaxiaService'
import * as wisrv from '@/services/galaxia/uiWorkItemService'
export default {
    name: 'InstanceManager',
    data() {
        return {
            loading: false,
            creating: false,
            showCreateDialog: false,
            showWorkitemDialog: false,
            valid: false,
            search: '',
            instances: [],
            availableProcesses: [],
            availableWorkitems: [],
            selectedInstance: null,
            checkingWorkitems: {},
            instancesWorkitems: {}, // Cache de workitems por instancia
            filters: {
                processId: null,
                status: null
            },
            newInstance: {
                processId: null,
                notes: ''
            },
            statusOptions: [
                { text: 'Activo', value: 'active' },
                { text: 'Completado', value: 'completed' },
                { text: 'Abortado', value: 'aborted' }
            ],
            headers: [
                { text: 'ID', value: 'instanceId', sortable: true, width: '80' },
                { text: 'Proceso', value: 'gi_gp_process.name', sortable: true },
                { text: 'Nombre', value: 'name', sortable: true },
                { text: 'Propietario', value: 'owner', sortable: true },
                { text: 'Estado', value: 'status', sortable: true },
                { text: 'Siguiente Actividad', value: 'nextActivity', sortable: false, width: '150' },
                { text: 'Tareas', value: 'pendingWorkitems', sortable: false, align: 'center', width: '80' },
                { text: 'Iniciada', value: 'started', sortable: true, width: '120' },
                { text: 'Acciones', value: 'actions', sortable: false, align: 'center', width: '120' }
            ]
        }
    },

    computed: {
        filteredInstances() {
            let filtered = this.instances;

            if (this.filters.processId) {
                filtered = filtered.filter(i => i.processId === this.filters.processId);
            }

            if (this.filters.status) {
                filtered = filtered.filter(i => i.status === this.filters.status);
            }

            return filtered;
        }
    },

    async mounted() {
        await this.loadInstances();
        await this.loadAvailableProcesses();
    },

    methods: {
        async loadInstances() {
            this.loading = true;
            try {
                // TODO: Reemplazar con usuario real del sistema
                const userId = 'admin'; // Temporal - integrar con tu auth system
                const params = { userId }
                const response = await srv.getListGInstances(params)
                /*await this.$axios.get('/api/instances', {
                    params: { userId }
                });*/
                this.instances = response.data;

                // Precargar workitems para cada instancia
                await this.preloadInstancesWorkitems();
                
            } catch (error) {
                console.error('Error loading instances:', error);
                this.$notify('Error al cargar instancias', 'error')

            } finally {
                this.loading = false;
            }
        },

        async preloadInstancesWorkitems() {
            for (const instance of this.instances) {
                if (instance.status === 'active') {
                    await this.loadInstanceWorkitems(instance.instanceId);
                }
            }
        },

        async loadAvailableProcesses() {
            try {
                const response = await galaxiaService.getProcesses({ status: 'active' })
                /*await this.$axios.get('/api/processes', {
                    params: { status: 'active' }
                });*/
                this.availableProcesses = response.data;
            } catch (error) {
                console.error('Error loading processes:', error);
            }
        },

        async createInstance() {
            this.creating = true;
            try {
                // TODO: Reemplazar con usuario real del sistema
                const userId = 'admin'; // Temporal - integrar con tu auth system

                const instanceData = {
                    processId: this.newInstance.processId,
                    owner: userId,
                    initialData: {
                        notes: this.newInstance.notes,
                        createdAt: new Date().toISOString()
                    }
                };

                const response = await srv.createGInstance(instanceData);
                //await this.$axios.post('/api/instances', instanceData);

                this.$notify('Instancia creada exitosamente', 'success')


                this.showCreateDialog = false;
                this.resetCreateForm();
                await this.loadInstances();

                // Navegar a la nueva instancia
                this.viewInstance(response.data);

            } catch (error) {
                console.error('Error creating instance:', error);
                this.$notify('Error al crear instancia: ' + error.response?.data?.error || error.message, 'error')

            } finally {
                this.creating = false;
            }
        },

        async executeInstance(instance) {
            this.$set(this.checkingWorkitems, instance.instanceId, true);

            try {
                
                // 1. Obtener workitems pendientes para esta instancia
                const workitems = await this.loadInstanceWorkitems(instance.instanceId)
console.log("######### work item navigatde", workitems)
                if (workitems.length === 0) {
                    this.$notify('No hay tareas pendientes para esta instancia', 'warning')

                    return;
                }

                // 2. Si solo hay un workitem, ir directamente
                
                if (workitems.length === 1) {
                    this.navigateToActivityExecutor(instance.id, workitems[0].itemId);
                    return;
                }

                // 3. Si hay múltiples workitems, mostrar selector
                this.showWorkitemSelector(instance, workitems);

            } catch (error) {
                console.error('Error getting workitems:', error);
                this.$notify('Error al obtener tareas pendientes', 'error')

            } finally {
                this.$set(this.checkingWorkitems, instance.instanceId, false); // ¡CORREGIDO!
            }
        },

        async loadInstanceWorkitems(instanceId) {
            try {
                // TODO: Reemplazar con llamada real a tu API de workitems
                // Por ahora mock data basada en el proceso CD Loans
                const mockWorkitems = [
                    {
                        itemId: `${instanceId}-workitem-1`, // Según tu modelo
                        instanceId: instanceId,
                        activityId: 1,
                        activity: {
                            activityId: 1, // Según tu modelo
                            name: 'Request Loan',
                            type: 'start',
                            isInteractive: true
                        },
                        status: 'pending',
                        user: 'admin', // Según tu modelo (no assignedTo)
                        grabbed: 0 // Según tu modelo
                    }
                ];
                const user_id = 'admin'
                const params = { status: 'pending', userId: user_id }
                const result = await wisrv.getInstanceWorkitems(instanceId, params)
                //await wisrv.getWorkitemUsr(user_id, {})
                const workitem =  result.data
                //await wisrv.getInstanceWorkitems(instanceId, params)

                //this.$set(this.instancesWorkitems, instanceId, mockWorkitems);
                this.$set(this.instancesWorkitems, instanceId, workitem);
                return workitem
            } catch (error) {
                console.error('Error loading workitems:', error);
                return [];
            }
        },

        showWorkitemSelector(instance, workitems) {
            this.selectedInstance = instance;
            this.availableWorkitems = workitems;
            this.showWorkitemDialog = true;
        },

        selectWorkitem(workitem) {
            this.navigateToActivityExecutor(this.selectedInstance.instanceId, workitem.itemId);
            this.showWorkitemDialog = false;
        },

        navigateToActivityExecutor(instanceId, workitemId) {
            this.$router.push({
                name: 'ActivityExecutor',
                params: {
                    instanceId: instanceId,
                    workitemId: workitemId // itemId según tu modelo
                }
            });
        },

        viewInstance(instance) {
            this.$router.push({
                name: 'InstanceDetail',
                params: { id: instance.instanceId } // ¡CORREGIDO!
            });
        },

        getCurrentActivity(instance) {
            
            const workitems = this.instancesWorkitems[instance.instanceId];
            if (workitems && workitems.length > 0) {
                const pendingWorkitem = workitems.find(w => w.status === 'pending');
                return pendingWorkitem ? pendingWorkitem.activity : null;
            }
            return null;
        },

        getPendingWorkitemsCount(instance) {
            //console.log("this.instancesWorkitems:", this.instancesWorkitems)
            const workitems = this.instancesWorkitems[instance.instanceId]; // ¡CORREGIDO!
            return workitems ? workitems.filter(w => w.status === 'pending').length : 0;
        },

        hasPendingWorkitems(instance) {
            return this.getPendingWorkitemsCount(instance) > 0;
        },

        getStatusColor(status) {
            const colors = {
                active: 'green',
                completed: 'blue',
                aborted: 'red',
                exception: 'orange'
            };
            return colors[status] || 'grey';
        },

        getStatusText(status) {
            const texts = {
                active: 'Activo',
                completed: 'Completado',
                aborted: 'Abortado',
                exception: 'Excepción'
            };
            return texts[status] || status;
        },

        getActivityColor(activity) {
            if (!activity) return 'grey';

            const colors = {
                start: 'green',
                end: 'red',
                switch: 'orange',
                standalone: 'purple',
                activity: 'blue'
            };
            return colors[activity.type] || 'blue';
        },

        getActivityIcon(type) {
            const icons = {
                start: 'mdi-play',
                end: 'mdi-stop',
                activity: 'mdi-cog',
                switch: 'mdi-swap-horizontal',
                standalone: 'mdi-star'
            };
            return icons[type] || 'mdi-circle';
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

        clearFilters() {
            this.filters.processId = null;
            this.filters.status = null;
            this.search = '';
        },

        resetCreateForm() {
            this.newInstance = {
                processId: null,
                notes: ''
            };
            this.$refs.createForm?.reset();
        }
    }
}
</script>

<style scoped>
.v-data-table>>>tbody tr:hover {
    background-color: #f5f5f5 !important;
    cursor: pointer;
}
</style>