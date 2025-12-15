import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Button,
    Tag,
    Row,
    Col,
    Divider,
    Card,
    message,
    Spin,
    Typography
} from "antd";
import {
    EnvironmentOutlined,
    StarFilled,
    CheckCircleOutlined,
    LeftOutlined
} from "@ant-design/icons";
import customerFieldService, { Field } from "../../services/customer/fieldService";

const { Title } = Typography;

const initialField: Field = {
    id: 0,
    name: "",
    size: 0,
    location: "",
    price: 0,
    type: "",
    rating: 0,
    reviews_count: 0,
    available: false,
    is_vip: false,
    surface: "",
    description: "",
    image: "",
    features: [],
};

const STATIC_FEATURES = [
    "Chiếu sáng LED",
    "Cỏ nhân tạo chất lượng cao",
    "Có mái che",
    "Phòng thay đồ",
];

export default function FieldDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fieldId = id ? parseInt(id, 10) : null;

    const [field, setField] = useState<Field>(initialField);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!fieldId) {
            setLoading(false);
            return;
        }

        const fetchFieldDetail = async () => {
            try {
                setLoading(true);
                const response = await customerFieldService.getField(fieldId);
                setField(response.data.data || response.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết sân:", error);
                message.error("Không thể tải thông tin chi tiết sân.");
            } finally {
                setLoading(false);
            }
        };

        fetchFieldDetail();
    }, [fieldId]);

    const handleBook = () => {
        navigate(`/booking?fieldId=${field.id}`);
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <Spin size="large" tip="Đang tải chi tiết sân..." />
            </div>
        );
    }

    if (!field || field.id === 0) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <h2>Không tìm thấy sân</h2>
                <Button type="primary" onClick={() => navigate("/fields")}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const priceFormatted = field.price.toLocaleString("vi-VN");

    return (
        <div
            style={{
                minHeight: "calc(100vh - 200px)",
                paddingBottom: 60,
                backgroundColor: "#f9f9f9",
            }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                {/* TITLE */}
                <div style={{ padding: "20px 0", marginBottom: 20 }}>
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => navigate("/fields")}
                        style={{ color: "#62B462", marginBottom: 12, paddingLeft: 0 }}
                    >
                        Quay lại danh sách sân
                    </Button>

                    <Title
                        level={1}
                        style={{
                            fontSize: 30,
                            fontWeight: 700,
                            margin: 0,
                            color: "#2B2B2B",
                        }}
                    >
                        Sân {field.name} - Sân {field.size} người
                    </Title>

                    {/* Rating + Location */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 20,
                            marginTop: 8,
                        }}
                    >
                        {/* Rating */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                color: "#FFD700",
                            }}
                        >
                            <StarFilled style={{ fontSize: 16 }} />
                            <span style={{ fontWeight: 600 }}>
                                {field.rating.toFixed(1)}
                            </span>
                            <span style={{ color: "#5F5F5F" }}>
                                ({field.reviews_count} đánh giá)
                            </span>
                        </div>

                        {/* Location */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                color: "#5F5F5F",
                            }}
                        >
                            <EnvironmentOutlined />
                            <span>{field.location}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <Row gutter={[32, 32]}>
                    {/* LEFT COLUMN */}
                    <Col xs={24} lg={16}>
                        {/* IMAGE */}
                        <div
                            style={{
                                borderRadius: 12,
                                overflow: "hidden",
                                marginBottom: 24,
                                height: 400,
                            }}
                        >
                            <img
                                src={field.image || `/field-images/${field.size}.jpg`}
                                alt={field.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <Card title="Mô tả" style={{ marginBottom: 24, borderRadius: 12 }}>
                            <p
                                style={{
                                    fontSize: 16,
                                    lineHeight: 1.8,
                                    color: "#2B2B2B",
                                }}
                            >
                                {field.description ||
                                    "Sân bóng có chất lượng cỏ tốt, hệ thống chiếu sáng hiện đại, phù hợp cho các trận đấu buổi tối."}
                            </p>
                        </Card>

                        {/* FEATURES */}
                        <Card title="Tiện nghi" style={{ borderRadius: 12 }}>
                            <Row gutter={[16, 16]}>
                                {STATIC_FEATURES.map((feature, index) => (
                                    <Col xs={24} sm={12} key={index}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                fontSize: 15,
                                            }}
                                        >
                                            <CheckCircleOutlined
                                                style={{ color: "#62B462", fontSize: 18 }}
                                            />
                                            <span>{feature}</span>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>

                    {/* RIGHT COLUMN */}
                    <Col xs={24} lg={8}>
                        <Card
                            bodyStyle={{ padding: 0 }}
                            style={{
                                position: "sticky",
                                top: 100,
                                borderRadius: 12,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div
                                style={{
                                    padding: 24,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                {/* TAGS */}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <Tag color="green" style={{ fontSize: 14, padding: "4px 12px" }}>
                                        {field.size} người
                                    </Tag>

                                    <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                                        {field.surface}
                                    </Tag>

                                    {field.is_vip && (
                                        <Tag color="gold" style={{ fontSize: 14 }}>
                                            VIP
                                        </Tag>
                                    )}
                                </div>

                                {/* PRICE */}
                                <div style={{ paddingTop: 10 }}>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            color: "#5F5F5F",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Giá thuê sân
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "baseline",
                                            gap: 8,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 32,
                                                fontWeight: 700,
                                                color: "#62B462",
                                            }}
                                        >
                                            {priceFormatted}đ
                                        </span>
                                        <span style={{ fontSize: 16, color: "#8E8E8E" }}>/giờ</span>
                                    </div>
                                </div>

                                <Divider style={{ margin: "15px 0" }} />

                                {/* LOCATION */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        color: "#5F5F5F",
                                        fontSize: 16,
                                    }}
                                >
                                    <EnvironmentOutlined style={{ color: "#62B462" }} />
                                    <span>Vị trí: {field.location}</span>
                                </div>

                                <Divider style={{ margin: "15px 0" }} />

                                {/* RATING */}
                                <div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            color: "#5F5F5F",
                                            marginBottom: 8,
                                        }}
                                    >
                                        Đánh giá
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <Tag color="yellow" style={{ fontSize: 16 }}>
                                            <StarFilled /> {field.rating.toFixed(1)}
                                        </Tag>
                                        <span style={{ color: "#8E8E8E" }}>
                                            ({field.reviews_count} đánh giá)
                                        </span>
                                    </div>
                                </div>

                                <Divider style={{ margin: "15px 0" }} />

                                {/* BOOK BUTTON */}
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleBook}
                                    disabled={!field.available}
                                    style={{
                                        height: 50,
                                        fontSize: 18,
                                        fontWeight: 700,
                                        backgroundColor: "#62B462",
                                        borderColor: "#62B462",
                                        marginTop: 10,
                                    }}
                                >
                                    {field.available ? "Đặt sân ngay" : "Đã kín"}
                                </Button>

                                <div
                                    style={{
                                        textAlign: "center",
                                        fontSize: 12,
                                        color: "#8E8E8E",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Đặt cọc 30% để giữ sân
                                    <br />
                                    Hủy trước 4 giờ để được hoàn tiền
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
