/**
 * SettingsPage
 * 설정 페이지
 */

import { Row, Col } from 'antd';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { CostRateSettings, BackupRestore } from './components';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  return (
    <div className={styles.container}>
      <PageHeader title="설정" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <CostRateSettings />
        </Col>
        <Col xs={24} lg={12}>
          <BackupRestore />
        </Col>
      </Row>
    </div>
  );
}

export default SettingsPage;
