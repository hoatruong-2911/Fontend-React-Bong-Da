import { useState, useEffect } from 'react';
import { Input, Select, Row, Col, Badge, Button, message, Spin } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/customer/ProductCard';
import { CategorySidebar } from '@/components/customer/CategorySidebar';
import { mockProducts } from '@/data/mockProducts';
import { Product, ProductCategory } from '@/types/product';
import { customerServices } from '@/services';

const { Search } = Input;
const { Option } = Select;

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await customerServices.productService.getProducts();
        
        // Handle different API response structures
        let productsData: any[] = [];
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else {
          console.warn('Unexpected API response structure:', response.data);
          throw new Error('Invalid API response structure');
        }

        // Map API response to match our Product type
        const mappedProducts: Product[] = productsData.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          category: p.category as ProductCategory,
          price: Number(p.price),
          image: p.image || '/placeholder.svg',
          description: p.description || '',
          stock: Number(p.stock) || 0,
          unit: p.unit || 'cái'
        }));
        
        setProducts(mappedProducts);
        setApiError(false);
        console.log('API Products loaded:', mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products from API:', error);
        setApiError(true);
        setProducts(mockProducts);
        message.warning('Không thể kết nối API, đang dùng dữ liệu mẫu');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: { id: string }) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
        category: product.category,
        unit: product.unit
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">🛒 Sản Phẩm</h1>
              <p className="text-muted-foreground text-lg">Quản lý và bán hàng tại quầy</p>
            </div>
            <Badge count={cartCount} showZero>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                className="shadow-lg hover:shadow-xl transition-all h-12 px-6"
                onClick={() => navigate('/cart')}
              >
                Giỏ hàng
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Row gutter={[24, 24]}>
          {/* Sidebar */}
          <Col xs={24} md={6}>
            <CategorySidebar 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </Col>

          {/* Products Area */}
          <Col xs={24} md={18}>
            {/* Toolbar */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={12}>
                  <Search
                    placeholder="Tìm kiếm sản phẩm..."
                    prefix={<SearchOutlined className="text-muted-foreground" />}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="large"
                    className="w-full"
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    size="large"
                    className="w-full"
                  >
                    <Option value="name">Tên A-Z</Option>
                    <Option value="price-asc">Giá thấp đến cao</Option>
                    <Option value="price-desc">Giá cao đến thấp</Option>
                  </Select>
                </Col>
                <Col xs={12} md={6}>
                  <div className="flex gap-2">
                    <Button
                      icon={<AppstoreOutlined />}
                      type={viewMode === 'grid' ? 'primary' : 'default'}
                      onClick={() => setViewMode('grid')}
                      size="large"
                      className={viewMode === 'grid' ? 'bg-primary' : ''}
                    />
                    <Button
                      icon={<UnorderedListOutlined />}
                      type={viewMode === 'list' ? 'primary' : 'default'}
                      onClick={() => setViewMode('list')}
                      size="large"
                      className={viewMode === 'list' ? 'bg-primary' : ''}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Products Grid */}
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {filteredProducts.length} sản phẩm
              </h2>
              {apiError && (
                <span className="text-sm text-orange-500">(Dữ liệu mẫu - API chưa kết nối)</span>
              )}
              {!apiError && !loading && (
                <span className="text-sm text-green-500">(Dữ liệu từ API)</span>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-16">
                <Spin size="large" />
                <span className="ml-3 text-muted-foreground">Đang tải sản phẩm...</span>
              </div>
            )}
            
            {!loading && (
              <Row gutter={[16, 16]}>
                {filteredProducts.map(product => (
                  <Col 
                    key={product.id}
                    xs={24} 
                    sm={viewMode === 'grid' ? 12 : 24} 
                    lg={viewMode === 'grid' ? 8 : 24}
                  >
                    <ProductCard 
                      product={product} 
                      onAddToCart={handleAddToCart}
                    />
                  </Col>
                ))}
              </Row>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Products;
