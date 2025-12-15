import React from 'react';
import { Row, Col, Empty } from 'antd';
import FieldCard from './FieldCard';
import { Field } from '@/types/field';

interface FieldGridProps {
  fields: Field[];
  loading?: boolean;
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
}

const FieldGrid: React.FC<FieldGridProps> = ({ 
  fields, 
  loading = false,
  columns = { xs: 24, sm: 12, md: 8, lg: 8, xl: 8 }
}) => {
  if (!loading && fields.length === 0) {
    return <Empty description="Không có sân nào" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {fields.map((field) => (
        <Col key={field.id} {...columns}>
          <FieldCard field={field} />
        </Col>
      ))}
    </Row>
  );
};

export default FieldGrid;
