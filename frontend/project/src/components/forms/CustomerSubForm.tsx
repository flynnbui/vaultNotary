'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Switch } from '@/src/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { DatePicker } from '@/src/components/ui/date-picker';
import { Search, User, Info } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerSubForm() {
  const { t } = useTranslation();
  const { watch, setValue, formState: { errors } } = useFormContext();
  const [showExistingCustomer, setShowExistingCustomer] = useState(false);
  const [existingCustomerData, setExistingCustomerData] = useState<any>(null);
  const [idType, setIdType] = useState<'cmnd' | 'passport'>('cmnd');

  const customerType = watch('customerType') || 'individual';
  const isVip = watch('isVip') || false;
  const cmndNumber = watch('cmndNumber');
  const passportNumber = watch('passportNumber');
  const phone = watch('phone');

  const handleLookup = async (field: string, value: string) => {
    if (!value || value.length < 3) return;

    // Simulate API lookup
    setTimeout(() => {
      const mockCustomer = {
        fullName: 'Nguyễn Văn A',
        cmndNumber: '123456789',
        cmndIssueDate: new Date('2020-01-15'),
        cmndIssuePlace: 'CA TP.HCM',
        phone: '0123456789',
        email: 'nguyenvana@email.com',
        permanentAddress: '123 Đường ABC, Quận 1, TP.HCM',
        currentAddress: '456 Đường XYZ, Quận 3, TP.HCM',
        dateOfBirth: new Date('1990-05-20'),
        gender: 'male'
      };

      setExistingCustomerData(mockCustomer);
      setShowExistingCustomer(true);
    }, 500);
  };

  const handleUseExistingData = () => {
    if (existingCustomerData) {
      Object.keys(existingCustomerData).forEach(key => {
        setValue(key, existingCustomerData[key]);
      });
      toast.success('Đã áp dụng thông tin khách hàng có sẵn');
    }
    setShowExistingCustomer(false);
  };

  const handleIdTypeChange = (type: 'cmnd' | 'passport') => {
    setIdType(type);
    // Clear the other ID type when switching
    if (type === 'cmnd') {
      setValue('passportNumber', '');
      setValue('passportIssueDate', undefined);
      setValue('passportIssuePlace', '');
    } else {
      setValue('cmndNumber', '');
      setValue('cmndIssueDate', undefined);
      setValue('cmndIssuePlace', '');
    }
  };

  return (
    <Accordion type="single" defaultValue="customer-info" collapsible>
      <AccordionItem value="customer-info">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-600" />
            Thông tin nhân sự
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                {showExistingCustomer && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Đã tồn tại thông tin KH. Dùng dữ liệu sẵn có?</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUseExistingData}>
                          Dùng
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowExistingCustomer(false)}>
                          Huỷ
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customerType">Loại Khách hàng *</Label>
                    <Select
                      value={customerType}
                      onValueChange={(value) => setValue('customerType', value)}
                    >
                      <SelectTrigger className={errors.customerType ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Khách hàng - Cá nhân (CMND)</SelectItem>
                        <SelectItem value="organization">Khách hàng - Tổ chức</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isVip"
                      checked={isVip}
                      onCheckedChange={(checked) => setValue('isVip', checked)}
                    />
                    <Label htmlFor="isVip">Khách hàng VIP</Label>
                  </div>
                </div>

                {/* ID Type Selection */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={idType === 'cmnd' ? 'default' : 'outline'}
                      onClick={() => handleIdTypeChange('cmnd')}
                      className="flex-1"
                    >
                      CMND/CCCD
                    </Button>
                    <Button
                      type="button"
                      variant={idType === 'passport' ? 'default' : 'outline'}
                      onClick={() => handleIdTypeChange('passport')}
                      className="flex-1"
                    >
                      Passport
                    </Button>
                  </div>

                  {idType === 'cmnd' ? (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="cmndNumber">Số CMND *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="cmndNumber"
                            value={cmndNumber || ''}
                            onChange={(e) => setValue('cmndNumber', e.target.value)}
                            onBlur={(e) => handleLookup('cmnd', e.target.value)}
                            placeholder="Tìm kiếm số CMND"
                            className={errors.cmndNumber ? 'border-red-500' : ''}
                          />
                          <Button type="button" variant="ghost" size="icon">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cmndIssueDate">Ngày cấp CMND *</Label>
                        <DatePicker
                          value={watch('cmndIssueDate')}
                          onChange={(date) => setValue('cmndIssueDate', date || undefined)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cmndIssuePlace">Nơi cấp CMND *</Label>
                        <Input
                          id="cmndIssuePlace"
                          value={watch('cmndIssuePlace') || ''}
                          onChange={(e) => setValue('cmndIssuePlace', e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="passportNumber">Số Passport *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="passportNumber"
                            value={passportNumber || ''}
                            onChange={(e) => setValue('passportNumber', e.target.value)}
                            onBlur={(e) => handleLookup('passport', e.target.value)}
                            placeholder="Tìm kiếm số Passport"
                            className={errors.passportNumber ? 'border-red-500' : ''}
                          />
                          <Button type="button" variant="ghost" size="icon">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="passportIssueDate">Ngày cấp Passport *</Label>
                        <DatePicker
                          value={watch('passportIssueDate')}
                          onChange={(date) => setValue('passportIssueDate', date || undefined)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passportIssuePlace">Nơi cấp Passport *</Label>
                        <Input
                          id="passportIssuePlace"
                          value={watch('passportIssuePlace') || ''}
                          onChange={(e) => setValue('passportIssuePlace', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Họ tên Khách hàng *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fullName"
                        value={watch('fullName') || ''}
                        onChange={(e) => setValue('fullName', e.target.value)}
                        placeholder="Tìm kiếm tên khách hàng"
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      <Button type="button" variant="ghost" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={phone || ''}
                        onChange={(e) => setValue('phone', e.target.value)}
                        onBlur={(e) => handleLookup('phone', e.target.value)}
                        placeholder="Tìm kiếm số điện thoại"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      <Button type="button" variant="ghost" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="permanentAddress">Địa chỉ thường trú *</Label>
                    <Textarea
                      id="permanentAddress"
                      value={watch('permanentAddress') || ''}
                      onChange={(e) => setValue('permanentAddress', e.target.value)}
                      className={errors.permanentAddress ? 'border-red-500' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentAddress">Chỗ ở hiện tại</Label>
                    <Textarea
                      id="currentAddress"
                      value={watch('currentAddress') || ''}
                      onChange={(e) => setValue('currentAddress', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={watch('email') || ''}
                      onChange={(e) => setValue('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="referrer">Người giới thiệu</Label>
                    <div className="flex gap-2">
                      <Input
                        id="referrer"
                        value={watch('referrer') || ''}
                        onChange={(e) => setValue('referrer', e.target.value)}
                        placeholder="Tìm kiếm Người giới thiệu"
                      />
                      <Button type="button" variant="ghost" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                    <DatePicker
                      value={watch('dateOfBirth')}
                      onChange={(date) => setValue('dateOfBirth', date || undefined)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Giới tính *</Label>
                    <Select
                      value={watch('gender')}
                      onValueChange={(value) => setValue('gender', value)}
                    >
                      <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}