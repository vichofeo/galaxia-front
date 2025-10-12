<!-- components/galaxia/GenericActivityForm.vue -->
<template>
    <div>
        <v-alert type="warning" class="mb-4">
            Formulario genérico para actividad standalone
        </v-alert>

        <v-form v-model="valid" @submit.prevent="$emit('execute', formData)">
            <v-textarea v-model="formData.notes" label="Notas de ejecución" outlined required></v-textarea>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="$emit('cancel')" :disabled="loading">Cancelar</v-btn>
                <v-btn color="primary" type="submit" :loading="loading" :disabled="!valid">
                    Ejecutar
                </v-btn>
            </v-card-actions>
        </v-form>
    </div>
</template>

<script>
export default {
    name: 'GenericActivityForm',
    props: {
        workitem: Object,
        loading: Boolean
    },
    data() {
        return {
            valid: false,
            formData: {
                notes: ''
            }
        }
    }
}
</script>