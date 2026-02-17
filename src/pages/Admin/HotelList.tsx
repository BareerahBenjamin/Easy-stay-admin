import { Table, Button, Modal, Input, message, Tag } from 'antd';
import { useHotelStore } from '../../store/useHotelStore';
import { Hotel, HotelStatus } from '../../types/hotel';
import { useState } from 'react';

const HotelListAdmin = () => {
  const { getAllHotels, updateHotel } = useHotelStore();
  const [data] = useState(getAllHotels);
  const [rejectModal, setRejectModal] = useState<Hotel | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleStatus = (id: string, status: HotelStatus, reason?: string) => {
    updateHotel(id, { status, ...(reason && { rejectReason: reason }) });
    message.success(`操作成功 → ${status}`);
    setRejectModal(null);
    setRejectReason('');
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
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>酒店审核/发布/下线</h2>
      <Table columns={columns} dataSource={getAllHotels()} rowKey="id" />

      <Modal
        title="拒绝原因"
        open={!!rejectModal}
        onOk={() => rejectModal && handleStatus(rejectModal.id, 'rejected', rejectReason)}
        onCancel={() => setRejectModal(null)}
      >
        <Input.TextArea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="请输入拒绝原因" />
      </Modal>
    </div>
  );
};

export default HotelListAdmin;