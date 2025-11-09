// Forms Component for dynamic form generation and validation

class FormComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            validation: true,
            submitButton: true,
            cancelButton: true,
            ...options
        };
        this.fields = [];
        this.data = {};
    }

    init(fields = [], data = {}) {
        this.fields = fields;
        this.data = data;
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (!this.container) return;

        let formHTML = '<form class="dynamic-form">';
        
        this.fields.forEach(field => {
            formHTML += this.renderField(field);
        });

        if (this.options.submitButton || this.options.cancelButton) {
            formHTML += '<div class="form-actions">';
            if (this.options.cancelButton) {
                formHTML += '<button type="button" class="btn btn-secondary" id="formCancel">Cancel</button>';
            }
            if (this.options.submitButton) {
                formHTML += '<button type="submit" class="btn btn-primary" id="formSubmit">Save</button>';
            }
            formHTML += '</div>';
        }

        formHTML += '</form>';
        this.container.innerHTML = formHTML;
    }

    renderField(field) {
        const { name, label, type = 'text', required = false, options = [], value = '' } = field;
        let fieldHTML = `<div class="form-group">`;
        fieldHTML += `<label for="${name}">${label}${required ? ' <span class="required">*</span>' : ''}</label>`;

        switch (type) {
            case 'select':
                fieldHTML += `<select id="${name}" name="${name}" ${required ? 'required' : ''}>`;
                options.forEach(opt => {
                    fieldHTML += `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`;
                });
                fieldHTML += `</select>`;
                break;
            case 'textarea':
                fieldHTML += `<textarea id="${name}" name="${name}" ${required ? 'required' : ''}>${value}</textarea>`;
                break;
            case 'checkbox':
                fieldHTML += `<input type="checkbox" id="${name}" name="${name}" ${value ? 'checked' : ''}>`;
                break;
            default:
                fieldHTML += `<input type="${type}" id="${name}" name="${name}" value="${value}" ${required ? 'required' : ''}>`;
        }

        fieldHTML += `</div>`;
        return fieldHTML;
    }

    attachEventListeners() {
        const form = this.container.querySelector('.dynamic-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.options.validation && !this.validate()) {
                return;
            }
            
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            if (this.options.onSubmit) {
                this.options.onSubmit(data);
            }
        });

        const cancelBtn = this.container.querySelector('#formCancel');
        if (cancelBtn && this.options.onCancel) {
            cancelBtn.addEventListener('click', this.options.onCancel);
        }
    }

    validate() {
        let isValid = true;
        const form = this.container.querySelector('.dynamic-form');
        
        this.fields.forEach(field => {
            if (field.required) {
                const input = form.querySelector(`[name="${field.name}"]`);
                if (!input || !input.value.trim()) {
                    this.showError(field.name, `${field.label} is required`);
                    isValid = false;
                } else {
                    this.clearError(field.name);
                }
            }
        });

        return isValid;
    }

    showError(fieldName, message) {
        const field = this.container.querySelector(`[name="${field.name}"]`);
        if (field) {
            field.classList.add('error');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = message;
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                field.parentElement.appendChild(errorDiv);
            }
        }
    }

    clearError(fieldName) {
        const field = this.container.querySelector(`[name="${field.name}"]`);
        if (field) {
            field.classList.remove('error');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    getData() {
        const form = this.container.querySelector('.dynamic-form');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    setData(data) {
        const form = this.container.querySelector('.dynamic-form');
        if (!form) return;

        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }
}

// Export for use in other files
window.FormComponent = FormComponent;