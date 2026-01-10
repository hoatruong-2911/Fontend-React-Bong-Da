import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Input,
  Select,
  Row,
  Col,
  Empty,
  message,
  Spin,
  Typography,
  Space,
  Button,
  Card,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ThunderboltOutlined,
  SortAscendingOutlined,
  FireOutlined,
} from "@ant-design/icons";
import FieldCard from "@/components/customer/FieldCard";
import customerFieldService, {
  Field,
} from "../../services/customer/fieldService";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function Fields() {
  // --- STATES ---
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6; // Yêu cầu hiển thị 6 sân mỗi trang

  const [searchText, setSearchText] = useState("");
  const [filterSize, setFilterSize] = useState<string>("all");
  const [filterSurface, setFilterSurface] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  // --- LOGIC LỌC VÀ SẮP XẾP ---
  const filteredFields = useMemo(() => {
    return fields
      .filter((field) => {
        const matchSearch =
          field.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (field.description || "")
            .toLowerCase()
            .includes(searchText.toLowerCase());
        const sizeValue =
          filterSize !== "all" ? parseInt(filterSize, 10) : null;
        const matchSize = filterSize === "all" || field.size === sizeValue;
        const matchSurface =
          filterSurface === "all" || field.surface === filterSurface;
        return matchSearch && matchSize && matchSurface;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [fields, searchText, filterSize, filterSurface, sortBy]);

  // --- LOGIC PHÂN TRANG (PAGINATION) ---
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredFields.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredFields]);

  // Reset về trang 1 khi thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterSize, filterSurface, sortBy]);

  // --- API HANDLER ---
  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerFieldService.getFields();
      const fieldsArray = response.data?.data || response.data;
      if (Array.isArray(fieldsArray)) {
        setFields(fieldsArray);
      } else {
        setFields([]);
      }
    } catch (error) {
      message.error("Lỗi tải danh sách sân rực rỡ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return (
    <div className="min-h-screen bg-[#f1f5f3] pb-24 font-sans animate-in fade-in duration-700">
      {/* ================= HERO SECTION (STYLE RỰC RỠ) ================= */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "#064e3b",
          padding: "100px 0 160px",
          color: "#fff",
        }}
      >
        {/* Glow Effects từ ảnh mẫu */}
        <div
          className="absolute"
          style={{
            top: "10%",
            right: "5%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(6, 78, 59, 0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "10%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(6, 78, 59, 0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute border-[40px] border-emerald-400/10 rounded-full"
          style={{
            top: "20%",
            right: "15%",
            width: "180px",
            height: "180px",
            filter: "blur(2px)",
          }}
        />

        <div className="container mx-auto px-10 relative z-10">
          <Text className="text-emerald-400 font-black uppercase tracking-[0.3em] mb-4 block text-sm italic">
            Wesport Field List:
          </Text>
          <Title className="!text-white !text-6xl !font-black !italic !uppercase !mb-4 !tracking-tighter">
            Danh sách sân bóng <br />
            <span className="text-[#fbbf24] drop-shadow-md">Đỉnh cao</span>
          </Title>
          <Paragraph className="text-emerald-50/80 text-lg font-medium max-w-xl mb-10 italic">
            Tất cả sân đạt tiêu chuẩn FIFA, được quản lý rực rỡ bởi hệ thống
            chuyên nghiệp.
          </Paragraph>
          <div className="w-20 h-2 bg-[#fbbf24] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
        </div>
      </div>

      <div className="container mx-auto px-10" style={{ marginTop: "-80px" }}>
        {/* ================= BỘ LỌC (GLASSMORPHISM CARD) ================= */}
        <Card
          className="shadow-2xl border-none p-6 relative z-20"
          style={{
            borderRadius: 24,
            background: "rgba(255, 255, 255, 0.98)",
          }}
        >
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg shadow-emerald-200">
                <ThunderboltOutlined style={{ fontSize: 20 }} />
              </div>
              <Title
                level={3}
                className="!m-0 !font-black !italic !uppercase !text-slate-800 tracking-tight"
              >
                Danh sách sân bóng đỉnh cao
              </Title>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end min-w-[300px]">
              <Input
                placeholder="Tìm tên sân hoặc mô tả..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="max-w-xs rounded-full border-gray-100 bg-gray-50 h-11 font-bold italic"
                prefix={<SearchOutlined className="text-emerald-500" />}
              />
              <Button
                type="primary"
                className="h-11 px-8 rounded-full bg-emerald-700 border-none font-black italic shadow-lg uppercase text-xs"
              >
                Lọc ngay
              </Button>
            </div>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <div className="bg-[#f8faf9] p-4 rounded-2xl border border-emerald-50">
                <Text className="text-[10px] font-black italic uppercase text-emerald-600/50 block mb-2 tracking-widest">
                  Quy mô sân
                </Text>
                <Select
                  size="large"
                  value={filterSize}
                  onChange={setFilterSize}
                  className="w-full custom-select-v2"
                >
                  <Option value="all">Tất cả quy mô</Option>
                  <Option value="5">Sân 5 người (GOW)</Option>
                  <Option value="7">Sân 7 người (PRO)</Option>
                  <Option value="11">Sân 11 người (STAR)</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="bg-[#f8faf9] p-4 rounded-2xl border border-emerald-50">
                <Text className="text-[10px] font-black italic uppercase text-emerald-600/50 block mb-2 tracking-widest">
                  Mặt sân
                </Text>
                <Select
                  size="large"
                  value={filterSurface}
                  onChange={setFilterSurface}
                  className="w-full custom-select-v2"
                >
                  <Option value="all">Mọi loại cỏ</Option>
                  <Option value="Cỏ nhân tạo">Cỏ nhân tạo</Option>
                  <Option value="Cỏ tự nhiên">Cỏ tự nhiên</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="bg-[#f8faf9] p-4 rounded-2xl border border-emerald-50">
                <Text className="text-[10px] font-black italic uppercase text-emerald-600/50 block mb-2 tracking-widest">
                  Sắp xếp
                </Text>
                <Select
                  size="large"
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full custom-select-v2"
                >
                  <Option value="default">Mặc định</Option>
                  <Option value="price-asc">Giá tăng dần</Option>
                  <Option value="price-desc">Giá giảm dần</Option>
                  <Option value="rating">Đánh giá cao nhất</Option>
                </Select>
              </div>
            </Col>
          </Row>
        </Card>

        {/* ================= GRID KẾT QUẢ ================= */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-8 ml-2">
            <FireOutlined className="text-orange-500 text-2xl animate-pulse" />
            <Text className="text-xl font-black italic uppercase text-slate-700">
              Kết quả tìm thấy:{" "}
              <span className="text-emerald-600 text-3xl">
                {filteredFields.length}
              </span>{" "}
              sân bóng
            </Text>
          </div>

          {loading ? (
            <div className="py-40 text-center">
              <Spin
                size="large"
                tip={
                  <span className="font-bold italic text-emerald-600 block mt-4">
                    Đang chuẩn bị sân bãi...
                  </span>
                }
              />
            </div>
          ) : filteredFields.length > 0 ? (
            <>
              <Row gutter={[28, 28]}>
                {currentTableData.map((field) => (
                  <Col xs={24} sm={12} lg={8} key={field.id}>
                    <div className="hover:scale-[1.03] transition-transform duration-500 h-full">
                      <FieldCard field={field} />
                    </div>
                  </Col>
                ))}
              </Row>

              {/* PHÂN TRANG RỰC RỠ */}
              <div className="mt-16 flex justify-center">
                <div className="bg-white px-6 py-4 rounded-[32px] shadow-2xl border border-emerald-50">
                  <Pagination
                    current={currentPage}
                    total={filteredFields.length}
                    pageSize={pageSize}
                    onChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              </div>
            </>
          ) : (
            <Card className="rounded-[40px] border-none shadow-xl bg-white py-24 text-center">
              <Empty
                description={
                  <Text className="text-2xl font-black italic uppercase text-gray-300">
                    Không tìm thấy sân nào rực rỡ!
                  </Text>
                }
              />
            </Card>
          )}
        </div>
      </div>

      <style>{`
        .custom-select-v2 .ant-select-selector {
          background: transparent !important; border: none !important; box-shadow: none !important;
          font-weight: 800 !important; font-style: italic !important; text-transform: uppercase !important;
          padding: 0 !important; color: #064e3b !important;
        }
        .ant-select-selection-item { font-size: 15px !important; color: #064e3b !important; }
        .custom-pagination .ant-pagination-item-active { border-color: #059669 !important; background: #059669 !important; }
        .custom-pagination .ant-pagination-item-active a { color: #fff !important; }
        .custom-pagination .ant-pagination-item:hover { border-color: #059669 !important; }
        .custom-pagination .ant-pagination-item:hover a { color: #059669 !important; }
      `}</style>
    </div>
  );
}
