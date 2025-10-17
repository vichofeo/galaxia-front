<template>
    <v-container>
        <v-card>
            <v-card-title>{{ isEdit ? 'Editar Rol' : 'Crear Rol' }}</v-card-title>
            <v-card-text>
                <v-form ref="roleForm">
                    <v-text-field v-model="form.name" label="Nombre" required
                        :rules="[v => !!v || 'Nombre es requerido']"></v-text-field>
                    <v-textarea v-model="form.description" label="Descripción" rows="3"></v-textarea>
                    <v-select v-model="form.users" :items="availableUsers" label="Usuarios Asignados" multiple
                        chips></v-select>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="saveRole" :disabled="loading">Guardar</v-btn>
                <v-btn @click="$router.back()">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import * as galaxiaService from '@/services/galaxia/galaxiaService';

export default {
    name: 'RoleForm',
    props: {
        processId: [String, Number],
        role: Object
    },
    data() {
        return {
            loading: false,
            isEdit: !!this.role,
            form: {
                name: this.role?.name || '',
                description: this.role?.description || '',
                users: this.role?.mappings?.map(m => m.user) || []
            },
            availableUsers: ['admin', 'user1', 'user2'] // Hardcodeado
        };
    },
    methods: {
        async saveRole() {
            if (!this.$refs.roleForm.validate()) return;
            this.loading = true;
            try {
                let roleId;
                if (this.isEdit) {
                    // Editar rol existente (solo nombre y descripción, mappings se manejan por separado)
                    await galaxiaService.updateRole(this.processId, this.role.role_id, {
                        name: this.form.name,
                        description: this.form.description
                    });
                    roleId = this.role.role_id;
                    this.$emit('success', 'Rol actualizado');
                } else {
                    const roleResult = await galaxiaService.createRole(this.processId, {
                        name: this.form.name,
                        description: this.form.description
                    });
                    roleId = roleResult.data.role_id;
                    this.$emit('success', 'Rol creado');
                }
                // Crear mappings para usuarios seleccionados
                for (const user of this.form.users) {
                    await galaxiaService.createMapping(this.processId, roleId, { user });
                }
                this.$router.push(`/galaxia/processes/${this.processId}`);
            } catch (error) {
                this.$emit('error', 'Error al guardar rol');
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