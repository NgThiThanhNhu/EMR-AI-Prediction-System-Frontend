import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PatientProfile.module.scss';

export default function PatientProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  // Dữ liệu giả lập Bệnh nhân
  const patientInfo = {
    id: 'BN-20248899', // Mã định danh y tế (MRN)
    name: 'Phạm Thị Kim Dung',
    dob: '15/08/1995',
    gender: 'Nữ',
    phone: '0912.345.678',
    email: 'kimdung95@gmail.com',
    address: 'Số 10, Ngõ 50, Cầu Giấy, Hà Nội',
    job: 'Nhân viên văn phòng',
    avatar: 'KD',
    // Thông tin người thân (Emergency Contact)
    emergencyContact: {
      name: 'Nguyễn Văn Hùng (Chồng)',
      phone: '0988.777.666'
    },
    // Thông tin y tế cơ bản
    health: {
      bloodType: 'O+',
      height: '1m58',
      weight: '52kg',
      bmi: '20.8 (Bình thường)',
      allergies: ['Penicillin', 'Hải sản vỏ cứng'], // Dị ứng
      chronic: ['Không có'] // Bệnh mãn tính
    },
    // Bảo hiểm y tế
    insurance: {
      number: 'DN 4 01 01 123456789',
      provider: 'BHXH TP Hà Nội',
      expDate: '31/12/2024',
      registerPlace: 'Bệnh viện Đa khoa Xanh Pôn'
    }
  };

  return (
    <div className={styles.container}>
      {/* NÚT QUAY LẠI */}
      <button className={styles.backBtn} onClick={() => navigate('/patient')}>
        <span className={styles.arrowIcon}>←</span> Quay lại trang chủ
      </button>

      <div className={styles.profileLayout}>
        {/* --- CỘT TRÁI: THẺ THÔNG TIN & MENU --- */}
        <div className={styles.leftColumn}>
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>{patientInfo.avatar}</div>
              <div className={styles.editAvatarBtn}>📷</div>
            </div>
            <h2 className={styles.userName}>{patientInfo.name}</h2>
            <p className={styles.userCode}>Mã BN: {patientInfo.id}</p>
            
          </div>

          <nav className={styles.menuNav}>
            <button 
              className={`${styles.menuItem} ${activeTab === 'personal' ? styles.active : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              👤 Thông tin cá nhân
            </button>
            <button 
              className={`${styles.menuItem} ${activeTab === 'health' ? styles.active : ''}`}
              onClick={() => setActiveTab('health')}
            >
              ❤️ Sức khỏe 
            </button>
            <button 
              className={`${styles.menuItem} ${activeTab === 'insurance' ? styles.active : ''}`}
              onClick={() => setActiveTab('insurance')}
            >
              🏥 Bảo hiểm y tế
            </button>
            <button 
              className={`${styles.menuItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔐 Đổi mật khẩu
            </button>
          </nav>
        </div>

        {/* --- CỘT PHẢI: NỘI DUNG CHI TIẾT --- */}
        <div className={styles.rightColumn}>
          
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'personal' && (
            <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Hồ sơ hành chính</h3>
              <div className={styles.alertBox}>
                ℹ️ Lưu ý: Để thay đổi Họ tên hoặc Ngày sinh, vui lòng liên hệ quầy tiếp đón.
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Họ và tên</label>
                  <input type="text" defaultValue={patientInfo.name} disabled className={styles.readOnly} />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày sinh</label>
                  <input type="text" defaultValue={patientInfo.dob} disabled className={styles.readOnly} />
                </div>
                <div className={styles.formGroup}>
                  <label>Giới tính</label>
                  <input type="text" defaultValue={patientInfo.gender} disabled className={styles.readOnly} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nghề nghiệp</label>
                  <input type="text" defaultValue={patientInfo.job} />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại</label>
                  <input type="text" defaultValue={patientInfo.phone} />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input type="text" defaultValue={patientInfo.email} />
                </div>
                <div className={styles.fullWidthGroup}>
                  <label>Địa chỉ hiện tại</label>
                  <input type="text" defaultValue={patientInfo.address} />
                </div>
                
                <div className={styles.divider}></div>
                
                <h4 className={styles.subTitle}>Người liên hệ khẩn cấp</h4>
                <div className={styles.formGroup}>
                  <label>Họ tên người thân</label>
                  <input type="text" defaultValue={patientInfo.emergencyContact.name} />
                </div>
                <div className={styles.formGroup}>
                  <label>SĐT Người thân</label>
                  <input type="text" defaultValue={patientInfo.emergencyContact.phone} className={styles.urgentInput} />
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.saveBtn}>Lưu thay đổi</button>
              </div>
            </div>
          )}

          {/* TAB 2: SỨC KHỎE (Sinh trắc học) */}
          {activeTab === 'health' && (
            <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Thông tin sức khỏe cơ bản</h3>
              
              <div className={styles.healthMetricsGrid}>
                <div className={`${styles.metricItem} ${styles.blueMetric}`}>
                  <span className={styles.metricLabel}>Nhóm máu</span>
                  <span className={styles.metricValue}>{patientInfo.health.bloodType}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Chiều cao</span>
                  <span className={styles.metricValue}>{patientInfo.health.height}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Cân nặng</span>
                  <span className={styles.metricValue}>{patientInfo.health.weight}</span>
                </div>
                 <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>BMI</span>
                  <span className={styles.metricValue} style={{fontSize: '18px'}}>{patientInfo.health.bmi}</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.healthSection}>
               
              </div>

              <div className={styles.healthSection}>
               
              </div>
            </div>
          )}

          {/* TAB 3: BẢO HIỂM Y TẾ */}
          {activeTab === 'insurance' && (
            <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Thẻ Bảo Hiểm Y Tế</h3>
              
              {/* Mô phỏng thẻ BHYT */}
              <div className={styles.insuranceCardVisual}>
                <div className={styles.cardHeader}>
                  <span>BẢO HIỂM Y TẾ</span>
                  
                </div>
                <div className={styles.cardNumber}>{patientInfo.insurance.number}</div>
                <div className={styles.cardDetails}>
                  <div>
                    <small>Họ và tên:</small>
                    <strong>{patientInfo.name.toUpperCase()}</strong>
                  </div>
                  <div>
                    <small>Ngày sinh:</small>
                    <strong>{patientInfo.dob}</strong>
                  </div>
                   <div>
                    <small>Nơi ĐKKCB BD:</small>
                    <strong>{patientInfo.insurance.registerPlace}</strong>
                  </div>
                  <div>
                    <small>Hạn sử dụng:</small>
                    <strong>{patientInfo.insurance.expDate}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.formGrid} style={{marginTop: '30px'}}>
                 <div className={styles.fullWidthGroup}>
                  <label>Mã số thẻ BHYT</label>
                  <input type="text" defaultValue={patientInfo.insurance.number} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nơi đăng ký khám chữa bệnh ban đầu</label>
                  <input type="text" defaultValue={patientInfo.insurance.registerPlace} />
                </div>
                 <div className={styles.formGroup}>
                  <label>Ngày hết hạn</label>
                  <input type="date" defaultValue="2024-12-31" />
                </div>
              </div>
               <div className={styles.cardFooter}>
                <button className={styles.saveBtn}>Cập nhật thông tin thẻ</button>
              </div>
            </div>
          )}

          {/* TAB 4: BẢO MẬT */}
          {activeTab === 'security' && (
             <div className={styles.contentCard}>
              <h3 className={styles.cardTitle}>Đổi mật khẩu</h3>
              <div className={styles.formGrid} style={{gridTemplateColumns: '1fr'}}>
                <div className={styles.formGroup}>
                  <label>Mật khẩu hiện tại</label>
                  <input type="password" placeholder="••••••" />
                </div>
                <div className={styles.formGroup}>
                  <label>Mật khẩu mới</label>
                  <input type="password" />
                </div>
                <div className={styles.formGroup}>
                  <label>Nhập lại mật khẩu mới</label>
                  <input type="password" />
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.saveBtn}>Cập nhật mật khẩu</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}