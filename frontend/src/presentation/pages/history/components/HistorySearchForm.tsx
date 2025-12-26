/**
 * HistorySearchForm Component
 * 변경 이력 검색 폼
 */

import { Form, Select, DatePicker, Input, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useProducts } from '@/application/hooks/use-products';
import styles from './HistorySearchForm.module.css';

const { RangePicker } = DatePicker;

export interface HistorySearchValues {
  product_id?: string;
  change_type?: string;
  eco_number?: string;
  date_range?: [Dayjs, Dayjs];
}

export interface HistorySearchFormProps {
  onSearch: (values: HistorySearchValues) => void;
  loading?: boolean;
}

const CHANGE_TYPES = [
  { value: 'MATERIAL', label: '자재 변경' },
  { value: 'PROCESS', label: '공정 변경' },
  { value: 'COMBINED', label: '복합 변경' },
];

export function HistorySearchForm({ onSearch, loading = false }: HistorySearchFormProps) {
  const [form] = Form.useForm<HistorySearchValues>();
  const { products, isLoading: productsLoading } = useProducts();

  const handleSearch = (values: HistorySearchValues) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSearch}
      className={styles.form}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="product_id" label="품목">
            <Select
              placeholder="전체"
              allowClear
              showSearch
              loading={productsLoading}
              optionFilterProp="label"
              options={products?.map((p) => ({
                value: p.id,
                label: `${p.product_id} - ${p.name}`,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="change_type" label="변경 유형">
            <Select
              placeholder="전체"
              allowClear
              options={CHANGE_TYPES}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="eco_number" label="ECO 번호">
            <Input placeholder="ECO 번호 입력" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="date_range" label="기간">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24} className={styles.buttonRow}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              검색
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              초기화
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
}

export default HistorySearchForm;
