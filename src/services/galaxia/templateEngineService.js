// services/galaxia/templateEngine.js
import { http } from "../api";

class TemplateEngine {

    // Renderizar template con datos de instancia
    async renderTemplate(template, instanceData = {}) {
        try {
            const response = await http().post('/galaxia/templates/render', {
                template,
                instanceData
            });
            return response.data;
        } catch (error) {
            console.error('Error rendering template:', error);
            throw error;
        }
    }

    // Validar sintaxis de template
    validateTemplate(template) {
        const errors = [];

        // Validar variables no cerradas
        const openVars = (template.match(/\{\{/g) || []).length;
        const closeVars = (template.match(/\}\}/g) || []).length;
        if (openVars !== closeVars) {
            errors.push('Variables no balanceadas - verificar {{ }}');
        }

        // Validar sintaxis básica
        const invalidSyntax = template.match(/\{\{[^}]*\}[^}]/g);
        if (invalidSyntax) {
            errors.push('Sintaxis de variable inválida');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Extraer variables del template
    extractVariables(template) {
        const variableRegex = /\{\{\s*([^}]+)\s*\}\}/g;
        const variables = new Set();
        let match;

        while ((match = variableRegex.exec(template)) !== null) {
            const varName = match[1].trim();
            // Ignorar pipes de filtros (ej: {{ variable | upper }})
            const cleanVar = varName.split('|')[0].trim();
            if (cleanVar && !cleanVar.startsWith('#') && !cleanVar.startsWith('/')) {
                variables.add(cleanVar);
            }
        }

        return Array.from(variables);
    }

    // Generar formulario dinámico basado en template
    generateFormConfig(template) {
        const variables = this.extractVariables(template);
        const fields = [];

        variables.forEach(variable => {
            const field = this.inferFieldType(variable);
            fields.push(field);
        });

        return fields;
    }

    // Inferir tipo de campo basado en nombre de variable
    inferFieldType(variableName) {
        const name = variableName.toLowerCase();

        const fieldTypes = {
            text: ['nombre', 'name', 'titulo', 'title', 'descripcion', 'description'],
            email: ['email', 'correo', 'mail'],
            number: ['cantidad', 'quantity', 'monto', 'amount', 'precio', 'price'],
            date: ['fecha', 'date', 'fechanacimiento'],
            select: ['estado', 'status', 'tipo', 'type', 'categoria', 'category'],
            textarea: ['comentario', 'comment', 'observacion', 'note', 'descripcion']
        };

        for (const [type, keywords] of Object.entries(fieldTypes)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return {
                    name: variableName,
                    type: type,
                    label: this.formatLabel(variableName),
                    required: true,
                    options: type === 'select' ? this.getDefaultOptions(variableName) : undefined
                };
            }
        }

        // Default a text
        return {
            name: variableName,
            type: 'text',
            label: this.formatLabel(variableName),
            required: false
        };
    }

    formatLabel(variableName) {
        return variableName
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    getDefaultOptions(variableName) {
        const name = variableName.toLowerCase();

        if (name.includes('estado') || name.includes('status')) {
            return [
                { value: 'pending', text: 'Pendiente' },
                { value: 'in_progress', text: 'En Progreso' },
                { value: 'completed', text: 'Completado' }
            ];
        }

        if (name.includes('tipo') || name.includes('type')) {
            return [
                { value: 'normal', text: 'Normal' },
                { value: 'urgent', text: 'Urgente' },
                { value: 'low', text: 'Baja Prioridad' }
            ];
        }

        return [
            { value: 'option1', text: 'Opción 1' },
            { value: 'option2', text: 'Opción 2' },
            { value: 'option3', text: 'Opción 3' }
        ];
    }
}

export const templateEngine = new TemplateEngine();