'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Shield, FileText, Clock, Phone, MapPin, Mail, Award, Scale, Building, Menu, X, CheckCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const { user, isLoading } = useUser();

  useEffect(() => {
    let isScrolling = false;

    // Smooth scroll behavior for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        const target = document.getElementById(targetId || '');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Fullpage scroll animation
    const sections = document.querySelectorAll('section');

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;

      e.preventDefault();
      isScrolling = true;

      const delta = e.deltaY;
      let nextSection = currentSection;

      if (delta > 0 && currentSection < sections.length - 1) {
        // Scrolling down
        nextSection = currentSection + 1;
      } else if (delta < 0 && currentSection > 0) {
        // Scrolling up
        nextSection = currentSection - 1;
      }

      if (nextSection !== currentSection) {
        setCurrentSection(nextSection);
        sections[nextSection].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      setTimeout(() => {
        isScrolling = false;
      }, 1000);
    };

    // Add wheel event listener
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Add scroll-snap CSS
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.documentElement.style.scrollBehavior = '';
    };
  }, [currentSection]);

  const services = [
    {
      icon: FileText,
      title: 'Công chứng hợp đồng',
      description: 'Công chứng hợp đồng mua bán, cho thuê, chuyển nhượng bất động sản và các loại hợp đồng khác.',
      features: ['Hợp đồng mua bán', 'Hợp đồng cho thuê', 'Chuyển nhượng quyền sử dụng đất']
    },
    {
      icon: Shield,
      title: 'Chứng thực chữ ký',
      description: 'Chứng thực chữ ký, dấu vân tay trên các văn bản pháp lý quan trọng.',
      features: ['Chứng thực chữ ký', 'Chứng thực dấu vân tay', 'Xác nhận danh tính']
    },
    {
      icon: Scale,
      title: 'Chứng thực bản sao',
      description: 'Chứng thực bản sao từ bản chính các giấy tờ, tài liệu có giá trị pháp lý.',
      features: ['Chứng thực bản sao', 'Sao y bản chính', 'Dịch thuật công chứng']
    },
    {
      icon: Building,
      title: 'Tư vấn pháp lý',
      description: 'Tư vấn pháp lý chuyên nghiệp cho các vấn đề liên quan đến công chứng.',
      features: ['Tư vấn miễn phí', 'Hỗ trợ soạn thảo', 'Giải đáp thắc mắc']
    }
  ];
  

  return (
    <div className="min-h-screen bg-white" style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Văn phòng Công chứng Nhà Rồng"
                width={84}
                height={84}
                className="object-contain"
              />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-[#800020] transition-colors">Dịch vụ</a>
              <a href="#about" className="text-gray-700 hover:text-[#800020] transition-colors">Giới thiệu</a>
              <a href="#contact" className="text-gray-700 hover:text-[#800020] transition-colors">Liên hệ</a>
              
              {!isLoading && !user && (
                <a href="/auth/login?returnTo=/documents/manage">
                  <Button className="bg-[#800020] hover:bg-[#722F37] text-white">
                    Dành cho nhân viên
                  </Button>
                </a>
              )}
              
              {user && (
                <div className="flex items-center space-x-4">
                  <Link href="/documents/manage">
                    <Button className="bg-[#800020] hover:bg-[#722F37] text-white">
                      Quản lý tài liệu
                    </Button>
                  </Link>
                  <a href="/auth/logout">
                    <Button variant="outline" className="border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white bg-white">
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </a>
                </div>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <a href="#services" className="block text-gray-700 hover:text-[#800020]">Dịch vụ</a>
              <a href="#about" className="block text-gray-700 hover:text-[#800020]">Giới thiệu</a>
              <a href="#contact" className="block text-gray-700 hover:text-[#800020]">Liên hệ</a>
              
              {!isLoading && !user && (
                <a href="/auth/login?returnTo=/documents/manage" className="block">
                  <Button className="w-full bg-[#800020] hover:bg-[#722F37] text-white">
                    Dành cho nhân viên
                  </Button>
                </a>
              )}
              
              {user && (
                <div className="space-y-3">
                  <Link href="/documents/manage" className="block">
                    <Button className="w-full bg-[#800020] hover:bg-[#722F37] text-white">
                      Quản lý tài liệu
                    </Button>
                  </Link>
                  <a href="/auth/logout" className="block">
                    <Button variant="outline" className="w-full border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white bg-white">
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-[#800020] via-[#722F37] to-[#800020] text-white overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-60 right-20 w-24 h-24 border border-white/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 border border-white/20 rounded-full animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Image
                    src="/logo.png"
                    alt="Văn phòng Công chứng Nhà Rồng"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-white/90">Văn phòng Công chứng</h1>
                  <h2 className="text-4xl font-bold">Nhà Rồng</h2>
                </div>
              </div>

              <h3 className="text-5xl lg:text-6xl font-light leading-tight">
                Dịch vụ công chứng
                <span className="block font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  chuyên nghiệp & uy tín
                </span>
              </h3>

              <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                Hơn 20 năm kinh nghiệm trong lĩnh vực công chứng, chúng tôi cam kết mang đến dịch vụ chất lượng cao với sự tin cậy tuyệt đối.
              </p>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Có giấy phép hành nghề</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Bảo mật 100%</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#800020] hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-full shadow-lg transform hover:scale-105 transition-all"
                  onClick={() => window.open('tel:0916717768', '_self')}
                >
                  Liên hệ ngay: 0916 717 768
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                <h4 className="text-xl font-bold mb-6 text-center">Thông tin liên hệ</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-5 h-5 text-white flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Hướng dẫn công chứng</div>
                    </div>
                    <div className="text-lg font-medium">028 37177847</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-5 h-5 text-white flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Dịch vụ sang tên</div>
                    </div>
                    <div className="text-lg font-medium">0917 626 790</div>
                  </div>



                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Hotline hướng dẫn</div>
                    </div>
                    <div className="text-lg font-medium text-yellow-400">0916 717 768</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-5 h-5 text-white flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Trưởng VP - CCV Bùi Đức Cát</div>
                    </div>
                    <div className="text-lg font-medium">0913 762 506</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-5 h-5 text-white flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Email</div>
                    </div>
                    <div className="text-lg">congchungnharong@gmail.com</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-5 h-5 text-white flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Địa chỉ</div>
                    </div>
                    <div className="text-sm">79 Lê Thị Riêng, phường Thới An, TP.Hồ Chí Minh</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-white flex-shrink-0" />
                      <div className="text-sm text-white/90 font-medium">Giờ làm việc</div>
                    </div>
                    <div className="text-sm">Thứ 2 - Thứ 6: 8:00 - 17:00</div>
                    <div className="text-sm">Thứ 7 - 8:00 - 11:30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-r from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-l from-white/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      </section>

      {/* Services Section */}
      <section id="services" className="h-screen py-24 bg-gradient-to-b from-gray-50 to-white flex items-center" style={{ scrollSnapAlign: 'start' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-[#800020]/10 rounded-full mb-6">
              <span className="text-[#800020] font-medium">Dịch vụ chuyên nghiệp</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Dịch vụ công chứng đa dạng
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các dịch vụ công chứng theo quy định pháp luật với quy trình nhanh chóng, chính xác
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg overflow-hidden bg-white">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#800020] to-[#722F37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-[#800020]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#800020] transition-all duration-300 flex-shrink-0">
                          <Icon className="h-8 w-8 text-[#800020] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            {service.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed mb-4">
                            {service.description}
                          </p>
                          <ul className="space-y-2">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="h-screen py-24 bg-white flex items-center" style={{ scrollSnapAlign: 'start' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">
                  Tại sao chọn Văn phòng Công chứng Nhà Rồng?
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Với hơn 20 năm kinh nghiệm và đội ngũ chuyên gia pháp lý giàu kinh nghiệm, chúng tôi cam kết mang đến dịch vụ công chứng chất lượng cao nhất.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#800020] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Chuyên nghiệp & Uy tín</h3>
                    <p className="text-slate-600">Đội ngũ công chứng viên có chứng chỉ hành nghề và kinh nghiệm lâu năm trong nghề.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#800020] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Nhanh chóng & Chính xác</h3>
                    <p className="text-slate-600">Quy trình làm việc khoa học, đảm bảo hoàn thành đúng thời hạn cam kết.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#800020] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Bảo mật tuyệt đối</h3>
                    <p className="text-slate-600">Cam kết bảo mật thông tin khách hàng theo đúng quy định pháp luật.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#800020] to-[#722F37] rounded-3xl p-12 text-white">
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold">Thống kê hoạt động</h3>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">20+</div>
                      <div className="text-white/80">Năm kinh nghiệm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">5000+</div>
                      <div className="text-white/80">Khách hàng tin tưởng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">100%</div>
                      <div className="text-white/80">Hồ sơ hợp lệ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">24/7</div>
                      <div className="text-white/80">Hỗ trợ khách hàng</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="h-screen py-24 bg-gradient-to-br from-[#800020] via-[#722F37] to-[#800020] text-white flex items-center" style={{ scrollSnapAlign: 'start' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Cần hỗ trợ dịch vụ công chứng?
          </h2>
          <p className="text-xl mb-12 text-white/90">
            Liên hệ ngay với chúng tôi để được tư vấn miễn phí và đặt lịch hẹn thuận tiện
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white text-[#800020] hover:bg-gray-100 px-12 py-4 text-lg font-medium rounded-full shadow-lg"
              onClick={() => window.open('tel:0916717768', '_self')}
            >
              Gọi ngay: 0916 717 768
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}