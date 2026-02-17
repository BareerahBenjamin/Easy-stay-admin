import { Table, Button, Modal, Input, message, Tag, Descriptions, Divider, Image } from 'antd';
import { useHotelStore } from '../../store/useHotelStore';
import { Hotel, HotelStatus } from '../../types/hotel';
import { useState } from 'react';

const HotelListAdmin = () => {
  const { getAllHotels, updateHotel } = useHotelStore();
  const hotels = getAllHotels();  // 直接获取所有酒店数据
  const [rejectModal, setRejectModal] = useState<Hotel | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const handleStatus = (id: string, status: HotelStatus, reason?: string) => {
    updateHotel(id, { status, ...(reason && { rejectReason: reason }) });
    message.success(`操作成功 → ${status}`);
    setRejectModal(null);
    setRejectReason('');
  };

  const showHotelDetail = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setDetailVisible(true);
  };

  const columns = [
    { title: '酒店名', dataIndex: 'nameZh', key: 'nameZh' },
    { title: '商户ID', dataIndex: 'merchantId', key: 'merchantId' },
    { title: '星级', dataIndex: 'starLevel', key: 'starLevel' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: HotelStatus) => <Tag color={s === 'published' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>{s}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Hotel) => (
        <>
          {record.status === 'auditing' && (
            <>
              <Button type="link" onClick={() => handleStatus(record.id, 'approved')}>通过</Button>
              <Button type="link" danger onClick={() => setRejectModal(record)}>拒绝</Button>
            </>
          )}
          {record.status === 'approved' && <Button type="link" onClick={() => handleStatus(record.id, 'published')}>发布</Button>}
          {(record.status === 'published' || record.status === 'approved') && (
            <Button type="link" danger onClick={() => handleStatus(record.id, 'offline')}>下线</Button>
          )}
          {record.status === 'rejected' && <span>原因：{record.rejectReason}</span>}
          {record.status === 'offline' && <Button type="link" onClick={() => handleStatus(record.id, 'approved')}>恢复</Button>}
          <Button type="link" onClick={() => showHotelDetail(record)}>查看详情</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>酒店审核/发布/下线</h2>
      <Table columns={columns} dataSource={hotels} rowKey="id" />

      {/* 拒绝原因 Modal */}
      <Modal
        title="拒绝原因"
        open={!!rejectModal}
        onOk={() => rejectModal && handleStatus(rejectModal.id, 'rejected', rejectReason)}
        onCancel={() => setRejectModal(null)}
      >
        <Input.TextArea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="请输入拒绝原因" />
      </Modal>

      {/* 酒店详情 Modal */}
      <Modal
        title={selectedHotel ? `${selectedHotel.nameZh} (${selectedHotel.nameEn || '无英文名'}) - 详细信息` : ''}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        {selectedHotel && (
          <div style={{ padding: '16px 0' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="酒店中文名">{selectedHotel.nameZh}</Descriptions.Item>
              <Descriptions.Item label="酒店英文名">{selectedHotel.nameEn || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址">{selectedHotel.address}</Descriptions.Item>
              <Descriptions.Item label="星级">{selectedHotel.starLevel} 星</Descriptions.Item>
              <Descriptions.Item label="开业时间">{selectedHotel.openTime}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedHotel.status === 'published' ? 'green' : selectedHotel.status === 'rejected' ? 'red' : 'orange'}>
                  {selectedHotel.status}
                </Tag>
              </Descriptions.Item>
              {selectedHotel.rejectReason && (
                <Descriptions.Item label="拒绝原因" span={2}>
                  {selectedHotel.rejectReason}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>房型信息</Divider>
            <Table
              dataSource={selectedHotel.roomTypes}
              pagination={false}
              columns={[
                { title: '房型名称', dataIndex: 'name' },
                { title: '价格 (元)', dataIndex: 'price' },
                { title: '折扣', dataIndex: 'discount', render: (v) => v ? `${(v * 100).toFixed(0)}折` : '-' },
              ]}
              rowKey="id"
            />

            <Divider>其他信息</Divider>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="附近景点/交通">{selectedHotel.nearby || '-'}</Descriptions.Item>
              <Descriptions.Item label="优惠信息">{selectedHotel.discounts || '-'}</Descriptions.Item>
            </Descriptions>

            {selectedHotel.images?.length > 0 && (
              <>
                <Divider>酒店图片</Divider>
                <Image.PreviewGroup>
                  {selectedHotel.images.map((img, idx) => (
                    <Image key={idx} width={200} src={img} style={{ marginRight: 8, marginBottom: 8 }} />
                  ))}
                </Image.PreviewGroup>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HotelListAdmin;