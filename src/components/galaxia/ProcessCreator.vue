<!-- components/galaxia/ProcessCreator.vue -->
<template>
    <v-dialog v-model="dialog" max-width="600px" persistent>
        <v-card>
            <v-card-title class="headline primary white--text">
                <v-icon left dark>mdi-plus-circle</v-icon>
                Crear Nuevo Proceso
            </v-card-title>

            <v-card-text class="pa-4">
                <v-form ref="form" v-model="valid" lazy-validation>
                    <!-- Nombre del proceso -->
                    <v-text-field v-model="process.name" label="Nombre del Proceso" :rules="nameRules" required outlined
                        class="mb-3" placeholder="Ej: CD Loans Management"></v-text-field>
                    <!-- Descripción -->
                    <v-textarea v-model="process.description" label="Descripción" outlined rows="3" class="mb-3"
                        placeholder="Describe el propósito de este proceso..."></v-textarea>

                    <!-- Versión -->
                    <v-text-field v-model="process.version" label="Versión" outlined class="mb-3" placeholder="1.0"
                        hint="Versión inicial del proceso" persistent-hint></v-text-field>
                    <v-alert type="info" dense class="mt-3">
                        <small>
                            Al crear un proceso, este estará <strong>inactivo</strong> e <strong>inválido</strong>
                            hasta que agregues actividades y roles.
                        </small>
                    </v-alert>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey" text @click="close">
                    Cancelar
                </v-btn>
                <v-btn color="primary" :disabled="!valid || saving" :loading="saving" @click="save">
                    <v-icon left>mdi-content-save</v-icon>
                    {{ saving ? 'Creando...' : 'Crear Proceso' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ProcessCreator',
    props: {
        value: Boolean
    },
    data() {
        return {
            valid: false,
            saving: false,
            process: {
                name: '',
                description: '',
                version: '1.0'
            },
            nameRules: [
                v => !!v || 'El nombre es requerido',
                v => (v && v.length >= 3) || 'El nombre debe tener al menos 3 caracteres'
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
        }
    },
    methods: {
        async save() {
            if (this.$refs.form.validate()) {
                this.saving = true
                try {
                    const result = await this.$store.dispatch('galaxia/createProcess', this.process)

                    if (result.ok) {
                        this.$emit('process-created', result.data)
                        this.close()
                    } else {
                        this.$notify.error('Error al crear el proceso')
                    }
                } catch (error) {
                    console.error('Error creating process:', error)
                    this.$notify.error('Error de conexión al crear proceso')
                } finally {
                    this.saving = false
                }
            }
        },
        close() {
            this.dialog = false
            this.$refs.form.reset()
            this.process = {
                name: '',
                description: '',
                version: '1.0'
            }
        }
    },
    watch: {
        dialog(val) {
            if (!val) {
                this.close()
            }
        }
    }
}
</script>