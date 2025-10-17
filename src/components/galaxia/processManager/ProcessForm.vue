<template>
    <v-container>
        <v-card>
            <v-card-title>{{ isEdit ? 'Editar Proceso' : 'Crear Proceso' }}</v-card-title>
            <v-card-text>
                <v-form ref="processForm">
                    <v-text-field v-model="form.name" label="Nombre" required
                        :rules="[v => !!v || 'Nombre es requerido']"></v-text-field>
                    <v-textarea v-model="form.description" label="Descripción" rows="3"></v-textarea>
                    <v-text-field v-model="form.version" label="Versión" required
                        :rules="[v => !!v || 'Versión es requerida']"></v-text-field>
                    <v-checkbox v-model="form.is_active" label="Activo" :true-value="'y'"
                        :false-value="'n'"></v-checkbox>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="saveProcess" :disabled="loading">Guardar</v-btn>
                <v-btn @click="$router.back()">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import * as galaxiaService from '@/services/galaxia/galaxiaService';

export default {
    name: 'ProcessForm',
    props: {
        process: Object
    },
    data() {
        return {
            loading: false,
            isEdit: !!this.process,
            form: {
                name: this.process?.name || '',
                description: this.process?.description || '',
                version: this.process?.version || '1.0',
                is_active: this.process?.is_active || 'y'
            }
        };
    },
    methods: {
        async saveProcess() {
            if (!this.$refs.processForm.validate()) return;
            this.loading = true;
            try {
                if (this.isEdit) {
                    await galaxiaService.updateProcess(this.process.p_id, this.form);
                    this.$emit('success', 'Proceso actualizado');
                } else {
                    await galaxiaService.createProcess(this.form);
                    this.$emit('success', 'Proceso creado');
                }
                this.$router.push('/galaxia/processes');
            } catch (error) {
                this.$emit('error', 'Error al guardar proceso');
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.v-container {
    padding: 16px;
}
</style>