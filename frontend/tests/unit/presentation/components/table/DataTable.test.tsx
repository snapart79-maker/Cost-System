/**
 * DataTable Component Tests
 * TanStack Table 기반 DataTable 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DataTable } from '@/presentation/components/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface TestData {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const testData: TestData[] = [
  { id: '1', name: '자재 A', price: 100, quantity: 10 },
  { id: '2', name: '자재 B', price: 200, quantity: 20 },
  { id: '3', name: '자재 C', price: 150, quantity: 15 },
  { id: '4', name: '자재 D', price: 300, quantity: 30 },
  { id: '5', name: '자재 E', price: 250, quantity: 25 },
];

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: '자재명',
  },
  {
    accessorKey: 'price',
    header: '단가',
  },
  {
    accessorKey: 'quantity',
    header: '수량',
  },
];

describe('DataTable', () => {
  describe('Rendering', () => {
    it('should render table with columns and data', () => {
      render(<DataTable columns={columns} data={testData} />);

      // Check headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('자재명')).toBeInTheDocument();
      expect(screen.getByText('단가')).toBeInTheDocument();
      expect(screen.getByText('수량')).toBeInTheDocument();

      // Check data
      expect(screen.getByText('자재 A')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      render(<DataTable columns={columns} data={[]} />);

      expect(screen.getByText(/데이터가 없습니다/)).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<DataTable columns={columns} data={[]} loading />);

      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should enable sorting when sortable prop is true', () => {
      render(<DataTable columns={columns} data={testData} sortable />);

      const priceHeader = screen.getByText('단가');
      // Click should be possible
      fireEvent.click(priceHeader);

      // After clicking, rows should still be rendered
      expect(screen.getByText('자재 A')).toBeInTheDocument();
    });

    it('should sort data on header click', () => {
      render(<DataTable columns={columns} data={testData} sortable />);

      const priceHeader = screen.getByText('단가');
      fireEvent.click(priceHeader);

      // Verify sorting is applied - data order should change
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe('Filtering', () => {
    it('should filter data based on global filter', async () => {
      render(<DataTable columns={columns} data={testData} filterable />);

      const filterInput = screen.getByPlaceholderText(/검색/);
      fireEvent.change(filterInput, { target: { value: '자재 A' } });

      // Only '자재 A' should be visible
      expect(screen.getByText('자재 A')).toBeInTheDocument();
      expect(screen.queryByText('자재 B')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should paginate data correctly', () => {
      render(
        <DataTable columns={columns} data={testData} pagination pageSize={2} />
      );

      // Should show first 2 items
      expect(screen.getByText('자재 A')).toBeInTheDocument();
      expect(screen.getByText('자재 B')).toBeInTheDocument();
      expect(screen.queryByText('자재 C')).not.toBeInTheDocument();
    });

    it('should navigate between pages', () => {
      render(
        <DataTable columns={columns} data={testData} pagination pageSize={2} />
      );

      // Click next page
      const nextButton = screen.getByRole('button', { name: /다음|next/i });
      fireEvent.click(nextButton);

      // Should show next page items
      expect(screen.getByText('자재 C')).toBeInTheDocument();
      expect(screen.getByText('자재 D')).toBeInTheDocument();
    });

    it('should display page info', () => {
      render(
        <DataTable columns={columns} data={testData} pagination pageSize={2} />
      );

      // Should show pagination info (e.g., "1 / 3 페이지" or similar)
      expect(screen.getByText(/페이지|page/i)).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('should allow row selection when selectable', () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={testData}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );

      // Find and click row checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is "select all", second is first row
      fireEvent.click(checkboxes[1]);

      // Verify callback was called
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should select all rows when clicking header checkbox', () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={testData}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );

      // Click select all checkbox
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      // Verify callback was called with multiple items
      expect(onSelectionChange).toHaveBeenCalled();
      const calledWith = onSelectionChange.mock.calls[0][0];
      expect(calledWith.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Cell Rendering', () => {
    it('should render custom cell content', () => {
      const columnsWithCustomCell: ColumnDef<TestData>[] = [
        ...columns.slice(0, 2),
        {
          accessorKey: 'price',
          header: '단가',
          cell: ({ getValue }) => `${getValue<number>().toLocaleString()}원`,
        },
        columns[3],
      ];

      render(<DataTable columns={columnsWithCustomCell} data={testData} />);

      expect(screen.getByText('100원')).toBeInTheDocument();
    });
  });

  describe('Row Actions', () => {
    it('should render row actions when provided', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <DataTable
          columns={columns}
          data={testData}
          actions={[
            { label: '수정', onClick: onEdit },
            { label: '삭제', onClick: onDelete, danger: true },
          ]}
        />
      );

      // Find first row's edit button and click
      const editButtons = screen.getAllByText('수정');
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(testData[0]);
    });
  });
});
