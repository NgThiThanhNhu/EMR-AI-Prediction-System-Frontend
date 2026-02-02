import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminProfile.module.scss';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  // --- State cho tính năng 2FA ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Dữ liệu giả lập
  const adminInfo = {
    name: 'Nguyễn Văn An',
    role: 'Super Admin (Quản trị cấp cao)',
    department: 'Phòng Công Nghệ Thông Tin',
    email: 'admin.system@benhvien.com',
    phone: '0909.123.456',
    lastLogin: '22/01/2026 - 08:30 AM',
    ip: '192.168.1.10'
  };

  const activityLogs = [
    { id: 1, action: 'Phê duyệt tài khoản Bác sĩ Trần Văn B', time: '10:30 AM - Hôm nay' },
    { id: 2, action: 'Xóa danh mục thuốc hết hạn', time: '09:15 AM - Hôm nay' },
    { id: 3, action: 'Thay đổi cấu hình hệ thống khám bệnh', time: '16:45 PM - Hôm qua' },
    { id: 4, action: 'Đăng nhập từ thiết bị lạ (Cảnh báo)', time: '02:00 AM - 20/01/2026', type: 'warning' },
  ];

  // --- Logic 2FA ---
  const handleEnable2FA = () => {
    // Giả lập link QR Code
    const fakeSecret = "JBSWY3DPEHPK3PXP"; 
    const fakeAccount = "Admin:admin@medical-ecosystem.com";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${fakeAccount}?secret=${fakeSecret}&issuer=MedicalEcosystem`;
    
    setQrCodeUrl(qrUrl);
    setShow2FAModal(true);
  };

  const handleVerifyOTP = () => {
    if (otpCode.length === 6) {
      alert('✅ Kích hoạt bảo mật 2 lớp thành công!');
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      setOtpCode('');
    } else {
      alert('⚠️ Vui lòng nhập đủ 6 số từ ứng dụng Authenticator');
    }
  };

  const handleDisable2FA = () => {
    if(window.confirm("Bạn có chắc muốn tắt bảo mật 2 lớp? Tài khoản sẽ kém an toàn hơn.")) {
      setIs2FAEnabled(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. NÚT QUAY LẠI */}
      <button className={styles.backBtn} onClick={() => navigate('/admin')}>
        <span className={styles.arrowIcon}>←</span> Quay lại trang chủ
      </button>

      {/* 2. LAYOUT 2 CỘT */}
      <div className={styles.profileLayout}>
        
        {/* CỘT TRÁI */}
        <div className={styles.leftColumn}>
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>A</div>
              <div className={styles.onlineBadge}></div>
            </div>
            <h2 className={styles.userName}>{adminInfo.name}</h2>
            <p className={styles.userRole}>System Admin</p>
            <div className={styles.infoBadge}>🛡️ Bảo mật cấp cao</div>
          </div>

          <nav className={styles.menuNav}>
            <button 
              className={`${styles.menuItem} ${activeTab === 'general' ? styles.active : ''}`}
              onClick={() => setActiveTab('general')}
            >
              👤 Thông tin chung
            </button>
            <button 
              className={`${styles.menuItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔐 Bảo mật & 2FA
            </button>
            <button 
              className={`${styles.menuItem} ${activeTab === 'logs' ? styles.active : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              📜 Nhật ký hoạt động
            </button>
          </nav>
        </div>

        {/* CỘT PHẢI */}
        <div className={styles.rightColumn}>
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Thông tin quản trị viên</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Họ và tên</label>
                  <input type="text" defaultValue={adminInfo.name} />
                </div>
                <div className={styles.formGroup}>
                  <label>Chức vụ / Quyền hạn</label>
                  <input type="text" defaultValue={adminInfo.role} disabled className={styles.readOnly} />
                </div>
                <div className={styles.formGroup}>
                  <label>Phòng ban</label>
                  <input type="text" defaultValue={adminInfo.department} disabled className={styles.readOnly} />
                </div>
                <div className={styles.formGroup}>
                  <label>Email hệ thống</label>
                  <input type="text" defaultValue={adminInfo.email} disabled className={styles.readOnly} />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại liên hệ</label>
                  <input type="text" defaultValue={adminInfo.phone} />
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.saveBtn}>Lưu thay đổi</button>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Cài đặt bảo mật</h3>
              
              <div className={styles.securitySection}>
                <div className={styles.secHeader}>
                  <h4>Đổi mật khẩu</h4>
                  <p>Nên thay đổi mật khẩu 3 tháng/lần để đảm bảo an toàn.</p>
                </div>
                <div className={styles.passwordGrid}>
                  <input type="password" placeholder="Mật khẩu hiện tại" />
                  <input type="password" placeholder="Mật khẩu mới" />
                  <input type="password" placeholder="Nhập lại mật khẩu mới" />
                  <button className={styles.changePassBtn}>Cập nhật</button>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.securityRow}>
                <div>
                  <h4>Xác thực 2 bước (2FA)</h4>
                  <p>Sử dụng Google Authenticator để đăng nhập.</p>
                  {is2FAEnabled ? (
                      <span className={styles.statusOn}>✅ Đã kích hoạt</span>
                  ) : (
                      <span className={styles.statusOff}>⚠️ Chưa kích hoạt</span>
                  )}
                </div>
                
                {!is2FAEnabled ? (
                    <button className={styles.enableBtn} onClick={handleEnable2FA}>Kích hoạt ngay</button>
                ) : (
                    <button className={styles.disableBtn} onClick={handleDisable2FA}>Tắt 2FA</button>
                )}
              </div>

              <div className={styles.divider}></div>

               <div className={styles.securityRow}>
                <div>
                  <h4>Phiên đăng nhập hiện tại</h4>
                  <p className={styles.highlightText}>IP: {adminInfo.ip} • Đăng nhập lúc {adminInfo.lastLogin}</p>
                </div>
                <button className={styles.logoutOtherBtn}>Đăng xuất thiết bị khác</button>
              </div>
            </div>
          )}

          {/* TAB 3: LOGS */}
          {activeTab === 'logs' && (
            <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Lịch sử thao tác (Audit Log)</h3>
              <div className={styles.logList}>
                {activityLogs.map(log => (
                  <div key={log.id} className={`${styles.logItem} ${log.type === 'warning' ? styles.warning : ''}`}>
                    <div className={styles.logIcon}>
                      {log.type === 'warning' ? '⚠️' : '📝'}
                    </div>
                    <div className={styles.logContent}>
                      <p className={styles.logAction}>{log.action}</p>
                      <span className={styles.logTime}>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL POPUP QR CODE */}
      {show2FAModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Thiết lập Authenticator</h3>
              <button className={styles.closeIcon} onClick={() => setShow2FAModal(false)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.stepText}>1. Mở ứng dụng <b>Google Authenticator</b> trên điện thoại.</p>
              <p className={styles.stepText}>2. Quét mã QR bên dưới:</p>
              
              <div className={styles.qrContainer}>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
              </div>

              <p className={styles.stepText}>3. Nhập mã 6 số hiện ra vào ô bên dưới:</p>
              <input 
                type="text" 
                placeholder="000 000" 
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className={styles.otpInput}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShow2FAModal(false)}>Hủy bỏ</button>
              <button className={styles.confirmBtn} onClick={handleVerifyOTP}>Xác nhận kích hoạt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}