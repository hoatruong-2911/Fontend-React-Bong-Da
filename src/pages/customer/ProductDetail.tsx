import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Tabs,
  Spin,
  Empty,
  Typography,
  Space as AntdSpace,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  BoxPlotOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  StarFilled,
  FireOutlined,
} from "@ant-design/icons";
import customerProductService, {
  Product,
} from "@/services/customer/productService";
import { ProductCard } from "@/components/customer/ProductCard";

const { Text, Title } = Typography;

interface RawDetailResponse {
  id: number;
  name: string;
  price: string | number;
  category?: { id: number; name: string } | string;
  category_id?: number;
  brand?: { name: string } | string;
  image?: string;
  description?: string;
  stock?: string | number;
  unit?: string;
  available?: boolean | number;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  useEffect(() => {
    const fetchFullData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await customerProductService.getProduct(id);
        const rawP = res.data as RawDetailResponse;

        const mappedProduct: Product = {
          id: rawP.id,
          name: rawP.name,
          description: rawP.description,
          price: Number(rawP.price),
          category:
            (typeof rawP.category === "object"
              ? rawP.category?.name
              : rawP.category) || "Món ăn",
          category_id:
            typeof rawP.category === "object"
              ? rawP.category?.id
              : rawP.category_id,
          brand:
            (typeof rawP.brand === "object" ? rawP.brand?.name : rawP.brand) ||
            "Sport Pro",
          image: rawP.image,
          stock: Number(rawP.stock) || 0,
          unit: rawP.unit || "món",
          is_active: Boolean(rawP.available),
        };
        setProduct(mappedProduct);

        const relatedRes = await customerProductService.getProducts({
          category: mappedProduct.category_id || undefined,
        });

        const relatedRaw = (relatedRes.data?.data ||
          relatedRes.data ||
          []) as RawDetailResponse[];
        const mappedRelated = relatedRaw
          .filter((p: RawDetailResponse) => p.id.toString() !== id)
          .slice(0, 4)
          .map(
            (p: RawDetailResponse) =>
              ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                category:
                  (typeof p.category === "object"
                    ? p.category?.name
                    : p.category) || "Món ăn",
                image: p.image,
                stock: Number(p.stock) || 0,
                is_active: true,
              } as Product)
          );

        setRelatedProducts(mappedRelated);
      } catch (error) {
        message.error("Không thể kết nối đến máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(
      (item: { id: number }) => item.id === product.id
    );
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    message.success(`Đã thêm ${quantity} ${product.name} rực rỡ!`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Tạo object sản phẩm mua ngay để truyền đi
    const buyNowItem = {
      id: product.id.toString(),
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: quantity, // Lấy đúng số lượng khách chọn
      category: product.category,
      unit: product.unit,
    };

    // Chuyển hướng sang Checkout và đính kèm dữ liệu này vào state
    // Lưu ý: Không lưu vào localStorage.setItem('cart') để tránh lẫn vào giỏ hàng
    navigate("/checkout", { state: { buyNowItem } });
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Spin size="large" />
        <Text className="mt-4 font-black italic uppercase text-emerald-500 tracking-widest animate-pulse">
          Đang chuẩn bị cực phẩm...
        </Text>
      </div>
    );

  if (!product) return null;

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${STORAGE_URL}${product.image?.replace(/^\//, "")}`;

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 animate-in fade-in duration-700">
      {/* Breadcrumb Section với hiệu ứng Gradient nhẹ */}
      <div className="bg-gradient-to-r from-white via-[#f0f9f6] to-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-5 max-w-7xl">
          <Breadcrumb
            separator=">"
            items={[
              {
                title: (
                  <span
                    className="cursor-pointer hover:text-emerald-600 transition-colors font-medium"
                    onClick={() => navigate("/")}
                  >
                    Trang chủ
                  </span>
                ),
              },
              {
                title: (
                  <span
                    className="cursor-pointer hover:text-emerald-600 transition-colors font-medium"
                    onClick={() => navigate("/products")}
                  >
                    Sản phẩm
                  </span>
                ),
              },
              {
                title: (
                  <span className="text-emerald-700 font-black italic uppercase tracking-wider">
                    {product.name}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/products")}
          className="mb-8 rounded-2xl font-bold border-none bg-white shadow-lg hover:shadow-emerald-100 hover:text-emerald-600 px-6 h-12 flex items-center transition-all"
        >
          Quay lại cửa hàng
        </Button>

        <Row gutter={[64, 64]}>
          {/* CỘT ẢNH: Nổi khối và rực rỡ hơn */}
          <Col xs={24} md={11}>
            <div className="sticky top-10 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-[50px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <Card className="relative border-0 shadow-2xl rounded-[48px] overflow-hidden p-8 bg-white">
                <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#fafcfb] to-white rounded-[36px] overflow-hidden p-6">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-[550px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-110"
                    preview={{
                      mask: (
                        <div className="flex flex-col items-center font-black italic uppercase text-lg">
                          <ThunderboltOutlined className="text-3xl mb-2" />{" "}
                          Phóng to cực phẩm
                        </div>
                      ),
                    }}
                  />
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="px-4 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-[10px] font-black italic text-emerald-600 uppercase tracking-tighter">
                    Hình ảnh thực tế từ Stadium Store
                  </div>
                </div>
              </Card>
            </div>
          </Col>

          {/* CỘT THÔNG TIN: Typo mạnh mẽ, phân cấp rõ ràng */}
          <Col xs={24} md={13}>
            <div className="space-y-8">
              <AntdSpace size="middle">
                <Tag
                  color="green"
                  className="rounded-xl px-5 py-1 font-black uppercase italic border-none shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white m-0"
                >
                  {product.category}
                </Tag>
                <Tag
                  color="orange"
                  icon={<FireOutlined />}
                  className="rounded-xl px-5 py-1 font-black uppercase italic border-none shadow-md bg-gradient-to-r from-orange-500 to-yellow-500 text-white m-0"
                >
                  HOT DEAL
                </Tag>
              </AntdSpace>

              <div>
                <Title
                  level={1}
                  className="!text-6xl !font-black !text-slate-900 !uppercase !italic !tracking-tighter !leading-[1.1] !mb-4"
                >
                  {product.name}
                </Title>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-yellow-50 px-4 py-1 rounded-full border border-yellow-100 shadow-sm">
                    <Rate
                      disabled
                      defaultValue={5}
                      className="text-yellow-500 text-sm"
                      character={<StarFilled />}
                    />
                    <span className="text-yellow-700 font-black italic ml-2 text-xs">
                      5.0
                    </span>
                  </div>
                  <Divider type="vertical" className="h-6 border-gray-200" />
                  <span className="text-gray-400 font-bold italic tracking-wide text-xs">
                    <CrownOutlined className="mr-1" /> 1.5k+ Người đã trải
                    nghiệm
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 rounded-[40px] shadow-2xl shadow-emerald-200 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 opacity-10 text-[120px] text-white font-black italic rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                  BEST
                </div>
                <div className="relative z-10 flex flex-col">
                  <Text className="text-emerald-100 font-black italic uppercase text-xs tracking-[0.3em] mb-2">
                    Giá ưu đãi hôm nay
                  </Text>
                  <div className="flex items-baseline gap-3">
                    <span className="text-7xl font-black text-white italic drop-shadow-lg tracking-tighter">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-emerald-200/70 text-2xl font-black italic uppercase">
                      / {product.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[32px] shadow-xl shadow-gray-100/50 border border-gray-50 relative">
                <div className="absolute top-0 left-10 transform -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-gray-100 shadow-sm">
                  <h3 className="font-black uppercase italic text-emerald-600 m-0 text-xs flex items-center gap-2">
                    <ThunderboltOutlined /> Đặc điểm nổi bật
                  </h3>
                </div>
                <p className="text-slate-600 italic leading-relaxed text-xl font-medium">
                  {product.description ||
                    "Hương vị đẳng cấp, nguyên liệu tinh tuyển mang lại trải nghiệm ẩm thực rực rỡ nhất tại Stadium POS. Đảm bảo gây nghiện ngay lần đầu thưởng thức."}
                </p>
              </div>

              <div className="flex items-center justify-between p-6 bg-[#fcfdfe] rounded-[28px] border border-dashed border-emerald-200">
                <div className="flex flex-col">
                  <span className="font-black uppercase italic text-slate-400 text-[10px] mb-2 tracking-widest">
                    Tùy chọn số lượng
                  </span>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    size="large"
                    className="w-40 rounded-2xl border-none shadow-inner font-black text-lg h-14 flex items-center bg-gray-100/50"
                  />
                </div>
                <div className="text-right">
                  <Tag
                    color="success"
                    className="rounded-full px-5 py-1 font-black italic border-none shadow-sm mb-2"
                  >
                    CÒN HÀNG
                  </Tag>
                  <div className="text-emerald-600 font-black italic text-lg tracking-tighter">
                    {product.stock} cực phẩm sẵn sàng
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined style={{ fontSize: "24px" }} />}
                  onClick={handleAddToCart}
                  className="flex-[2] h-24 rounded-[30px] bg-gradient-to-r from-emerald-500 to-teal-600 border-none font-black italic uppercase shadow-2xl shadow-emerald-200 text-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                >
                  Thêm vào giỏ
                </Button>
                <Button
                  size="large"
                  // CẬP NHẬT: Gọi hàm handleBuyNow vừa viết ở trên
                  onClick={handleBuyNow}
                  className="flex-1 h-24 rounded-[30px] bg-slate-900 text-white border-none font-black italic uppercase shadow-2xl shadow-slate-300 text-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Mua ngay
                </Button>
              </div>

              {/* PHẦN CAM KẾT TIN TƯỞNG - Rực rỡ hơn */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-5 rounded-[28px] bg-white border border-emerald-50 shadow-lg shadow-gray-100/50 flex items-center gap-4 group hover:bg-emerald-50 transition-colors duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:rotate-12 transition-transform">
                    <SafetyCertificateOutlined className="text-2xl" />
                  </div>
                  <div>
                    <div className="font-black italic uppercase text-xs text-slate-800">
                      Cam kết 100%
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      Sạch - Tươi - Đỉnh
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-[28px] bg-white border border-blue-50 shadow-lg shadow-gray-100/50 flex items-center gap-4 group hover:bg-blue-50 transition-colors duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform">
                    <TruckOutlined className="text-2xl" />
                  </div>
                  <div>
                    <div className="font-black italic uppercase text-xs text-slate-800">
                      Giao thần tốc
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      5-10 Phút nhận hàng
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* TAB CHI TIẾT - Custom lại style */}
        <Card className="mt-24 border-0 shadow-2xl rounded-[48px] overflow-hidden bg-white p-4">
          <Tabs
            defaultActiveKey="1"
            centered
            className="px-8 pb-8 custom-modern-tabs"
            items={[
              {
                key: "1",
                label: (
                  <span className="font-black uppercase italic px-10 text-xl tracking-widest py-4 block">
                    Thông số chi tiết
                  </span>
                ),
                children: (
                  <div className="py-12 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        {
                          label: "Phân loại cực phẩm",
                          value: product.category,
                          color: "text-emerald-600",
                        },
                        {
                          label: "Định lượng sản phẩm",
                          value: product.unit,
                          color: "text-slate-800",
                        },
                        {
                          label: "Số lượng sẵn có",
                          value: `${product.stock} đơn vị`,
                          color: "text-slate-800",
                        },
                        {
                          label: "Chứng nhận chất lượng",
                          value: "Stadium Gold Standard",
                          color: "text-blue-600",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-6 border-b border-gray-50 group hover:bg-gray-50/50 px-6 rounded-2xl transition-all"
                        >
                          <span className="text-slate-400 font-black italic uppercase text-sm tracking-widest">
                            {item.label}
                          </span>
                          <span
                            className={`font-black uppercase italic text-lg ${item.color}`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <span className="font-black uppercase italic px-10 text-xl tracking-widest py-4 block">
                    Đánh giá khách hàng
                  </span>
                ),
                children: (
                  <div className="py-32 text-center relative overflow-hidden rounded-[32px]">
                    <div className="absolute inset-0 opacity-5 flex items-center justify-center">
                      <StarFilled className="text-[300px]" />
                    </div>
                    <Text className="relative z-10 italic font-black text-3xl uppercase text-slate-300 tracking-[0.2em]">
                      Đang cập nhật feedback rực rỡ
                    </Text>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* SẢN PHẨM LIÊN QUAN */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-5xl font-black italic uppercase text-slate-900 m-0 tracking-tighter">
                Có thể bạn sẽ thích
              </h2>
              <div className="h-2 w-48 bg-emerald-500 mt-4 rounded-full shadow-lg shadow-emerald-100"></div>
            </div>
            <Button
              type="link"
              onClick={() => navigate("/products")}
              className="font-black italic uppercase text-emerald-600 text-lg hover:text-emerald-700"
            >
              Xem tất cả <ArrowLeftOutlined className="rotate-180 ml-2" />
            </Button>
          </div>

          {relatedProducts.length > 0 ? (
            <Row gutter={[32, 32]}>
              {relatedProducts.map((p) => (
                <Col key={p.id} xs={24} sm={12} lg={6}>
                  <ProductCard
                    product={p}
                    onAddToCart={(prod) =>
                      message.success(`Đã thêm ${prod.name}`)
                    }
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="bg-white rounded-[40px] py-24 text-center border border-gray-100 shadow-xl">
              <Empty
                image={
                  <BoxPlotOutlined className="text-7xl text-slate-200 mb-4" />
                }
                description={
                  <span className="font-black italic uppercase text-slate-300 text-2xl tracking-[0.1em] block mt-4">
                    Hiện chưa có sản phẩm liên quan nào rực rỡ hơn!
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Thêm CSS Custom cho Tabs và Hover */}
      <style>{`
        .custom-modern-tabs .ant-tabs-ink-bar {
          height: 6px !important;
          border-radius: 10px 10px 0 0;
          background: linear-gradient(to right, #10b981, #06b6d4) !important;
        }
        .custom-modern-tabs .ant-tabs-tab-btn {
          color: #94a3b8 !important;
          transition: all 0.3s !important;
        }
        .custom-modern-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #065f46 !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
