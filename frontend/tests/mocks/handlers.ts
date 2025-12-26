/**
 * MSW Request Handlers
 * API 모킹 핸들러
 */

import { http, HttpResponse } from 'msw';
import {
  mockMaterials,
  mockProcesses,
  mockProducts,
  mockCostBreakdown,
  mockCostPreview,
  mockPriceChanges,
  mockBomItems,
  mockBomProcesses,
  mockSettlements,
  mockSettlementResults,
  mockSettlementSummary,
} from './data';

const API_BASE = '/api/v1';

export const handlers = [
  // Materials
  http.get(`${API_BASE}/materials`, () => {
    return HttpResponse.json(mockMaterials);
  }),

  http.get(`${API_BASE}/materials/:id`, ({ params }) => {
    const material = mockMaterials.find((m) => m.id === params.id);
    if (!material) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(material);
  }),

  http.get(`${API_BASE}/materials/type/:type`, ({ params }) => {
    const filtered = mockMaterials.filter((m) => m.material_type === params.type);
    return HttpResponse.json(filtered);
  }),

  http.post(`${API_BASE}/materials`, async ({ request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    const newMaterial = {
      id: String(mockMaterials.length + 1),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newMaterial, { status: 201 });
  }),

  http.put(`${API_BASE}/materials/:id`, async ({ params, request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    const material = mockMaterials.find((m) => m.id === params.id);
    if (!material) {
      return new HttpResponse(null, { status: 404 });
    }
    const updated = { ...material, ...data, updated_at: new Date().toISOString() };
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE}/materials/:id`, ({ params }) => {
    const material = mockMaterials.find((m) => m.id === params.id);
    if (!material) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Processes
  http.get(`${API_BASE}/processes`, () => {
    return HttpResponse.json(mockProcesses);
  }),

  http.get(`${API_BASE}/processes/:id`, ({ params }) => {
    const process = mockProcesses.find((p) => p.id === params.id);
    if (!process) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(process);
  }),

  http.get(`${API_BASE}/processes/work-type/:type`, ({ params }) => {
    const filtered = mockProcesses.filter((p) => p.work_type === params.type);
    return HttpResponse.json(filtered);
  }),

  // Products
  http.get(`${API_BASE}/products`, () => {
    return HttpResponse.json(mockProducts);
  }),

  http.get(`${API_BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // Cost Calculation
  http.get(`${API_BASE}/cost-calculation/:productId`, () => {
    return HttpResponse.json(mockCostBreakdown);
  }),

  http.post(`${API_BASE}/cost-calculation/calculate`, () => {
    return HttpResponse.json(mockCostBreakdown);
  }),

  http.post(`${API_BASE}/cost-calculation/preview`, () => {
    return HttpResponse.json(mockCostPreview);
  }),

  // Settings
  http.get(`${API_BASE}/settings/cost-rates`, () => {
    return HttpResponse.json({
      material_management_rate: 0.01,
      general_management_rate: 0.1,
      defect_rate: 0.01,
      profit_rate: 0.1,
    });
  }),

  http.put(`${API_BASE}/settings/cost-rates`, async ({ request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      material_management_rate: data.material_management_rate ?? 0.01,
      general_management_rate: data.general_management_rate ?? 0.1,
      defect_rate: data.defect_rate ?? 0.01,
      profit_rate: data.profit_rate ?? 0.1,
    });
  }),

  // Price Changes
  http.get(`${API_BASE}/price-changes`, ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get('product_id');

    let filtered = mockPriceChanges;
    if (productId) {
      filtered = mockPriceChanges.filter(p => p.product_id === productId);
    }

    return HttpResponse.json({
      items: filtered,
      total: filtered.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });
  }),

  // IMPORTANT: Compare endpoint must be before :id to prevent pattern matching conflict
  http.get(`${API_BASE}/price-changes/compare`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    // Default to second item if not found
    const current = mockPriceChanges.find((p) => p.id === id) || mockPriceChanges[1];
    return HttpResponse.json({
      before: mockPriceChanges[0],
      current,
    });
  }),

  http.get(`${API_BASE}/price-changes/:id`, ({ params }) => {
    const priceChange = mockPriceChanges.find((p) => p.id === params.id);
    if (!priceChange) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(priceChange);
  }),

  http.post(`${API_BASE}/price-changes`, async ({ request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    const newPriceChange = {
      id: String(mockPriceChanges.length + 1),
      ...data,
      before_cost: 1800,
      after_cost: 1956,
      cost_diff: 156,
      created_at: new Date().toISOString(),
      created_by: 'admin',
    };
    return HttpResponse.json(newPriceChange, { status: 201 });
  }),

  // BOM
  http.get(`${API_BASE}/bom/product/:productId/items`, ({ params }) => {
    const filtered = mockBomItems.filter((b) => b.product_id === params.productId);
    return HttpResponse.json(filtered);
  }),

  http.get(`${API_BASE}/bom/product/:productId/processes`, ({ params }) => {
    const filtered = mockBomProcesses.filter((b) => b.product_id === params.productId);
    return HttpResponse.json(filtered);
  }),

  http.get(`${API_BASE}/bom/product/:productId`, ({ params }) => {
    const items = mockBomItems.filter((b) => b.product_id === params.productId);
    const processes = mockBomProcesses.filter((b) => b.product_id === params.productId);
    return HttpResponse.json({
      product_id: params.productId,
      items,
      processes,
      total_material_count: items.length,
      total_process_count: processes.length,
    });
  }),

  // PDF Export
  http.get(`${API_BASE}/pdf/cost-breakdown/:productId`, () => {
    // Return a mock PDF blob
    const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF header
    return new HttpResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cost-sheet.pdf"',
      },
    });
  }),

  // Excel Export
  http.get(`${API_BASE}/excel/export/cost-breakdown/:productId`, () => {
    // Return a mock Excel blob
    const excelContent = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // XLSX header
    return new HttpResponse(excelContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="cost-sheet.xlsx"',
      },
    });
  }),

  // Settlement
  http.get(`${API_BASE}/settlement/history`, () => {
    return HttpResponse.json({
      items: mockSettlements,
      total: mockSettlements.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });
  }),

  http.get(`${API_BASE}/settlement/summary`, () => {
    return HttpResponse.json(mockSettlementSummary);
  }),

  http.get(`${API_BASE}/settlement/:id`, ({ params }) => {
    const settlement = mockSettlements.find((s) => s.id === params.id);
    if (!settlement) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(settlement);
  }),

  http.post(`${API_BASE}/settlement/calculate`, async () => {
    return HttpResponse.json(mockSettlementResults);
  }),

  http.post(`${API_BASE}/settlement`, async ({ request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    const newSettlement = {
      id: String(mockSettlements.length + 1),
      price_change_id: data.price_change_id,
      condition: {
        price_change_id: data.price_change_id,
        product_ids: data.product_ids,
        start_date: data.start_date,
        end_date: data.end_date,
        period_type: data.period_type,
      },
      results: data.results || mockSettlementResults,
      total_settlement_amount: data.total_settlement_amount || 330000,
      created_at: new Date().toISOString(),
      created_by: 'admin',
    };
    return HttpResponse.json(newSettlement, { status: 201 });
  }),

  // Excel Receipt Import
  http.post(`${API_BASE}/excel/import/receipt`, async () => {
    return HttpResponse.json({
      success: true,
      items: [
        { product_id: '1', period: '2025-01', quantity: 500 },
        { product_id: '1', period: '2025-02', quantity: 600 },
        { product_id: '1', period: '2025-03', quantity: 400 },
      ],
    });
  }),

  // Excel Settlement Export
  http.get(`${API_BASE}/excel/export/settlement/:id`, () => {
    const excelContent = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    return new HttpResponse(excelContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="settlement.xlsx"',
      },
    });
  }),

  // PDF Settlement Export
  http.get(`${API_BASE}/pdf/settlement/:id`, () => {
    const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    return new HttpResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="settlement.pdf"',
      },
    });
  }),

  // Excel Receipt Template
  http.get(`${API_BASE}/excel/template/receipt`, () => {
    const excelContent = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    return new HttpResponse(excelContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="receipt-template.xlsx"',
      },
    });
  }),
];
