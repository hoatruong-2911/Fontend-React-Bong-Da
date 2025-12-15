import React from 'react';
import { Table, Card, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

interface DataTableProps<T> {
  title?: string;
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  pagination?: TablePaginationConfig | false;
  rowKey?: string | ((record: T) => string);
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  extra?: React.ReactNode;
  scroll?: { x?: number | string; y?: number | string };
}

function DataTable<T extends object>({
  title,
  columns,
  dataSource,
  loading = false,
  pagination = { pageSize: 10 },
  rowKey = 'id',
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  onRefresh,
  onExport,
  extra,
  scroll,
}: DataTableProps<T>) {
  return (
    <Card
      title={title}
      extra={
        <Space>
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              onChange={(e) => onSearch(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          )}
          {onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Làm mới
            </Button>
          )}
          {onExport && (
            <Button icon={<DownloadOutlined />} onClick={onExport}>
              Xuất Excel
            </Button>
          )}
          {extra}
        </Space>
      }
    >
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        rowKey={rowKey}
        scroll={scroll}
      />
    </Card>
  );
}

export default DataTable;
