/**
 * Mock Data for Tests
 * 테스트용 모의 데이터
 */

import type { Material, MaterialType, MaterialUnit } from '@/domain/entities/material';
import type { Process } from '@/domain/entities/process';
import { WorkType } from '@/domain/entities/process';
import type { Product, ProductStatus } from '@/domain/entities/product';

// Mock Materials
export const mockMaterials: Material[] = [
  {
    id: '1',
    material_id: 'AWG20-RED',
    name: '전선 (적색)',
    spec: 'AWG20',
    material_type: 'WIRE' as MaterialType,
    unit: 'MTR' as MaterialUnit,
    unit_price: 60.65,
    scrap_rate: 0.05,
    effective_date: '2025-01-01',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    material_id: 'TERM-001',
    name: '터미널 A',
    spec: '187 Female',
    material_type: 'TERMINAL' as MaterialType,
    unit: 'EA' as MaterialUnit,
    unit_price: 15.0,
    scrap_rate: 0.02,
    effective_date: '2025-01-01',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    material_id: 'CONN-001',
    name: '커넥터 A',
    spec: '4P Housing',
    material_type: 'CONNECTOR' as MaterialType,
    unit: 'EA' as MaterialUnit,
    unit_price: 250.0,
    scrap_rate: 0.01,
    effective_date: '2025-01-01',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock Processes
export const mockProcesses: Process[] = [
  {
    id: '1',
    process_id: 'CUT-001',
    name: '절단압착',
    equipment_name: '절압기 #1',
    work_type: 'IN_HOUSE' as WorkType,
    cycle_time: 3.5,
    worker_count: 1,
    hourly_rate: 15000,
    efficiency: 100,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    process_id: 'TAPE-001',
    name: '테이핑',
    equipment_name: '테이핑기 #1',
    work_type: 'IN_HOUSE' as WorkType,
    cycle_time: 2.8,
    worker_count: 1,
    hourly_rate: 12000,
    efficiency: 95,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    process_id: 'ASSY-001',
    name: '조립',
    equipment_name: '조립작업대',
    work_type: 'OUTSOURCE' as WorkType,
    cycle_time: 5.0,
    worker_count: 2,
    hourly_rate: 10000,
    efficiency: 100,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    product_id: 'WH-001',
    name: '와이어 하네스 A',
    customer_pn: 'XYZ-1234',
    customer_name: '현대자동차',
    vehicle_model: '아반떼 CN7',
    status: 'PRODUCTION' as ProductStatus,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: 'WH-002',
    name: '와이어 하네스 B',
    customer_pn: 'ABC-5678',
    customer_name: '기아자동차',
    vehicle_model: 'K5 DL3',
    status: 'PRODUCTION' as ProductStatus,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    product_id: 'WH-003',
    name: '와이어 하네스 C',
    customer_pn: 'DEV-9999',
    customer_name: '현대자동차',
    vehicle_model: '아이오닉 6',
    status: 'DEVELOPMENT' as ProductStatus,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock Cost Breakdown with detailed material and process info
export const mockCostBreakdown = {
  product_id: '1',
  product: mockProducts[0],
  inhouse_material_cost: 1234.56,
  outsource_material_cost: 567.89,
  total_material_cost: 1802.45,
  inhouse_labor_cost: 345.67,
  outsource_labor_cost: 123.45,
  total_labor_cost: 469.12,
  inhouse_expense: 234.56,
  outsource_expense: 89.01,
  total_expense: 323.57,
  inhouse_manufacturing_cost: 1814.79,
  outsource_manufacturing_cost: 780.35,
  total_manufacturing_cost: 2595.14,
  material_management_cost: 18.02,
  general_management_cost: 79.27,
  defect_cost: 25.95,
  profit: 87.2,
  inhouse_purchase_cost: 2025.02,
  outsource_purchase_cost: 780.56,
  total_purchase_cost: 2805.58,
  material_details: [
    {
      material_id: '1',
      material: mockMaterials[0],
      work_type: 'IN_HOUSE' as WorkType,
      quantity: 1.5,
      unit_price: 60.65,
      material_cost: 90.98,
      scrap_cost: 4.55,
      net_material_cost: 95.53,
    },
    {
      material_id: '2',
      material: mockMaterials[1],
      work_type: 'IN_HOUSE' as WorkType,
      quantity: 4,
      unit_price: 15.0,
      material_cost: 60.0,
      scrap_cost: 1.2,
      net_material_cost: 61.2,
    },
    {
      material_id: '3',
      material: mockMaterials[2],
      work_type: 'OUTSOURCE' as WorkType,
      quantity: 2,
      unit_price: 250.0,
      material_cost: 500.0,
      scrap_cost: 5.0,
      net_material_cost: 505.0,
    },
  ],
  process_details: [
    {
      process_id: '1',
      process: mockProcesses[0],
      work_type: 'IN_HOUSE' as WorkType,
      cycle_time: 3.5,
      workers: 1,
      production_volume: 1028.57,
      labor_cost: 145.83,
      expense: 100.0,
      total_process_cost: 245.83,
    },
    {
      process_id: '2',
      process: mockProcesses[1],
      work_type: 'IN_HOUSE' as WorkType,
      cycle_time: 2.8,
      workers: 1,
      production_volume: 1285.71,
      labor_cost: 116.67,
      expense: 80.0,
      total_process_cost: 196.67,
    },
    {
      process_id: '3',
      process: mockProcesses[2],
      work_type: 'OUTSOURCE' as WorkType,
      cycle_time: 5.0,
      workers: 2,
      production_volume: 720.0,
      labor_cost: 200.0,
      expense: 150.0,
      total_process_cost: 350.0,
    },
  ],
};

// Mock Cost Preview
export const mockCostPreview = {
  before: {
    material_cost: 1000,
    labor_cost: 300,
    expense: 200,
    manufacturing_cost: 1500,
    purchase_cost: 1800,
  },
  after: {
    material_cost: 1100,
    labor_cost: 320,
    expense: 210,
    manufacturing_cost: 1630,
    purchase_cost: 1956,
  },
  diff: {
    material_cost: 100,
    labor_cost: 20,
    expense: 10,
    manufacturing_cost: 130,
    purchase_cost: 156,
  },
};

// Mock Price Changes
export const mockPriceChanges = [
  {
    id: '1',
    product_id: '1',
    product: mockProducts[0],
    change_type: 'MATERIAL',
    change_reason: '원자재 가격 인상',
    eco_number: 'ECO-2025-001',
    effective_date: '2025-02-01',
    before_cost: 1800,
    after_cost: 1956,
    cost_diff: 156,
    material_changes: [
      {
        material_id: '1',
        material: mockMaterials[0],
        status: 'MODIFIED',
        before_quantity: 1.5,
        after_quantity: 1.5,
        before_unit_price: 60.65,
        after_unit_price: 72.78,
        before_cost: 90.98,
        after_cost: 109.17,
        cost_diff: 18.19,
      },
    ],
    process_changes: [],
    created_at: '2025-01-15T09:00:00Z',
    created_by: 'admin',
  },
  {
    id: '2',
    product_id: '1',
    product: mockProducts[0],
    change_type: 'PROCESS',
    change_reason: '공정 효율 개선',
    eco_number: 'ECO-2025-002',
    effective_date: '2025-03-01',
    before_cost: 1956,
    after_cost: 1900,
    cost_diff: -56,
    material_changes: [],
    process_changes: [
      {
        process_id: '1',
        process: mockProcesses[0],
        status: 'MODIFIED',
        before_cycle_time: 3.5,
        after_cycle_time: 3.0,
        before_workers: 1,
        after_workers: 1,
        before_cost: 145.83,
        after_cost: 125.0,
        cost_diff: -20.83,
      },
    ],
    created_at: '2025-01-20T10:00:00Z',
    created_by: 'admin',
  },
];

// Mock BOM Items for product selection
export const mockBomItems = [
  {
    id: '1',
    product_id: '1',
    material_id: '1',
    material: mockMaterials[0],
    quantity: 1.5,
    work_type: 'IN_HOUSE',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: '1',
    material_id: '2',
    material: mockMaterials[1],
    quantity: 4,
    work_type: 'IN_HOUSE',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    product_id: '1',
    material_id: '3',
    material: mockMaterials[2],
    quantity: 2,
    work_type: 'OUTSOURCE',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock BOM Processes for product selection
export const mockBomProcesses = [
  {
    id: '1',
    product_id: '1',
    process_id: '1',
    process: mockProcesses[0],
    sequence: 1,
    cycle_time: 3.5,
    workers: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: '1',
    process_id: '2',
    process: mockProcesses[1],
    sequence: 2,
    cycle_time: 2.8,
    workers: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock Settlement Data
export const mockSettlementResults = [
  {
    product_id: '1',
    product: mockProducts[0],
    total_quantity: 1500,
    unit_price_diff: 156,
    settlement_amount: 234000,
    period_details: [
      { period: '2025-01', quantity: 500, amount: 78000 },
      { period: '2025-02', quantity: 600, amount: 93600 },
      { period: '2025-03', quantity: 400, amount: 62400 },
    ],
  },
  {
    product_id: '2',
    product: mockProducts[1],
    total_quantity: 800,
    unit_price_diff: 120,
    settlement_amount: 96000,
    period_details: [
      { period: '2025-01', quantity: 300, amount: 36000 },
      { period: '2025-02', quantity: 250, amount: 30000 },
      { period: '2025-03', quantity: 250, amount: 30000 },
    ],
  },
];

export const mockSettlements = [
  {
    id: '1',
    price_change_id: '1',
    price_change: mockPriceChanges[0],
    condition: {
      price_change_id: '1',
      product_ids: ['1', '2'],
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      period_type: 'MONTHLY' as const,
    },
    results: mockSettlementResults,
    total_settlement_amount: 330000,
    created_at: '2025-04-01T10:00:00Z',
    created_by: 'admin',
  },
];

export const mockSettlementSummary = {
  pending_count: 3,
  total_amount: 1250000,
  this_month_count: 2,
};
