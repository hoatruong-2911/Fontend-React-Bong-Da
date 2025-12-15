import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  InputNumber, 
  Tag, 
  Rate, 
  Divider, 
  Row, 
  Col, 
  Image,
  Breadcrumb,
  message,
  Tabs
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { mockProducts } from '@/data/mockProducts';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
          <Button type="primary" onClick={() => navigate('/products')}>
            Quay lại cửa hàng
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Store in localStorage for cart persistence
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: { id: string }) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: quantity,
        category: product.category,
        unit: product.unit
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    message.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const categoryMap: Record<string, string> = {
    food: 'Đồ ăn',
    drink: 'Nước uống',
    apparel: 'Quần áo',
    accessories: 'Phụ kiện'
  };

  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { title: <a href="/">Trang chủ</a> },
              { title: <a href="/products">Sản phẩm</a> },
              { title: product.name },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          Quay lại
        </Button>

        <Row gutter={[32, 32]}>
          {/* Product Images */}
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-md overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-[400px] object-cover rounded-lg"
                preview={true}
              />
              
              {/* Thumbnail Images - mock multiple images */}
              <div className="flex gap-2 mt-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={product.image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Product Info */}
          <Col xs={24} md={12}>
            <div className="space-y-6">
              {/* Category Tag */}
              <Tag color="green" className="text-sm">
                {categoryMap[product.category] || product.category}
              </Tag>

              {/* Title */}
              <h1 className="text-3xl font-bold text-foreground">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <Rate disabled defaultValue={4.5} allowHalf />
                <span className="text-muted-foreground">(128 đánh giá)</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-green-600">Đã bán 1.2k</span>
              </div>

              {/* Price */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <span className="text-4xl font-bold text-primary">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-muted-foreground ml-2">/ {product.unit}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 10 ? (
                  <>
                    <CheckCircleOutlined className="text-green-600" />
                    <span className="text-green-600">Còn hàng ({product.stock} {product.unit})</span>
                  </>
                ) : product.stock > 0 ? (
                  <>
                    <CheckCircleOutlined className="text-amber-600" />
                    <span className="text-amber-600">Sắp hết ({product.stock} {product.unit})</span>
                  </>
                ) : (
                  <span className="text-destructive">Hết hàng</span>
                )}
              </div>

              <Divider />

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Số lượng:</span>
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  size="large"
                  className="w-32"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="flex-1 h-14 text-lg font-semibold"
                  disabled={product.stock === 0}
                >
                  Thêm vào giỏ
                </Button>
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  className="flex-1 h-14 text-lg font-semibold bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                  disabled={product.stock === 0}
                >
                  Mua ngay
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="flex gap-4">
                <Button icon={<HeartOutlined />} size="large">
                  Yêu thích
                </Button>
                <Button icon={<ShareAltOutlined />} size="large">
                  Chia sẻ
                </Button>
              </div>

              <Divider />

              {/* Policies */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <TruckOutlined className="text-lg" />
                  <span>Giao hàng tận nơi trong sân vận động</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <SafetyOutlined className="text-lg" />
                  <span>Đảm bảo chất lượng 100%</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircleOutlined className="text-lg" />
                  <span>Đổi trả trong 24h nếu có lỗi</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Product Details Tabs */}
        <Card className="mt-8 border-0 shadow-md">
          <Tabs
            defaultActiveKey="details"
            items={[
              {
                key: 'details',
                label: 'Chi tiết sản phẩm',
                children: (
                  <div className="py-4">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 text-muted-foreground w-1/3">Danh mục</td>
                          <td className="py-3">{categoryMap[product.category]}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-muted-foreground">Đơn vị</td>
                          <td className="py-3">{product.unit}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-muted-foreground">Tồn kho</td>
                          <td className="py-3">{product.stock}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-muted-foreground">Xuất xứ</td>
                          <td className="py-3">Việt Nam</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                key: 'reviews',
                label: 'Đánh giá (128)',
                children: (
                  <div className="py-4 text-center text-muted-foreground">
                    Chức năng đánh giá đang được phát triển
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
            <Row gutter={[16, 16]}>
              {relatedProducts.map((p) => (
                <Col key={p.id} xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/products/${p.id}`)}
                    cover={
                      <img
                        alt={p.name}
                        src={p.image}
                        className="h-40 object-cover"
                      />
                    }
                  >
                    <Card.Meta
                      title={<span className="line-clamp-2">{p.name}</span>}
                      description={
                        <span className="text-primary font-bold">
                          {p.price.toLocaleString('vi-VN')}đ
                        </span>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}