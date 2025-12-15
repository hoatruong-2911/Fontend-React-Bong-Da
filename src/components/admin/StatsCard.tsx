import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  trend?: 'up' | 'down';
  trendValue?: number;
  loading?: boolean;
  valueStyle?: React.CSSProperties;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  trend,
  trendValue,
  loading = false,
  valueStyle,
}) => {
  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
      {trend && trendValue !== undefined && (
        <div className={`mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span className="ml-1">{trendValue}% so với hôm qua</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
