import { Card, Button, Tag, Rate } from 'antd';
import { EnvironmentOutlined, TeamOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// Giả định Field interface được import từ '@/types/field'
import { Field } from '@/types/field';

interface FieldCardProps {
  field: Field;
}

const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
  const navigate = useNavigate();

  // Đảm bảo rating là số trước khi dùng toFixed
  const safeRating = field.rating || 0;
  const safeReviews = field.reviews_count || 0;

  return (
    <Card
      hoverable
      className="h-full border-border shadow-sm hover:shadow-md transition-all"
      cover={
        <div
          className="relative h-48 overflow-hidden cursor-pointer"
          // Chuyển đến trang chi tiết
          onClick={() => navigate(`/fields/${field.id}`)}
        >
          <img
            alt={field.name}
            src={field.image}
            className="w-full h-full object-cover"
          />
          <Tag
            color={field.available ? 'green' : 'red'}
            className="absolute top-2 right-2"
          >
            {field.available ? 'Còn trống' : 'Đã đặt'}
          </Tag>
          <Tag
            color="blue"
            className="absolute top-2 left-2"
          >
            {field.size} người
          </Tag>
        </div>
      }
    >
      <div className="space-y-3">
        <h3
          className="font-semibold text-foreground cursor-pointer hover:text-primary"
          onClick={() => navigate(`/fields/${field.id}`)}
        >
          {field.name}
        </h3>

        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <EnvironmentOutlined />
          <span>{field.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <Rate
            disabled
            defaultValue={safeRating}
            allowHalf
            className="text-sm"
          />
          <span className="text-muted-foreground text-sm">
            ({safeReviews})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {field.price.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-muted-foreground text-sm">/giờ</span>
          </div>
          <Tag color="default" icon={<TeamOutlined />}>
            {field.surface}
          </Tag>
        </div>

        <Button
          type="primary"
          className="w-full"
          // ⬅️ FIX: Sử dụng 'fieldId' để khớp với BookingPage.tsx
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn trigger sự kiện cha
            navigate(`/booking?fieldId=${field.id}`);
          }}
          disabled={!field.available}
        >
          {field.available ? 'Đặt sân ngay' : 'Không khả dụng'}
        </Button>
      </div>
    </Card>
  );
};

export default FieldCard;
