<!-- components/galaxia/ActivityCreator.vue -->
<template>
    <v-dialog v-model="dialog" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline primary white--text">
                <v-icon left dark>mdi-plus-circle</v-icon>
                Crear Nueva Actividad
            </v-card-title>

            <v-card-text class="pa-4">
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <!-- NOMBRE Y TIPO -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="activity.name" label="Nombre de la Actividad *" :rules="nameRules"
                                required outlined placeholder="Ej: Request Loan"></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select v-model="activity.type" label="Tipo de Actividad *" :items="activityTypes"
                                :rules="[v => !!v || 'Tipo es requerido']" required outlined item-text="text"
                                item-value="value"></v-select>
                        </v-col>
                    </v-row>

                    <!-- DESCRIPCIÓN -->
                    <v-textarea v-model="activity.description" label="Descripción" outlined rows="2"
                        placeholder="Describe el propósito de esta actividad..." class="mb-4"></v-textarea>

                    <!-- CONFIGURACIONES -->
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card outlined class="pa-3">
                                <v-card-title class="subtitle-1">Configuración de Interactividad</v-card-title>
                                <v-card-text>
                                    <v-radio-group v-model="activity.isInteractive" row>
                                        <v-radio value="y" color="primary">
                                            <template v-slot:label>
                                                <div>
                                                    <v-icon small color="green" class="mr-1">mdi-account</v-icon>
                                                    <strong>Interactiva</strong>
                                                    <div class="caption">Requiere intervención del usuario</div>
                                                </div>
                                            </template>
                                        </v-radio>
                                        <v-radio value="n" color="primary">
                                            <template v-slot:label>
                                                <div>
                                                    <v-icon small color="red" class="mr-1">mdi-robot</v-icon>
                                                    <strong>Automática</strong>
                                                    <div class="caption">Se ejecuta sin intervención</div>
                                                </div>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-card outlined class="pa-3">
                                <v-card-title class="subtitle-1">Configuración de Routing</v-card-title>
                                <v-card-text>
                                    <v-radio-group v-model="activity.isAutoRouted" row>
                                        <v-radio value="y" color="primary">
                                            <template v-slot:label>
                                                <div>
                                                    <v-icon small color="green" class="mr-1">mdi-auto-fix</v-icon>
                                                    <strong>Auto-Routed</strong>
                                                    <div class="caption">Flujo automático a siguiente actividad</div>
                                                </div>
                                            </template>
                                        </v-radio>
                                        <v-radio value="n" color="primary">
                                            <template v-slot:label>
                                                <div>
                                                    <v-icon small color="orange"
                                                        class="mr-1">mdi-hand-pointing-right</v-icon>
                                                    <strong>Manual</strong>
                                                    <div class="caption">Usuario decide siguiente actividad</div>
                                                </div>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- INFORMACIÓN ADICIONAL SEGÚN TIPO -->
                    <v-alert v-if="activity.type === 'start'" type="info" dense class="mt-3">
                        <strong>Actividad de Inicio:</strong> Es el punto de entrada del proceso.
                        Los usuarios pueden iniciar nuevas instancias desde esta actividad.
                    </v-alert>

                    <v-alert v-if="activity.type === 'end'" type="info" dense class="mt-3">
                        <strong>Actividad de Fin:</strong> Termina la instancia del proceso.
                        Todas las rutas deben llevar eventualmente a una actividad de fin.
                    </v-alert>

                    <v-alert v-if="activity.type === 'switch'" type="info" dense class="mt-3">
                        <strong>Actividad Switch:</strong> Permite bifurcar el flujo basado en condiciones.
                        Deberás programar la lógica de decisión en el código de la actividad.
                    </v-alert>

                    <v-alert v-if="activity.type === 'standalone'" type="info" dense class="mt-3">
                        <strong>Actividad Standalone:</strong> Puede ejecutarse sin una instancia activa.
                        Útil para funciones independientes como listados o reportes.
                    </v-alert>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey" text @click="close" :disabled="saving">
                    Cancelar
                </v-btn>
                <v-btn color="primary" :disabled="!valid || saving" :loading="saving" @click="save">
                    <v-icon left>mdi-content-save</v-icon>
                    {{ saving ? 'Creando...' : 'Crear Actividad' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ActivityCreator',
    props: {
        value: Boolean,
        processId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            valid: false,
            saving: false,
            activity: {
                name: '',
                type: 'activity',
                description: '',
                isInteractive: 'y',
                isAutoRouted: 'n',
                flowNum: 0
            },
            activityTypes: [
                { text: 'Actividad Normal', value: 'activity' },
                { text: 'Actividad de Inicio', value: 'start' },
                { text: 'Actividad de Fin', value: 'end' },
                { text: 'Actividad Switch', value: 'switch' },
                { text: 'Actividad Standalone', value: 'standalone' },
                { text: 'Split', value: 'split' },
                { text: 'Join', value: 'join' }
            ],
            nameRules: [
                v => !!v || 'El nombre es requerido',
                v => (v && v.length >= 3) || 'El nombre debe tener al menos 3 caracteres',
                v => (v && v.length <= 80) || 'El nombre no puede tener más de 80 caracteres'
            ]
        }
    },
    computed: {
        dialog: {
            get() {
                return this.value
            },
            set(value) {
                this.$emit('input', value)
            }
        },
        typeSpecificRules() {
            const rules = {}

            if (this.activity.type === 'start') {
                rules.isAutoRouted = 'y' // Start activities should typically be auto-routed
            }

            if (this.activity.type === 'end') {
                rules.isInteractive = 'n' // End activities are usually automatic
                rules.isAutoRouted = 'y'
            }

            return rules
        }
    },
    methods: {
        async save() {
            console.log('Activities state:', this.$store.state.galaxia.activities)
            console.log('Is array?', Array.isArray(this.$store.state.galaxia.activities))
            if (this.$refs.form.validate()) {
                this.saving = true
                try {
                    const result = await this.$store.dispatch('galaxia/addActivity', {
                        processId: this.processId,
                        activityData: {
                            ...this.activity,
                            lastModif: Math.floor(Date.now() / 1000),
                            normalized_name: this.activity.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
                        }
                    })

                    if (result.ok) {
                        this.$emit('activity-created', result.data)
                        this.close()
                    } else {
                        this.$notify('Error al crear la actividad', 'error')
                    }
                } catch (error) {
                    console.error('Error creating activity:', error)
                    this.$notify('Error de conexión al crear actividad', 'error')
                } finally {
                    this.saving = false
                }
            }
        },
        close() {
            this.dialog = false
            this.resetForm()
        },
        resetForm() {
            this.activity = {
                name: '',
                type: 'activity',
                description: '',
                isInteractive: 'y',
                isAutoRouted: 'n',
                flowNum: 0
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation()
            }
        }
    },
    watch: {
        dialog(val) {
            if (!val) {
                this.resetForm()
            }
        },
        // NUEVO: AUTO-AJUSTAR CONFIGURACIONES SEGÚN TIPO
        'activity.type': {
            handler(newType) {
                if (newType === 'start') {
                    this.activity.isAutoRouted = 'y'
                } else if (newType === 'end') {
                    this.activity.isInteractive = 'n'
                    this.activity.isAutoRouted = 'y'
                } else if (newType === 'switch') {
                    this.activity.isInteractive = 'y'
                    this.activity.isAutoRouted = 'n'
                }
            },
            immediate: true
        }
    }
}
</script>