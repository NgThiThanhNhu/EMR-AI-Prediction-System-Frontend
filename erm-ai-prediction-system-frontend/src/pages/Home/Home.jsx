"use client";

import { BrowserRouter as Router, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Activity,
  LogIn,
  ChevronRight,
  Zap,
  TrendingUp,
  Database,
  Search,
  Stethoscope,
  ShieldCheck,
  Globe,
  ArrowRight,
} from "lucide-react";
import styles from "./Home.module.scss";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.topBanner}>
        <span className={styles.badge}>MỚI</span>
        Hệ thống HealthEMR v4.0 đã chính thức ra mắt với AI hỗ trợ chẩn đoán.{" "}
        <Link
          to="/specs"
          className="underline font-bold ml-1 hover:text-white/80 transition-colors"
        >
          Xem thông số kỹ thuật
        </Link>
      </div>

      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className={styles.logoText}>
            Health<span className={styles.highlight}>EMR</span>
          </span>
        </div>

        <nav className={`${styles.nav} hidden lg:flex`}>
          <div className={styles.navItem}>
            <span>Sản phẩm</span>
            <div className={styles.dropdownLine}></div>
          </div>
          <div className={styles.navItem}>
            <span>Giải pháp</span>
            <div className={styles.dropdownLine}></div>
          </div>
          <div className={styles.navItem}>
            <span>Tính năng</span>
            <div className={styles.dropdownLine}></div>
          </div>
          <div className={styles.navItem}>
            <span>Bảng giá</span>
            <div className={styles.dropdownLine}></div>
          </div>
          <div className={styles.navItem}>
            <span>Khách hàng</span>
            <div className={styles.dropdownLine}></div>
          </div>
        </nav>

        <div className={styles.headerActions}>
          <Button variant="ghost" className={styles.loginButton}>
            Đăng nhập
          </Button>
          <Button className={styles.signupButton}>Đăng ký</Button>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div className={styles.announcement}>
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span>Tiêu chuẩn y tế số 2026</span>
            </div>
            <h1>
              Quản lý bệnh án <br />
              <span className={styles.gradientText}>Kỷ nguyên số 5.0</span>
            </h1>
            <p>
              Nền tảng EMR tiên tiến nhất tích hợp trí tuệ nhân tạo (AI) giúp tự
              động hóa quy trình lâm sàng, giảm 60% thời gian nhập liệu và tối
              ưu hóa phác đồ điều trị.
            </p>
            <div className={styles.heroCta}>
              <Button size="lg" className={styles.primaryCta}>
                Dùng thử miễn phí 30 ngày
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={styles.secondaryCta}
              >
                Tư vấn giải pháp
              </Button>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.avatarGroup}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={styles.avatar}>
                    <img
                      src={`/doctor-avatar-.jpg?height=40&width=40&query=doctor+avatar+${i}`}
                      alt="User"
                    />
                  </div>
                ))}
              </div>
              <div className={styles.trustText}>
                <strong>+1,200</strong> cơ sở y tế đã tin dùng trên toàn quốc
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mainDashboard}>
              <img
                src="/modern-healthcare-dashboard-interface-showing-pati.jpg"
                alt="EMR Dashboard"
                className={styles.dashboardImage}
              />
              <div className={`${styles.floatingCard} ${styles.cardTop}`}>
                <Activity className="h-4 w-4 text-primary" />
                <div className={styles.cardInfo}>
                  <span>Nhịp tim trung bình</span>
                  <strong>72 BPM</strong>
                </div>
              </div>
              <div className={`${styles.floatingCard} ${styles.cardMiddle}`}>
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <div className={styles.cardInfo}>
                  <span>Bảo mật dữ liệu</span>
                  <strong>Tối ưu</strong>
                </div>
              </div>
              <div className={`${styles.floatingCard} ${styles.cardBottom}`}>
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className={styles.cardInfo}>
                  <span>Hiệu suất phòng khám</span>
                  <strong>+85%</strong>
                </div>
              </div>
            </div>
            <div className={styles.backgroundGlow}></div>
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          {[
            {
              label: "Bệnh án xử lý",
              value: "25M+",
              icon: <Database size={32} />,
            },
            {
              label: "Thời gian hoạt động",
              value: "99.99%",
              icon: <Globe size={32} />,
            },
            {
              label: "Tốc độ phản hồi",
              value: "0.1s",
              icon: <Zap size={32} />,
            },
            {
              label: "Bác sĩ tin dùng",
              value: "15,000+",
              icon: <Stethoscope size={32} />,
            },
          ].map((stat, idx) => (
            <div key={idx} className={styles.statItemComplex}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statData}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.subTitle}>CÔNG NGHỆ DẪN ĐẦU</span>
          <h2>Trải nghiệm sự khác biệt</h2>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCardAdvanced}>
            <div className={styles.cardGlow}></div>
            <div className={styles.cardContent}>
              <div className={styles.featureIcon}>
                <Activity />
              </div>
              <h3>AI Chẩn đoán sớm</h3>
              <p>
                Hệ thống AI phân tích dữ liệu lịch sử để cảnh báo sớm các dấu
                hiệu bất thường của bệnh nhân.
              </p>
              <Link to="/ai" className={styles.cardLink}>
                Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className={styles.featureCardAdvanced}>
            <div className={styles.cardGlow}></div>
            <div className={styles.cardContent}>
              <div className={styles.featureIcon}>
                <ShieldCheck />
              </div>
              <h3>Bảo mật dữ liệu</h3>
              <p>
                Mã hóa AES-256 kết hợp xác thực đa yếu tố đảm bảo an toàn tuyệt
                đối.
              </p>
              <Link to="/security" className={styles.cardLink}>
                Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className={styles.featureCardAdvanced}>
            <div className={styles.cardGlow}></div>
            <div className={styles.cardContent}>
              <div className={styles.featureIcon}>
                <Search />
              </div>
              <h3>Truy vấn thông minh</h3>
              <p>
                Tìm kiếm bệnh nhân và hồ sơ bệnh án chỉ trong vài giây với bộ
                lọc nâng cao.
              </p>
              <Link to="/smart-search" className={styles.cardLink}>
                Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.analyticsSection}>
        <div className={styles.analyticsContainer}>
          <div className={styles.analyticsContent}>
            <h2>Phân tích dữ liệu theo thời gian thực tế</h2>
            <p>
              Hệ thống tự động tổng hợp báo cáo doanh thu, lưu lượng bệnh nhân
              và hiệu suất bác sĩ một cách trực quan.
            </p>
            <div className={styles.analyticsItems}>
              <div className={styles.analyticsItem}>
                <div className={styles.itemBullet}>01</div>
                <div>
                  <h4>Báo cáo thông minh</h4>
                  <p>Hơn 50 mẫu báo cáo y tế chuẩn bộ y tế.</p>
                </div>
              </div>
              <div className={styles.analyticsItem}>
                <div className={styles.itemBullet}>02</div>
                <div>
                  <h4>Theo dõi KPI</h4>
                  <p>Giám sát hiệu quả làm việc của từng khoa phòng.</p>
                </div>
              </div>
            </div>
            <Button className={styles.learnMoreBtn}>
              Khám phá hệ thống phân tích
            </Button>
          </div>
          <div className={styles.analyticsVisual}>
            <div className={styles.chartWrapper}>
              <div className={styles.chartBars}>
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div
                    key={i}
                    className={styles.chartBar}
                    style={{ height: `${h}%` }}
                  >
                    <div className={styles.barTooltip}>{h}%</div>
                  </div>
                ))}
              </div>
              <div className={styles.chartLabels}>
                <span>Th2</span>
                <span>Th3</span>
                <span>Th4</span>
                <span>Th5</span>
                <span>Th6</span>
                <span>Th7</span>
                <span>CN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.mainFooter}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoIcon}>
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className={styles.logoText}>
                Health<span className={styles.highlight}>EMR</span>
              </span>
            </div>
            <p>
              Giải pháp y tế số hàng đầu Việt Nam, đồng hành cùng sự phát triển
              của hệ thống y tế hiện đại.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <h4>Sản phẩm</h4>
            <Link to="#">Quản lý bệnh án</Link>
            <Link to="#">Lịch hẹn trực tuyến</Link>
            <Link to="#">Quản lý nhà thuốc</Link>
          </div>
          <div className={styles.footerLinks}>
            <h4>Công ty</h4>
            <Link to="#">Về chúng tôi</Link>
            <Link to="#">Tuyển dụng</Link>
            <Link to="#">Liên hệ</Link>
          </div>
          <div className={styles.footerNewsletter}>
            <h4>Đăng ký nhận tin</h4>
            <div className={styles.newsletterInput}>
              <input type="email" placeholder="Email của bạn" />
              <button>Gửi</button>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 HealthEMR. Bảo lưu mọi quyền.</p>
          <div className={styles.socials}>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
