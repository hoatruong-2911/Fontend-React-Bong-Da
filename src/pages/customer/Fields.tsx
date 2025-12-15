import { useState, useEffect, useCallback } from "react";
import { Input, Select, Row, Col, Empty, message, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import FieldCard from "@/components/customer/FieldCard";
// import { Field } from "@/services/customer/fieldService";
import customerFieldService, {
  Field,
} from "../../services/customer/fieldService"; //

// import customerFieldService, { Field } from "../../services/customer/fieldService";

const { Option } = Select;

export default function Fields() {
  // State quản lý dữ liệu và trạng thái
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false); // State quản lý Filters

  const [searchText, setSearchText] = useState("");
  const [filterSize, setFilterSize] = useState<string>("all");
  const [filterSurface, setFilterSurface] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default"); // 1. Logic lọc + sắp xếp dữ liệu đã tải xuống

  const filteredFields = fields
    .filter((field) => {
      const matchSearch =
        field.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (field.description || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()); // Chuyển filterSize -> number

      const sizeValue = filterSize !== "all" ? parseInt(filterSize, 10) : null;
      // 🛑 FIX: Đảm bảo field.size là number
      const matchSize = filterSize === "all" || field.size === sizeValue; // Lọc theo mặt sân

      const matchSurface =
        filterSurface === "all" || field.surface === filterSurface;

      return matchSearch && matchSize && matchSurface;
    })
    .sort((a, b) => {
      // ⬅️ FIX: SỬ DỤNG field.price (ĐÃ SỬA LỖI CÚ PHÁP)
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    }); // 2. Hàm gọi API tải dữ liệu

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerFieldService.getFields();

      // ⬅️ FIX TRIỆT ĐỂ: SỬA LỖI fields.filter is not a function
      // Trích xuất mảng sân bóng từ key 'data' của Laravel Response
      const fieldsArray = response.data?.data || response.data; // Dùng .data.data nếu có, ngược lại dùng .data

      // Khởi tạo fields với một mảng (nếu fieldsArray không phải array)
      if (Array.isArray(fieldsArray)) {
        setFields(fieldsArray);
      } else {
        // Xử lý trường hợp API trả về object rỗng hoặc cấu trúc sai
        setFields([]);
        if (response.data && response.data.success === true) {
          // API thành công nhưng không có mảng data (vd: API trả về {success: true, data: {}})
          console.warn(
            "API returned success but data array is missing/not array:",
            response.data
          );
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh sách sân:", error);
      message.error("Không thể tải danh sách sân từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);
  // 3. Tải dữ liệu khi component mount
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return (
    <div style={{ minHeight: "calc(100vh - 200px)" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #62B462 0%, #4A9D4A 100%)",
          padding: "60px 0",
          marginBottom: 40,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>
          Danh Sách Sân Bóng
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9 }}>
          Chọn sân phù hợp cho trận đấu của bạn
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
        {/* Bộ lọc */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: 24,
            borderRadius: 12,
            marginBottom: 32,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Row gutter={[16, 16]}>
            {/* Search */}
            <Col xs={24} md={12}>
              <Input
                size="large"
                placeholder="Tìm kiếm sân..."
                prefix={<SearchOutlined style={{ color: "#8E8E8E" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Col>

            {/* Filter size */}
            <Col xs={24} sm={8} md={4}>
              <Select
                size="large"
                value={filterSize}
                onChange={setFilterSize}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="5">Sân 5 người</Option>
                <Option value="7">Sân 7 người</Option>
                <Option value="11">Sân 11 người</Option>
              </Select>
            </Col>

            {/* Filter surface */}
            <Col xs={24} sm={8} md={4}>
              <Select
                size="large"
                value={filterSurface}
                onChange={setFilterSurface}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả mặt sân</Option>
                <Option value="Cỏ nhân tạo">Cỏ nhân tạo</Option>
                <Option value="Cỏ tự nhiên">Cỏ tự nhiên</Option>
                <Option value="Sàn gỗ chuyên dụng">Sàn gỗ chuyên dụng</Option>
              </Select>
            </Col>

            {/* Sort */}
            <Col xs={24} sm={8} md={4}>
              <Select
                size="large"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: "100%" }}
              >
                <Option value="default">Mặc định</Option>
                <Option value="price-asc">Giá thấp đến cao</Option>
                <Option value="price-desc">Giá cao đến thấp</Option>
                <Option value="rating">Đánh giá cao nhất</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Số kết quả */}
        <div style={{ marginBottom: 24, color: "#5F5F5F", fontSize: 16 }}>
          Tìm thấy <strong>{filteredFields.length}</strong> sân bóng
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" tip="Đang tải danh sách sân..." />
          </div>
        ) : filteredFields.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredFields.map((field) => (
              <Col xs={24} sm={12} lg={8} key={field.id}>
                <FieldCard field={field} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="Không tìm thấy sân phù hợp"
            style={{ padding: "60px 0" }}
          />
        )}
      </div>
    </div>
  );
}
