// API Endpoints
export const API_ENDPOINTS = {
  // Materials
  MATERIALS: '/materials',
  MATERIAL_BY_ID: (id: string) => `/materials/${id}`,
  MATERIALS_BY_TYPE: (type: string) => `/materials/type/${type}`,
  MATERIALS_BULK: '/materials/bulk',

  // Processes
  PROCESSES: '/processes',
  PROCESS_BY_ID: (id: string) => `/processes/${id}`,
  PROCESSES_BY_WORK_TYPE: (type: string) => `/processes/work-type/${type}`,
  PROCESSES_BULK: '/processes/bulk',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // BOM
  BOM: '/bom',
  BOM_BY_PRODUCT: (productId: string) => `/bom/product/${productId}`,
  BOM_ITEMS: (productId: string) => `/bom/product/${productId}/items`,
  BOM_PROCESSES: (productId: string) => `/bom/product/${productId}/processes`,
  BOM_BULK_UPDATE: (productId: string) => `/bom/product/${productId}/bulk`,

  // Price Changes
  PRICE_CHANGES: '/price-changes',
  PRICE_CHANGE_BY_ID: (id: string) => `/price-changes/${id}`,
  PRICE_CHANGE_COMPARE: '/price-changes/compare',

  // Cost Calculation
  COST_CALCULATION: '/cost-calculation',
  COST_CALCULATE: '/cost-calculation/calculate',
  COST_BREAKDOWN: (productId: string) => `/cost-calculation/${productId}`,
  COST_PREVIEW: '/cost-calculation/preview',

  // Settlement
  SETTLEMENT: '/settlement',
  SETTLEMENT_CALCULATE: '/settlement/calculate',
  SETTLEMENT_BY_ID: (id: string) => `/settlement/${id}`,
  SETTLEMENT_HISTORY: '/settlement/history',

  // Excel (grouped for service)
  EXCEL: {
    TEMPLATE: '/excel/template',
    IMPORT: '/excel/import',
    EXPORT: '/excel/export',
  },
  // Excel (individual endpoints)
  EXCEL_IMPORT_MATERIALS: '/excel/import/materials',
  EXCEL_IMPORT_BOM: '/excel/import/bom',
  EXCEL_IMPORT_PROCESSES: '/excel/import/processes',
  EXCEL_IMPORT_RECEIPT: '/excel/import/receipt',
  EXCEL_EXPORT_MATERIALS: '/excel/export/materials',
  EXCEL_EXPORT_PROCESSES: '/excel/export/processes',
  EXCEL_EXPORT_COST_BREAKDOWN: (productId: string) => `/excel/export/cost-breakdown/${productId}`,
  EXCEL_EXPORT_SETTLEMENT: (id: string) => `/excel/export/settlement/${id}`,
  EXCEL_TEMPLATE: (type: string) => `/excel/template/${type}`,

  // PDF
  PDF_COST_BREAKDOWN: (productId: string) => `/pdf/cost-breakdown/${productId}`,
  PDF_SETTLEMENT: (id: string) => `/pdf/settlement/${id}`,

  // Settings
  SETTINGS: '/settings',
  SETTINGS_COST_RATES: '/settings/cost-rates',
} as const;
