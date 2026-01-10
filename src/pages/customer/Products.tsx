import { useState, useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Badge,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Select,
  Empty,
  Pagination,
} from "antd";
import {
  ShoppingCartOutlined,
  FilterOutlined,
  AppstoreOutlined,
  RightOutlined,
  SortAscendingOutlined,
  InboxOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/customer/ProductCard";
import customerProductService, {
  Product,
  Category,
  Brand,
} from "@/services/customer/productService";

const { Title, Text } = Typography;
const { Option } = Select;

interface RawProductResponse {
  id: number;
  name: string;
  price: string | number;
  category?: { name: string } | string;
  brand?: { name: string } | string;
  image?: string;
  description?: string;
  stock?: string | number;
  unit?: string;
  available?: boolean | number;
}

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
  const [selectedBrand, setSelectedBrand] = useState<string | number>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [cartCount, setCartCount] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const extractData = <T,>(res: unknown): T[] => {
    const dataObj = res as { data?: T[] | { data: T[] } };
    if (!dataObj || !dataObj.data) return [];
    if (Array.isArray(dataObj.data)) return dataObj.data;
    if (typeof dataObj.data === "object" && "data" in dataObj.data && Array.isArray(dataObj.data.data)) {
      return dataObj.data.data;
    }
    return [];
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          customerProductService.getCategories(),
          customerProductService.getBrands(),
        ]);
        setCategories(extractData<Category>(catRes));
        setBrands(extractData<Brand>(brandRes));
      } catch (error) {
        console.error(error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await customerProductService.getProducts({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          brand: selectedBrand === "all" ? undefined : selectedBrand,
          search: searchTerm || undefined,
          sort: sortOrder,
        });

        const rawArray = extractData<RawProductResponse>(res);
        const mappedProducts: Product[] = rawArray.map((p: RawProductResponse) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          category: (typeof p.category === "object" ? p.category?.name : p.category) || "Món ăn",
          brand: (typeof p.brand === "object" ? p.brand?.name : p.brand) || "",
          image: p.image,
          stock: Number(p.stock) || 0,
          unit: p.unit || "món",
          is_active: Boolean(p.available),
        }));

        setProducts(mappedProducts);
        setCurrentPage(1);
      } catch (error) {
        message.error("Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedBrand, searchTerm, sortOrder]);

  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: { id: number }) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    message.success(`Đã thêm ${product.name}!`);
  };

  const handleBuyNow = (product: Product) => {
    const buyNowItem = { ...product, quantity: 1 };
    navigate("/checkout", { state: { buyNowItem } });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-20">
      {/* Header Hero (Giữ nguyên cực phẩm) */}
      <div className="bg-[#022c22] relative overflow-hidden py-24 px-10">
        <div className="absolute right-[-5%] top-[-10%] w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="max-w-[1600px] mx-auto relative z-10">
          <Text className="text-green-400 font-black italic uppercase tracking-[0.3em] text-xs block mb-4">WESPORT PRODUCT LIST:</Text>
          <Title level={1} className="!text-white !text-7xl !font-black !italic !uppercase !m-0 !tracking-tighter !leading-none">
            DANH SÁCH SẢN PHẨM <br />
            <span className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">ĐỈNH CAO</span>
          </Title>
          <div className="w-24 h-1.5 bg-yellow-400 mt-8 mb-6 rounded-full" />
        </div>
      </div>

      <div className="max-w-[1900px] mx-auto px-6 -mt-12 relative z-20">
        <Row gutter={[20, 20]}>
          {/* 🛑 CỘT 1: THƯƠNG HIỆU - ĐÃ XÓA PHẦN DƯ */}
          <Col xs={24} md={5} lg={4}>
            <div className="bg-white rounded-[24px] shadow-md overflow-hidden border border-gray-100 flex flex-col h-fit">
              <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                <Space className="font-black uppercase text-xs italic text-slate-800">
                  <FilterOutlined className="text-blue-600" /> THƯƠNG HIỆU
                </Space>
                <RightOutlined className="text-gray-300 rotate-90" />
              </div>
              <div className="p-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                <div className="flex flex-col gap-1">
                  <div
                    className={`cursor-pointer px-6 py-3 rounded-xl transition-all text-[11px] font-bold uppercase ${selectedBrand === "all" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
                    onClick={() => setSelectedBrand("all")}
                  >
                    TẤT CẢ HIỆU
                  </div>
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className={`cursor-pointer px-6 py-3 rounded-xl transition-all text-[11px] font-bold uppercase ${selectedBrand === b.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"}`}
                      onClick={() => setSelectedBrand(b.id)}
                    >
                      {b.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          {/* 🛑 CỘT 2: DANH MỤC - ĐÃ XÓA PHẦN DƯ */}
          <Col xs={24} md={5} lg={4}>
            <div className="bg-white rounded-[24px] shadow-md overflow-hidden border border-gray-100 flex flex-col h-fit">
              <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                <Space className="font-black uppercase text-xs italic text-slate-800">
                  <AppstoreOutlined className="text-emerald-600" /> DANH MỤC
                </Space>
                <RightOutlined className="text-gray-300 rotate-90" />
              </div>
              <div className="p-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                <div className="flex flex-col gap-1">
                  <div
                    className={`cursor-pointer px-6 py-3 rounded-xl transition-all text-[11px] font-bold uppercase ${selectedCategory === "all" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    TẤT CẢ MÓN
                  </div>
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className={`cursor-pointer px-6 py-3 rounded-xl transition-all text-[11px] font-bold uppercase ${selectedCategory === c.id ? "bg-emerald-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"}`}
                      onClick={() => setSelectedCategory(c.id)}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          {/* CỘT 3: TÌM KIẾM & DANH SÁCH (Giữ nguyên) */}
          <Col xs={24} md={14} lg={16}>
            <div className="bg-white rounded-[24px] p-5 mb-6 shadow-md flex flex-wrap gap-4 items-center border-none">
              <Input
                placeholder="Tìm món bạn cần ngay..."
                size="large"
                allowClear
                prefix={<SearchOutlined className="text-gray-300" />}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 3, borderRadius: "16px", height: "50px" }}
              />
              <Select
                size="large"
                defaultValue="latest"
                onChange={setSortOrder}
                style={{ flex: 1, minWidth: "150px", height: "50px" }}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="latest">Mới nhất</Option>
                <Option value="price-asc">Giá tăng dần</Option>
                <Option value="price-desc">Giá giảm dần</Option>
              </Select>
              <Badge count={cartCount} showZero>
                <Button 
                  icon={<ShoppingCartOutlined />} 
                  size="large" 
                  onClick={() => navigate("/cart")}
                  className="h-[50px] rounded-2xl border-none bg-slate-900 text-white font-bold px-6 shadow-xl"
                >
                  GIỎ HÀNG
                </Button>
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-40"><Spin size="large" /></div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[20, 20]}>
                  {currentProducts.map((p) => (
                    <Col key={p.id} xs={24} sm={12} lg={8}>
                      <ProductCard product={p} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
                    </Col>
                  ))}
                </Row>
                <div className="mt-12 flex justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                  <Pagination current={currentPage} pageSize={pageSize} total={products.length} onChange={setCurrentPage} showSizeChanger={false} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-[40px] py-32 text-center shadow-md border border-dashed border-gray-200">
                <Empty description={<Text className="text-xl font-black italic text-slate-400 uppercase">Không tìm thấy cực phẩm nào...</Text>} />
              </div>
            )}
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Products;