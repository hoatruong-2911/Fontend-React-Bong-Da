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
  Card,
  Collapse,
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/customer/ProductCard";
import customerProductService, {
  Product,
  Category,
  Brand,
} from "@/services/customer/productService";

const { Title, Text } = Typography;
const { Panel } = Collapse;
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

  const [selectedCategory, setSelectedCategory] = useState<string | number>(
    "all"
  );
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
    if (
      typeof dataObj.data === "object" &&
      "data" in dataObj.data &&
      Array.isArray(dataObj.data.data)
    ) {
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
        const mappedProducts: Product[] = rawArray.map(
          (p: RawProductResponse) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            category:
              (typeof p.category === "object"
                ? p.category?.name
                : p.category) || "Món ăn",
            brand:
              (typeof p.brand === "object" ? p.brand?.name : p.brand) || "",
            image: p.image,
            stock: Number(p.stock) || 0,
            unit: p.unit || "món",
            is_active: Boolean(p.available),
          })
        );

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
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(
        cart.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        )
      );
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(
      (item: { id: number }) => item.id === product.id
    );
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    message.success(`Đã thêm ${product.name}!`);
  };

  // LOGIC MỚI: HÀM MUA NGAY
  const handleBuyNow = (product: Product) => {
    // Đóng gói sản phẩm đơn lẻ (số lượng mặc định là 1 khi mua từ danh sách)
    const buyNowItem = {
      ...product,
      quantity: 1,
    };

    // Điều hướng thẳng đến checkout với state chứa món hàng này
    navigate("/checkout", { state: { buyNowItem } });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-20">
      <div className="bg-[#064e3b] py-8 px-10 text-white flex justify-between items-center shadow-lg">
        <Title
          level={3}
          className="text-white! m-0 font-black italic uppercase"
        >
          🛒 SPORT STORE
        </Title>
        <Badge count={cartCount} showZero>
          <Button
            icon={<ShoppingCartOutlined />}
            size="large"
            className="rounded-xl font-bold bg-emerald-500 border-none shadow-md h-12 px-8"
            onClick={() => navigate("/cart")}
          >
            GIỎ HÀNG
          </Button>
        </Badge>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-10">
        <Row gutter={[20, 20]} align="top">
          <Col xs={24} md={4}>
            <Collapse
              ghost
              expandIconPosition="end"
              className="bg-white rounded-2xl shadow-sm"
              expandIcon={({ isActive }) => (
                <RightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              <Panel
                header={
                  <Space className="font-bold uppercase text-[11px] italic">
                    <FilterOutlined className="text-blue-500" /> THƯƠNG HIỆU
                  </Space>
                }
                key="1"
                style={{ border: "none" }}
              >
                <div className="flex flex-col gap-1 pb-2">
                  <div
                    className={`cursor-pointer px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase ${
                      selectedBrand === "all"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedBrand("all")}
                  >
                    Tất cả hiệu
                  </div>
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className={`cursor-pointer px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase ${
                        selectedBrand === b.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedBrand(b.id)}
                    >
                      {b.name}
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          </Col>

          <Col xs={24} md={4}>
            <Collapse
              ghost
              expandIconPosition="end"
              className="bg-white rounded-2xl shadow-sm"
              expandIcon={({ isActive }) => (
                <RightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              <Panel
                header={
                  <Space className="font-bold uppercase text-[11px] italic">
                    <AppstoreOutlined className="text-emerald-500" /> DANH MỤC
                  </Space>
                }
                key="2"
                style={{ border: "none" }}
              >
                <div className="flex flex-col gap-1 pb-2">
                  <div
                    className={`cursor-pointer px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase ${
                      selectedCategory === "all"
                        ? "bg-emerald-600 text-white"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    Tất cả món
                  </div>
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className={`cursor-pointer px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase ${
                        selectedCategory === c.id
                          ? "bg-emerald-600 text-white"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedCategory(c.id)}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          </Col>

          <Col xs={24} md={16}>
            <div className="bg-white rounded-[24px] p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center border-none">
              <Input
                placeholder="Tìm món bạn cần ngay (ví dụ: 'giày', 'áo')..."
                size="large"
                allowClear
                prefix={<SearchOutlined className="text-gray-300" />}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 3, borderRadius: "16px", padding: "0 15px" }}
              />
              <Select
                size="large"
                defaultValue="latest"
                onChange={setSortOrder}
                style={{ flex: 1, minWidth: "150px" }}
                suffixIcon={<SortAscendingOutlined />}
                dropdownStyle={{ borderRadius: "12px" }}
              >
                <Option value="latest">Mới nhất</Option>
                <Option value="price-asc">Giá: Thấp → Cao</Option>
                <Option value="price-desc">Giá: Cao → Thấp</Option>
                <Option value="name-asc">Tên: A → Z</Option>
                <Option value="name-desc">Tên: Z → A</Option>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-40">
                <Spin size="large" />
              </div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {currentProducts.map((p) => (
                    <Col key={p.id} xs={24} sm={12} lg={8}>
                      {/* CẬP NHẬT: Truyền handleBuyNow xuống ProductCard */}
                      <ProductCard
                        product={p}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </Col>
                  ))}
                </Row>
                <div className="mt-12 flex justify-center bg-white p-4 rounded-2xl shadow-sm">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={products.length}
                    onChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-[24px] py-20 text-center shadow-sm">
                <Empty
                  image={
                    <InboxOutlined style={{ fontSize: 60, color: "#d9d9d9" }} />
                  }
                  description={
                    <Space direction="vertical">
                      <Text strong className="text-lg text-slate-600">
                        Không tìm thấy sản phẩm "{searchTerm}"...
                      </Text>
                      <Text type="secondary">
                        Thử từ khóa khác hoặc xóa bộ lọc để xem thêm món mới
                        nhé!
                      </Text>
                      <Button
                        type="primary"
                        className="bg-emerald-600 border-none rounded-lg mt-4"
                        onClick={() => {
                          setSelectedBrand("all");
                          setSelectedCategory("all");
                          setSearchTerm("");
                        }}
                      >
                        Xem tất cả
                      </Button>
                    </Space>
                  }
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Products;
