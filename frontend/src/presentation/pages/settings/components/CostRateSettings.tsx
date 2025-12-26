/**
 * CostRateSettings Component
 * 원가 비율 설정
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Form, InputNumber, Button, Space, message, Spin, Descriptions } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiClient } from '@/infrastructure/api/client';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import styles from './CostRateSettings.module.css';

interface CostRates {
  material_management_rate: number;
  general_management_rate: number;
  defect_rate: number;
  profit_rate: number;
}

export interface CostRateSettingsProps {
  className?: string;
}

export function CostRateSettings({ className }: CostRateSettingsProps) {
  const [form] = Form.useForm<CostRates>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<CostRates | null>(null);

  // Fetch current rates
  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<CostRates>(API_ENDPOINTS.SETTINGS_COST_RATES);
      setRates(response.data);
      form.setFieldsValue({
        material_management_rate: response.data.material_management_rate * 100,
        general_management_rate: response.data.general_management_rate * 100,
        defect_rate: response.data.defect_rate * 100,
        profit_rate: response.data.profit_rate * 100,
      });
    } catch (error) {
      message.error('설정을 불러오는데 실패했습니다');
      console.error('Fetch rates error:', error);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Save rates
  const handleSave = async (values: CostRates) => {
    try {
      setSaving(true);
      await apiClient.put(API_ENDPOINTS.SETTINGS_COST_RATES, {
        material_management_rate: values.material_management_rate / 100,
        general_management_rate: values.general_management_rate / 100,
        defect_rate: values.defect_rate / 100,
        profit_rate: values.profit_rate / 100,
      });
      message.success('설정이 저장되었습니다');
      fetchRates();
    } catch (error) {
      message.error('설정 저장에 실패했습니다');
      console.error('Save rates error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Reset to current values
  const handleReset = () => {
    if (rates) {
      form.setFieldsValue({
        material_management_rate: rates.material_management_rate * 100,
        general_management_rate: rates.general_management_rate * 100,
        defect_rate: rates.defect_rate * 100,
        profit_rate: rates.profit_rate * 100,
      });
    }
  };

  return (
    <Card title="원가 비율 설정" className={`${styles.card} ${className || ''}`}>
      <Spin spinning={loading}>
        <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="원가 계산 공식">
            구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
          </Descriptions.Item>
        </Descriptions>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            material_management_rate: 1,
            general_management_rate: 10,
            defect_rate: 1,
            profit_rate: 10,
          }}
        >
          <Form.Item
            name="material_management_rate"
            label="재료관리비율 (%)"
            rules={[{ required: true, message: '재료관리비율을 입력하세요' }]}
            tooltip="재료비에 적용되는 관리비 비율"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="general_management_rate"
            label="일반관리비율 (%)"
            rules={[{ required: true, message: '일반관리비율을 입력하세요' }]}
            tooltip="제조원가에 적용되는 일반관리비 비율"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="defect_rate"
            label="불량비율 (%)"
            rules={[{ required: true, message: '불량비율을 입력하세요' }]}
            tooltip="제조원가에 적용되는 예상 불량 비율"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="profit_rate"
            label="이윤율 (%)"
            rules={[{ required: true, message: '이윤율을 입력하세요' }]}
            tooltip="제조원가에 적용되는 이윤 비율"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                저장
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                초기화
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
}

export default CostRateSettings;
