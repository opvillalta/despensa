// Textos de UI centralizados en español (Rioplatense)
// NUNCA hardcodear strings en componentes — importar desde acá

export const es = {
  // App
  app: {
    name: 'Mi Despensa',
  },

  // Navegación
  nav: {
    home: 'Inicio',
    inventory: 'Inventario',
    shopping: 'Compras',
    settings: 'Ajustes',
  },

  // Auth
  auth: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    loginTitle: 'Bienvenido',
    loginSubtitle: 'Iniciá sesión para ver tu despensa',
    registerTitle: 'Crear cuenta',
    registerSubtitle: 'Registrate para empezar a controlar tu despensa',
    noAccount: '¿No tenés cuenta?',
    hasAccount: '¿Ya tenés cuenta?',
    errors: {
      invalidCredentials: 'Correo o contraseña incorrectos',
      emailInUse: 'Este correo ya está registrado',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
      generic: 'Ocurrió un error. Intentá de nuevo.',
    },
  },

  // Estados de vencimiento
  expiry: {
    ok: 'Bien',
    soon: 'Vence pronto',
    expired: 'Vencido',
    none: 'Sin fecha',
  },

  // Tracking types
  tracking: {
    units: 'Unidades',
    level: 'Nivel',
    presence: 'Presencia',
  },

  // Niveles
  levels: {
    full: 'Lleno',
    half: 'Mitad',
    low: 'Poco',
    empty: 'Vacío',
  },

  // Presencia
  presence: {
    has: 'Tengo',
    hasNot: 'No tengo',
  },

  // Pantalla de Inicio
  home: {
    expiringSoon: 'Vence pronto',
    runningLow: 'Se está acabando',
    noExpiringSoon: 'Todo está en buen estado',
    noRunningLow: 'El stock está al día',
    addItem: '+ Agregar',
  },

  // Inventario
  inventory: {
    title: 'Inventario',
    search: 'Buscar producto…',
    filterLocation: 'Ubicación',
    filterCategory: 'Categoría',
    filterStatus: 'Estado',
    all: 'Todos',
    empty: 'No hay productos en el inventario',
    emptyFiltered: 'No se encontraron productos con esos filtros',
  },

  // Formulario de producto
  form: {
    addTitle: 'Agregar producto',
    editTitle: 'Editar producto',
    name: 'Nombre del producto',
    namePlaceholder: 'Ej: Leche, Arroz, Aceite…',
    location: 'Ubicación',
    expiryDate: 'Fecha de vencimiento',
    quantity: 'Cantidad',
    level: 'Nivel',
    advanced: 'Opciones avanzadas',
    purchasedAt: 'Fecha de compra',
    openedAt: 'Fecha de apertura',
    daysAfterOpening: 'Días de vida útil al abrir',
    category: 'Categoría',
    notes: 'Notas',
    save: 'Guardar',
    cancel: 'Cancelar',
    markOpened: 'Marcar como abierto',
    errors: {
      nameRequired: 'El nombre es obligatorio',
      locationRequired: 'La ubicación es obligatoria',
    },
  },

  // Detalle del ítem
  detail: {
    markOpened: 'Marcar como abierto',
    markConsumed: 'Consumido',
    markDiscarded: 'Desechado',
    openedOn: 'Abierto el',
    purchasedOn: 'Comprado el',
    expiresOn: 'Vence el',
    confirmConsumed: '¿Marcar como consumido?',
    confirmDiscarded: '¿Desecharlo? Se registrará como desperdicio.',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },

  // Lista de compras
  shopping: {
    title: 'Lista de compras',
    empty: 'La lista está vacía',
    addManual: 'Agregar producto',
    addToInventory: 'Agregar al inventario',
    bought: 'Comprado',
    clear: 'Limpiar comprados',
  },

  // Ajustes
  settings: {
    title: 'Ajustes',
    warningDays: 'Días de aviso antes del vencimiento',
    warningDaysHint: 'Productos que vencen dentro de este tiempo aparecen como "pronto"',
    locations: 'Ubicaciones',
    categories: 'Categorías',
    addLocation: 'Agregar ubicación',
    addCategory: 'Agregar categoría',
    deleteConfirm: '¿Eliminar esto?',
    saved: '¡Guardado!',
  },

  // Errores generales
  errors: {
    generic: 'Algo salió mal. Intentá de nuevo.',
    network: 'Sin conexión. Revisá tu internet.',
    notFound: 'No encontrado.',
    loading: 'Cargando…',
  },

  // Acciones comunes
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    confirm: 'Confirmar',
    back: 'Volver',
    retry: 'Reintentar',
  },
} as const

export type TranslationKey = typeof es
