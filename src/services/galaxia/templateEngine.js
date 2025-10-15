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
      // Fallback: renderizado local si el API falla
      return this.renderTemplateLocal(template, instanceData);
    }
  }

  // Renderizado local como fallback
  renderTemplateLocal(template, instanceData = {}) {
    let rendered = template;
    
    if (instanceData && typeof instanceData === 'object') {
      Object.keys(instanceData).forEach(key => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        const value = instanceData[key] !== null && instanceData[key] !== undefined 
          ? String(instanceData[key]) 
          : '';
        rendered = rendered.replace(regex, value);
      });
    }

    return {
      rendered: rendered,
      original: template,
      variablesUsed: instanceData ? Object.keys(instanceData) : []
    };
  }

  // Validar sintaxis de template
  validateTemplate(template) {
    const errors = [];
    
    if (typeof template !== 'string') {
      errors.push('Template debe ser texto');
      return { isValid: false, errors };
    }

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

    // Validar variables vacías
    const emptyVars = template.match(/\{\{\s*\}\}/g);
    if (emptyVars) {
      errors.push('Variables vacías detectadas');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Extraer variables del template
  extractVariables(template) {
    if (typeof template !== 'string') return [];
    
    const variableRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    const variables = new Set();
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      const varName = match[1].trim();
      // Ignorar pipes de filtros (ej: {{ variable | upper }})
      const cleanVar = varName.split('|')[0].trim();
      // Ignorar comentarios y bloques de control
      if (cleanVar && 
          !cleanVar.startsWith('#') && 
          !cleanVar.startsWith('/') &&
          !cleanVar.startsWith('if') &&
          !cleanVar.startsWith('else') &&
          !cleanVar.startsWith('endif') &&
          !cleanVar.startsWith('foreach') &&
          !cleanVar.startsWith('endforeach')) {
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
      text: ['nombre', 'name', 'titulo', 'title', 'descripcion', 'description', 'solicitante', 'usuario', 'user', 'proyecto', 'project'],
      email: ['email', 'correo', 'mail'],
      number: ['cantidad', 'quantity', 'monto', 'amount', 'precio', 'price', 'dias', 'days', 'numero', 'number'],
      date: ['fecha', 'date', 'fechanacimiento', 'fechasolicitud', 'requestdate'],
      select: ['estado', 'status', 'tipo', 'type', 'categoria', 'category', 'prioridad', 'priority', 'decision', 'recomendacion'],
      textarea: ['comentario', 'comment', 'observacion', 'note', 'descripcion', 'description', 'justificacion', 'razon']
    };

    for (const [type, keywords] of Object.entries(fieldTypes)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return {
          name: variableName,
          type: type,
          label: this.formatLabel(variableName),
          required: this.isFieldRequired(variableName),
          options: type === 'select' ? this.getDefaultOptions(variableName) : undefined,
          placeholder: this.getPlaceholder(variableName, type)
        };
      }
    }

    // Default a text
    return {
      name: variableName,
      type: 'text',
      label: this.formatLabel(variableName),
      required: false,
      placeholder: `Ingrese ${this.formatLabel(variableName).toLowerCase()}`
    };
  }

  formatLabel(variableName) {
    return variableName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  isFieldRequired(fieldName) {
    const requiredFields = ['nombre', 'name', 'email', 'tipo', 'type', 'estado', 'status'];
    return requiredFields.some(req => fieldName.toLowerCase().includes(req));
  }

  getPlaceholder(fieldName, type) {
    const name = fieldName.toLowerCase();
    
    if (name.includes('nombre') || name.includes('name')) return 'Ej: Juan Pérez';
    if (name.includes('email')) return 'Ej: usuario@empresa.com';
    if (name.includes('monto') || name.includes('amount')) return 'Ej: 1000.00';
    if (name.includes('fecha') || name.includes('date')) return 'Ej: 2024-01-15';
    
    return `Ingrese ${this.formatLabel(fieldName).toLowerCase()}`;
  }

  getDefaultOptions(fieldName) {
    const name = fieldName.toLowerCase();
    
    if (name.includes('estado') || name.includes('status')) {
      return [
        { value: 'pending', text: '🟡 Pendiente' },
        { value: 'in_progress', text: '🔵 En Progreso' },
        { value: 'completed', text: '🟢 Completado' },
        { value: 'cancelled', text: '🔴 Cancelado' }
      ];
    }

    if (name.includes('tipo') || name.includes('type')) {
      return [
        { value: 'normal', text: '⚪ Normal' },
        { value: 'urgent', text: '🔴 Urgente' },
        { value: 'low', text: '🟢 Baja Prioridad' }
      ];
    }

    if (name.includes('prioridad') || name.includes('priority')) {
      return [
        { value: 'low', text: '🟢 Baja' },
        { value: 'medium', text: '🟡 Media' },
        { value: 'high', text: '🔴 Alta' }
      ];
    }

    if (name.includes('decision') || name.includes('recomendacion')) {
      return [
        { value: 'approved', text: '✅ Aprobado' },
        { value: 'rejected', text: '❌ Rechazado' },
        { value: 'pending_review', text: '🟡 Pendiente Revisión' }
      ];
    }

    return [
      { value: 'option1', text: 'Opción 1' },
      { value: 'option2', text: 'Opción 2' },
      { value: 'option3', text: 'Opción 3' }
    ];
  }

  // Generar datos de ejemplo para preview
  generateSampleData(variables) {
    const sampleData = {};
    
    variables.forEach(variable => {
      sampleData[variable] = this.getSampleValue(variable);
    });
    
    return sampleData;
  }

  getSampleValue(variable) {
    const name = variable.toLowerCase();
    
    if (name.includes('nombre') || name.includes('name')) return 'María González';
    if (name.includes('email')) return 'maria.gonzalez@empresa.com';
    if (name.includes('fecha') || name.includes('date')) return '2024-01-20';
    if (name.includes('cantidad') || name.includes('amount')) return '1500';
    if (name.includes('dias') || name.includes('days')) return '7';
    if (name.includes('estado') || name.includes('status')) return 'pending';
    if (name.includes('tipo') || name.includes('type')) return 'normal';
    if (name.includes('prioridad') || name.includes('priority')) return 'medium';
    if (name.includes('decision')) return 'approved';
    if (name.includes('proyecto') || name.includes('project')) return 'Proyecto Alpha';
    if (name.includes('cdtitle')) return 'The Dark Side of the Moon';
    if (name.includes('username')) return 'Carlos López';
    if (name.includes('daysrequested')) return '5';
    
    return `Valor de ${variable}`;
  }

  // Sanitizar template (prevenir XSS básico)
  sanitizeTemplate(template) {
    if (typeof template !== 'string') return '';
    
    // Remover scripts potencialmente peligrosos
    return template
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/javascript:/gi, '');
  }

  // Convertir template a HTML seguro para display
  templateToHtml(template) {
    const sanitized = this.sanitizeTemplate(template);
    return sanitized
      .replace(/\{\{/g, '<span class="template-var">{{')
      .replace(/\}\}/g, '}}</span>')
      .replace(/\n/g, '<br>');
  }
}

// Exportar instancia única
export const templateEngine = new TemplateEngine();

// Exportar clase también por si se necesita extender
export { TemplateEngine };