const { AppError } = require('./errors');

const CLASES = ['Guerrero', 'Mago', 'Pícaro', 'Paladín', 'Cazador'];
const EQUIPMENT_SLOT_KEYS = ['pecho', 'casco', 'pantalon', 'botas', 'arma', 'arma-secundaria'];
const SLOT_COUNT = 48;

const TYPES = {
    string: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' && Number.isFinite(value),
    integer: (value) => Number.isInteger(value),
    boolean: (value) => typeof value === 'boolean' || value === 0 || value === 1,
};

function validateBody(body, rules, mode = 'update') {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new AppError(400, 'El cuerpo de la petición debe ser un objeto');
    }

    const cleaned = {};
    for (const [field, rule] of Object.entries(rules)) {
        const value = body[field];
        if (value === undefined) {
            if (mode === 'create' && rule.required) {
                throw new AppError(400, `El campo '${field}' es requerido`);
            }
            continue;
        }

        if (rule.type && !TYPES[rule.type](value)) {
            throw new AppError(400, `El campo '${field}' tiene un tipo inválido`);
        }
        if (typeof value === 'number') {
            const min = rule.min;
            const max = rule.max;
            if (min !== undefined && value < min) {
                throw new AppError(400, `El campo '${field}' no puede ser menor que ${min}`);
            }
            if (max !== undefined && value > max) {
                throw new AppError(400, `El campo '${field}' no puede ser mayor que ${max}`);
            }
        }
        if (typeof value === 'string' && rule.maxLength !== undefined && value.length > rule.maxLength) {
            throw new AppError(400, `El campo '${field}' supera los ${rule.maxLength} caracteres`);
        }
        if (rule.enum && !rule.enum.includes(value)) {
            throw new AppError(400, `El campo '${field}' no es válido`);
        }

        cleaned[field] = value;
    }

    if (Object.keys(cleaned).length === 0) {
        throw new AppError(400, 'No hay campos válidos para guardar');
    }
    return cleaned;
}

function expectIntParam(value, field, { min = 0, max = undefined } = {}) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || (min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
        throw new AppError(400, `El parámetro '${field}' no es válido`);
    }
    return parsed;
}

function expectEquipmentSlot(value) {
    if (!EQUIPMENT_SLOT_KEYS.includes(value)) {
        throw new AppError(400, `La ranura de equipamiento '${value}' no es válida`);
    }
    return value;
}

function validateInventoryItems(items) {
    if (!Array.isArray(items)) {
        throw new AppError(400, 'El campo items debe ser un arreglo');
    }
    if (items.length > SLOT_COUNT) {
        throw new AppError(400, `El inventario no puede superar los ${SLOT_COUNT} huecos`);
    }
    return items.map((item) => {
        if (!item || typeof item !== 'object' || item.itemKey === undefined) return null;
        const quantity = Number(item.quantity);
        if (typeof item.itemKey !== 'string' || item.itemKey.length === 0 || item.itemKey.length > 60) {
            return null;
        }
        if (!Number.isInteger(quantity) || quantity < 1) return null;
        return { ...item, quantity };
    });
}

module.exports = { validateBody, expectIntParam, expectEquipmentSlot, validateInventoryItems, CLASES, SLOT_COUNT };