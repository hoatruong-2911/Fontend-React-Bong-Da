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
              }) as Product,
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
      (item: { id: number }) => item.id === product.id,
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
    <div className="min-h-screen bg-[#fcfdfe] pb-16 md:pb-24 animate-in fade-in duration-700">
      {/* Breadcrumb Section với hiệu ứng Gradient nhẹ */}
      <div className="bg-gradient-to-r from-white via-[#f0f9f6] to-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 max-w-7xl">
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

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/products")}
          className="mb-4 md:mb-6 rounded-xl font-bold border-none bg-white shadow-md hover:shadow-emerald-50 hover:text-emerald-600 px-5 h-10 flex items-center transition-all"
        >
          Quay lại cửa hàng
        </Button>

        <Row gutter={[24, 24]}>
          {/* CỘT ẢNH: Nổi khối và rực rỡ hơn */}
          <Col xs={24} md={11}>
            <div className="sticky top-10 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-3xl md:rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <Card className="relative border-0 shadow-xl rounded-3xl md:rounded-[36px] overflow-hidden bg-white">
                <div className="aspect-square w-full relative bg-[#fafcfb] flex items-center justify-center overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    preview={{
                      mask: (
                        <div className="flex flex-col items-center font-black italic uppercase text-lg text-white">
                          <ThunderboltOutlined className="text-3xl mb-2 text-emerald-400" />{" "}
                          Phóng to cực phẩm
                        </div>
                      ),
                    }}
                  />
                </div>
                <div className="py-4 flex justify-center bg-white border-t border-gray-50">
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
              <div className="flex flex-wrap gap-3">
                <span className="rounded-xl px-5 py-2 font-black uppercase italic text-xs shadow-md bg-gradient-to-r from-emerald-600 to-teal-500 text-white leading-none">
                  {product.category}
                </span>
                <span className="rounded-xl px-5 py-2 font-black uppercase italic text-xs shadow-md bg-gradient-to-r from-orange-600 to-amber-500 text-white leading-none flex items-center gap-1">
                  <FireOutlined className="text-[11px]" /> HOT DEAL
                </span>
              </div>

              <div>
                <Title
                  level={1}
                  className="!text-3xl md:!text-4xl lg:!text-5xl !font-black !text-slate-900 !uppercase !italic !tracking-tighter !leading-[1.15] !mb-3"
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

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 md:p-8 rounded-3xl shadow-xl shadow-emerald-100 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 opacity-10 text-[80px] md:text-[120px] text-white font-black italic rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                  BEST
                </div>
                <div className="relative z-10 flex flex-col">
                  <Text className="text-emerald-100 font-black italic uppercase text-[10px] tracking-[0.3em] mb-1">
                    Giá ưu đãi hôm nay
                  </Text>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white italic drop-shadow-lg tracking-tighter">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-emerald-200/70 text-lg md:text-xl font-black italic uppercase">
                      / {product.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 bg-white rounded-2xl md:rounded-[28px] shadow-lg shadow-gray-50 border border-gray-50 relative">
                <div className="absolute top-0 left-6 transform -translate-y-1/2 bg-white px-3 py-0.5 rounded-full border border-gray-100 shadow-sm">
                  <h3 className="font-black uppercase italic text-emerald-600 m-0 text-[10px] md:text-xs flex items-center gap-1.5">
                    <ThunderboltOutlined /> Đặc điểm nổi bật
                  </h3>
                </div>
                <p className="text-slate-600 italic leading-relaxed text-base md:text-lg font-medium">
                  {product.description ||
                    "Hương vị đẳng cấp, nguyên liệu tinh tuyển mang lại trải nghiệm ẩm thực rực rỡ nhất tại Stadium POS. Đảm bảo gây nghiện ngay lần đầu thưởng thức."}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 md:p-5 bg-[#fcfdfe] rounded-2xl border border-dashed border-emerald-200 gap-4">
                <div className="flex flex-col">
                  <span className="font-black uppercase italic text-slate-400 text-[9px] mb-1.5 tracking-widest">
                    Tùy chọn số lượng
                  </span>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    size="large"
                    className="w-32 md:w-40 rounded-xl md:rounded-2xl border-none shadow-inner font-black text-base md:text-lg h-10 md:h-12 flex items-center bg-gray-100/50"
                  />
                </div>
                <div className="text-right">
                  <Tag
                    color="success"
                    className="rounded-full px-4 py-0.5 font-black italic border-none shadow-sm mb-1 text-[10px] md:text-xs"
                  >
                    CÒN HÀNG
                  </Tag>
                  <div className="text-emerald-600 font-black italic text-sm md:text-lg tracking-tighter">
                    {product.stock} cực phẩm sẵn sàng
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
                  onClick={handleAddToCart}
                  className="flex-[2] h-14 md:h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none font-black italic uppercase shadow-lg shadow-emerald-100 text-lg md:text-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                >
                  Thêm vào giỏ
                </Button>
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-900 text-white border-none font-black italic uppercase shadow-lg shadow-slate-300 text-sm md:text-base hover:bg-black hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Mua ngay
                </Button>
              </div>

              {/* PHẦN CAM KẾT TIN TƯỞNG - Rực rỡ hơn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-emerald-50 shadow-md flex items-center gap-3 group hover:bg-emerald-50 transition-colors duration-500">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                    <SafetyCertificateOutlined className="text-xl" />
                  </div>
                  <div>
                    <div className="font-black italic uppercase text-[11px] text-slate-800">
                      Cam kết 100%
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      Sạch - Tươi - Đỉnh
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-blue-50 shadow-md flex items-center gap-3 group hover:bg-blue-50 transition-colors duration-500">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                    <TruckOutlined className="text-xl" />
                  </div>
                  <div>
                    <div className="font-black italic uppercase text-[11px] text-slate-800">
                      Giao thần tốc
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      5-10 Phút nhận hàng
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* TAB CHI TIẾT - Custom lại style */}
        <Card className="mt-16 border-0 shadow-xl rounded-3xl md:rounded-[36px] overflow-hidden bg-white p-2 md:p-4">
          <Tabs
            defaultActiveKey="1"
            centered
            className="px-4 md:px-8 pb-8 custom-modern-tabs"
            items={[
              {
                key: "1",
                label: (
                  <span className="font-black uppercase italic px-4 md:px-8 text-base md:text-lg tracking-widest py-3 block">
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
                  <span className="font-black uppercase italic px-4 md:px-8 text-base md:text-lg tracking-widest py-3 block">
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
        <div className="mt-16 md:mt-24">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase text-slate-900 m-0 tracking-tighter">
                Có thể bạn sẽ thích
              </h2>
              <div className="h-1.5 w-32 bg-emerald-500 mt-3 rounded-full shadow-md shadow-emerald-50"></div>
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
            <Row gutter={[24, 40]}>
              {" "}
              {/* ✅ Chỉnh lại gutter cho thoáng và đều */}
              {relatedProducts.map((p) => (
                <Col key={p.id} xs={24} sm={12} lg={6}>
                  <ProductCard
                    product={p}
                    // ✅ CẬP NHẬT: Logic thêm giỏ hàng đúng chuẩn
                    onAddToCart={() => {
                      const cartKey = localStorage.getItem("user")
                        ? `cart_user_${JSON.parse(localStorage.getItem("user")!).id}`
                        : "cart_guest";
                      const currentCart = JSON.parse(
                        localStorage.getItem(cartKey) || "[]",
                      );
                      const exist = currentCart.find((i: any) => i.id === p.id);
                      if (exist) exist.quantity += 1;
                      else currentCart.push({ ...p, quantity: 1 });
                      localStorage.setItem(
                        cartKey,
                        JSON.stringify(currentCart),
                      );
                      window.dispatchEvent(new Event("storage"));
                      message.success(`Đã thêm ${p.name} vào giỏ hàng!`);
                    }}
                    // ✅ CẬP NHẬT: Logic Mua ngay cực cháy
                    onBuyNow={() => {
                      const buyNowItem = {
                        id: p.id.toString(),
                        name: p.name,
                        image: p.image,
                        price: p.price,
                        quantity: 1,
                        category: p.category,
                        unit: p.unit,
                      };
                      navigate("/checkout", { state: { buyNowItem } });
                    }}
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
