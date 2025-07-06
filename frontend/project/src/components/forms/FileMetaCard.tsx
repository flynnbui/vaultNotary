'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { CLERKS, NOTARIES, FILE_TYPES, formatDate } from '@/src/lib/constants';
import { Calendar } from 'lucide-react';

export function FileMetaCard() {
    const { t } = useTranslation();
    const { watch, setValue, formState: { errors } } = useFormContext();

    return (
        <Card className="shadow-md border-0">
            <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    {t('fileForm.fileInfo', 'Thông tin hồ sơ')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div>
                    <Label htmlFor="ngayTao">{t('fileForm.creationDate', 'Ngày tạo')} *</Label>
                    <Input
                        id="ngayTao"
                        type="date"
                        value={watch('ngayTao') ? formatDate(new Date(watch('ngayTao'))).split('/').reverse().join('-') : ''}
                        onChange={(e) => setValue('ngayTao', new Date(e.target.value))}
                        className={errors.ngayTao ? 'border-red-500' : ''}
                    />
                    {errors.ngayTao && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.ngayTao.message}
                        </p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="thuKy">{t('fileForm.clerk', 'Thư ký')} *</Label>
                        <Select
                            value={watch('thuKy')}
                            onValueChange={(value) => setValue('thuKy', value)}
                        >
                            <SelectTrigger className={errors.thuKy ? 'border-red-500' : ''}>
                                <SelectValue placeholder={t('common.selectOption', 'Chọn lựa chọn')} />
                            </SelectTrigger>
                            <SelectContent>
                                {CLERKS.map((clerk) => (
                                    <SelectItem key={clerk.value} value={clerk.value}>
                                        {clerk.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.thuKy && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.thuKy.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="congChungVien">{t('fileForm.notary', 'Công chứng viên')} *</Label>
                        <Select
                            value={watch('congChungVien')}
                            onValueChange={(value) => setValue('congChungVien', value)}
                        >
                            <SelectTrigger className={errors.congChungVien ? 'border-red-500' : ''}>
                                <SelectValue placeholder={t('common.selectOption', 'Chọn lựa chọn')} />
                            </SelectTrigger>
                            <SelectContent>
                                {NOTARIES.map((notary) => (
                                    <SelectItem key={notary.value} value={notary.value}>
                                        {notary.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.congChungVien && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.congChungVien.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="maGiaoDich">Mã giao dịch *</Label>
                        <Input
                            id="maGiaoDich"
                            value={watch('maGiaoDich') || ''}
                            onChange={(e) => setValue('maGiaoDich', e.target.value)}
                            placeholder="Nhập mã giao dịch"
                            className={errors.maGiaoDich ? 'border-red-500' : ''}
                        />
                        {errors.maGiaoDich && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.maGiaoDich.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="loaiHoSo">{t('fileForm.fileType', 'Loại hồ sơ')} *</Label>
                        <Select
                            value={watch('loaiHoSo')}
                            onValueChange={(value) => setValue('loaiHoSo', value)}
                        >
                            <SelectTrigger className={errors.loaiHoSo ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Chọn loại hồ sơ" />
                            </SelectTrigger>
                            <SelectContent>
                                {FILE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.loaiHoSo && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.loaiHoSo.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="moTa">Mô tả</Label>
                    <Textarea
                        id="moTa"
                        value={watch('moTa') || ''}
                        onChange={(e) => setValue('moTa', e.target.value)}
                        placeholder="Nhập mô tả giao dịch"
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
}