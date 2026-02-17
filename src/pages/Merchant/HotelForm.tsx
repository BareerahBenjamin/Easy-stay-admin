import { Button, Card, Form, Input, Select, DatePicker, Upload, message, Rate, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useHotelStore } from '../../store/useHotelStore';
import { useAuthStore } from '../../store/useAuth';
import { Hotel } from '../../types/hotel';
import dayjs from 'dayjs';
import { useState } from 'react';

const HotelForm = () => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const { addHotel, getMerchantHotels, updateHotel } = useHotelStore();
  const myHotels = getMerchantHotels(user!.id);
  const [editingId, setEditingId] = useState<string | null>(null);

  const onFinish = (values: any) => {
    const hotelData: Omit<Hotel, 'id' | 'createdAt' | 'status'> = {
      merchantId: user!.id,
      nameZh: values.nameZh,
      nameEn: values.nameEn,
      address: values.address,
      starLevel: values.starLevel,
      roomTypes: values.roomTypes.map((r: any) => ({ id: Date.now().toString() + Math.random(), ...r })),
      openTime: values.openTime.format('YYYY-MM-DD'),
      images: values.images?.fileList?.map((f: any) => f.thumbUrl || f.response?.url) || [],
      nearby: values.nearby,
      discounts: values.discounts,
      status: 'auditing',
    };

    if (editingId) {
      updateHotel(editingId, { ...hotelData, status: 'auditing' });
      message.success('修改成功，已重新进入审核');
    } else {
      addHotel(hotelData);
      message.success('提交成功，等待管理员审核');
    }
    form.resetFields();
    setEditingId(null);
  };

  const editHotel = (hotel: Hotel) => {
    form.setFieldsValue({
      ...hotel,
      openTime: dayjs(hotel.openTime),
      roomTypes: hotel.roomTypes,
    });
    setEditingId(hotel.id);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title={editingId ? '编辑酒店' : '新增酒店'}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="nameZh" label="酒店中文名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="nameEn" label="酒店英文名"><Input /></Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="starLevel" label="星级" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="openTime" label="开业时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {/* 动态房型 */}
          <Form.List name="roomTypes">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Card key={field.key} style={{ marginBottom: 16 }}>
                    <Form.Item {...field} name={[field.name, 'name']} label="房型名称" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'price']} label="价格" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'discount']} label="折扣(可选)">
                      <InputNumber min={0.1} max={1} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(field.name)}>删除房型</Button>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>添加房型</Button>
              </>
            )}
          </Form.List>

          <Form.Item name="nearby" label="附近景点/交通"><Input.TextArea /></Form.Item>
          <Form.Item name="discounts" label="优惠信息"><Input.TextArea placeholder="如：节日8折" /></Form.Item>

          <Form.Item name="images" label="酒店图片">
            <Upload listType="picture-card" beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const url = e.target?.result as string;
                form.setFieldValue('images', { fileList: [...(form.getFieldValue('images')?.fileList || []), { thumbUrl: url }] });
              };
              reader.readAsDataURL(file);
              return false;
            }}>
              <div>+ 上传</div>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large">
            {editingId ? '保存修改' : '提交审核'}
          </Button>
        </Form>
      </Card>

      {/* 我的酒店列表 */}
      <Card title="我的酒店" style={{ marginTop: 24 }}>
        {myHotels.map(h => (
          <Card key={h.id} style={{ marginBottom: 16 }}>
            <h3>{h.nameZh}</h3>
            <p>状态：{h.status === 'auditing' ? '审核中' : h.status}</p>
            <Button onClick={() => editHotel(h)}>编辑</Button>
          </Card>
        ))}
      </Card>
    </div>
  );
};

export default HotelForm;