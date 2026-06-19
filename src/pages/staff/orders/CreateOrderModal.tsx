import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
  Image as AntdImage,
  Tag,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  DeleteOutlined,
  BoxPlotOutlined,
  MailOutlined,
} from "@ant-design/icons";
import staffOrderService from "@/services/staff/orderService";
import checkoutService from "@/services/customer/checkoutService";

const { Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

// --- INTERFACES CHUẨN (XÓA SẠCH ANY) ---
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  unit?: string;
}

interface SelectedItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CreateOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormValues {
  customer_name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export default function CreateOrderModal({
  open,
  onCancel,
  onSuccess,
}: CreateOrderModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await staffOrderService.getProducts();
        // Xử lý dữ liệu trả về dựa trên cấu trúc ApiResponse
        const rawData = res.data as unknown as { data: Product[] } | Product[];
        const actualProducts = Array.isArray(rawData)
          ? rawData
          : rawData.data || [];
        setProducts(actualProducts);
      } catch (error) {
        message.error("Không thể lấy danh sách sản phẩm!");
      }
    };
    if (open) fetchProducts();
  }, [open]);

  const handleAddProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (selectedItems.find((item) => item.product_id === productId)) {
      message.warning("Món này đã có trong danh sách rồi ní ơi!");
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      },
    ]);
  };

  const updateQuantity = (id: number, qty: number | null) => {
    if (qty === null) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.product_id === id ? { ...item, quantity: qty } : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.product_id !== id));
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const onFinish = async (values: FormValues) => {
    if (selectedItems.length === 0) {
      message.error("Ní chưa chọn món nào kìa!");
      return;
    }
    try {
      setLoading(true);

      const payload = {
        order_code: `POS-${Date.now()}`,
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email || `${values.phone}@khachle.com`,
        total_amount: totalAmount,
        payment_method: "cash" as const,
        status: "confirmed",
        order_type: "at_counter",
        notes: values.notes || "Đơn tạo tại quầy",
        items: selectedItems.map((item) => ({
          id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      await checkoutService.storeOrder(payload as any);
      message.success("Đã tạo đơn và xuất kho rực rỡ! 🏆");

      form.resetFields();
      setSelectedItems([]);
      onSuccess();
    } catch (error: unknown) {
      // Ép kiểu lỗi Backend không dùng any
      const err = error as { response?: { data?: { message?: string } } };
      const errorDetail =
        err.response?.data?.message || "Lỗi khi tạo đơn hàng!";
      message.error(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Text className="font-black italic uppercase text-emerald-600 text-xl">
          🔥 Tạo đơn hàng tại quầy
        </Text>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setSelectedItems([]);
        onCancel();
      }}
      footer={null}
      width={800}
      centered
      className="rounded-[2rem] overflow-hidden"
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              name="customer_name"
              label={
                <Text className="font-bold text-[10px] uppercase italic">
                  Tên khách *
                </Text>
              }
              rules={[
                { required: true, message: "Nhập tên khách ní ơi!" },
                { min: 2, message: "Tên ngắn quá vậy ní?" },
                { whitespace: true, message: "Đừng để trống tên nha!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-emerald-500" />}
                placeholder="Ví dụ: Anh Ba Sân 5"
                className="rounded-xl h-10 font-bold"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="phone"
              label={
                <Text className="font-bold text-[10px] uppercase italic">
                  Số điện thoại *
                </Text>
              }
              rules={[
                { required: true, message: "Thiếu SĐT rồi!" },
                {
                  pattern: /^(0)[0-9]{9}$/,
                  message: "SĐT phải 10 số, bắt đầu từ 0!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-emerald-500" />}
                placeholder="09xxx"
                className="rounded-xl h-10 font-bold"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="email"
              label={
                <Text className="font-bold text-[10px] uppercase italic">
                  Email (Nếu có)
                </Text>
              }
              rules={[
                { type: "email", message: "Email sai định dạng rồi ní!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-emerald-500" />}
                placeholder="khach@gmail.com"
                className="rounded-xl h-10 font-bold"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <Text className="font-bold text-[11px] uppercase italic">
              Chọn món rực rỡ
            </Text>
          }
        >
          <Select
            showSearch
            placeholder="Tìm tên sản phẩm (sting, nước suối...)"
            onChange={handleAddProduct}
            className="w-full h-11"
            optionLabelProp="label"
            filterOption={(input, option) =>
              ((option?.label as string) ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id} label={p.name}>
                <div className="flex justify-between items-center py-1">
                  <Space>
                    <AntdImage
                      src={
                        p.image?.startsWith("http")
                          ? p.image
                          : `${STORAGE_URL}${p.image?.replace(/^\//, "")}`
                      }
                      width={35}
                      height={35}
                      preview={false}
                      className="rounded-md object-cover border border-slate-100"
                      fallback="https://placehold.co/35x35?text=SP"
                    />
                    <div>
                      <div className="font-black text-[11px] uppercase leading-none">
                        {p.name}
                      </div>
                      <Text className="text-[10px] text-gray-400 font-bold italic">
                        {p.unit || "Sản phẩm"}
                      </Text>
                    </div>
                  </Space>
                  <Space>
                    <Tag
                      color="green"
                      className="m-0 font-black border-none text-[11px]"
                    >
                      {p.price.toLocaleString()}đ
                    </Tag>
                    <Tag
                      color={p.stock > 5 ? "orange" : "red"}
                      icon={<BoxPlotOutlined />}
                      className="m-0 font-black border-none text-[11px]"
                    >
                      KHO: {p.stock}
                    </Tag>
                  </Space>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="max-h-[300px] overflow-y-auto mb-6 space-y-3 pr-2 custom-scrollbar">
          {selectedItems.map((item) => (
            <div
              key={item.product_id}
              className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all shadow-sm"
            >
              <Space size="middle">
                <AntdImage
                  src={
                    item.image?.startsWith("http")
                      ? item.image
                      : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`
                  }
                  width={50}
                  height={50}
                  className="rounded-xl object-cover shadow-sm border border-white"
                  preview={false}
                />
                <div>
                  <Text className="font-black text-[13px] uppercase block text-slate-700">
                    {item.name}
                  </Text>
                  <Text className="text-[11px] text-emerald-600 font-black italic">
                    {item.price.toLocaleString()}đ
                  </Text>
                </div>
              </Space>
              <Space size="large">
                <InputNumber
                  min={1}
                  value={item.quantity}
                  onChange={(val) => updateQuantity(item.product_id, val)}
                  className="rounded-lg w-16 font-bold"
                />
                <Text className="font-black text-slate-700 w-24 text-right text-base italic">
                  {(item.price * item.quantity).toLocaleString()}đ
                </Text>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(item.product_id)}
                  className="hover:bg-red-50 rounded-full"
                />
              </Space>
            </div>
          ))}
          {selectedItems.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Text className="text-slate-400 italic font-bold uppercase text-[11px]">
                🛒 Giỏ hàng đang trống, chọn món phía trên nha ní!
              </Text>
            </div>
          )}
        </div>

        <div className="bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100 flex justify-between items-center mb-6 shadow-inner">
          <Text className="font-black italic uppercase text-emerald-700 text-lg leading-none">
            Tổng thanh toán:
          </Text>
          <Text className="text-3xl font-black text-red-500 italic tracking-tighter leading-none">
            {totalAmount.toLocaleString()}đ
          </Text>
        </div>

        <Button
          type="primary"
          block
          size="large"
          htmlType="submit"
          loading={loading}
          className="h-16 rounded-2xl font-black italic uppercase bg-emerald-600 border-none shadow-lg text-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ShoppingCartOutlined /> XÁC NHẬN XUẤT KHO & TẠO ĐƠN
        </Button>
      </Form>
    </Modal>
  );
}
