'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { FileText, Search, Users, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import '@/src/lib/i18n';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: FileText,
      title: 'Quản lý hồ sơ hiệu quả',
      description: 'Tạo, chỉnh sửa và theo dõi hồ sơ công chứng một cách dễ dàng và chính xác.',
      href: '/ho-so/tao-moi'
    },
    {
      icon: Search,
      title: 'Tra cứu nhanh chóng',
      description: 'Tìm kiếm hồ sơ theo số CMND/CCCD hoặc mã hồ sơ trong vài giây.',
      href: '/tra-cuu'
    },
    {
      icon: Users,
      title: 'Quản lý khách hàng',
      description: 'Lưu trữ và quản lý thông tin khách hàng một cách an toàn và bảo mật.',
      href: '/khach-hang'
    },
    {
      icon: BarChart3,
      title: 'Báo cáo chi tiết',
      description: 'Thống kê và báo cáo hoạt động của văn phòng công chứng.',
      href: '/bao-cao'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-orange-600 p-4 rounded-2xl">
                <FileText className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('landing.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/ho-so/tao-moi">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tra-cuu">
                <Button variant="outline" size="lg" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg">
                  {t('landing.loginButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-orange-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-orange-100 rounded-full opacity-20"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống được thiết kế để đáp ứng mọi nhu cầu quản lý của văn phòng công chứng hiện đại
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Tạo hồ sơ công chứng đầu tiên của bạn ngay hôm nay
            </p>
            <Link href="/ho-so/tao-moi">
              <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Tạo hồ sơ mới
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}