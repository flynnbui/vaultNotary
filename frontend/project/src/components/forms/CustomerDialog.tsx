'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { DatePicker } from '@/src/components/ui/date-picker';
import { Search, Info } from 'lucide-react';
import { toast } from 'sonner';
import { customerSchema, type CustomerSummary } from '@/src/lib/schemas';

interface CustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (customer: CustomerSummary) => void;
    initialData?: CustomerSummary | null;
    title?: string;
}

export function CustomerDialog({
    open,
    onOpenChange,
    onSave,
    initialData,
    title = 'Thêm khách hàng mới'
}: CustomerDialogProps) {
    const [showExistingCustomer, setShowExistingCustomer] = useState(false);
    const [existingCustomerData, setExistingCustomerData] = useState<any>(null);
    const [idType, setIdType] = useState<'CMND' | 'Passport'>('CMND');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CustomerSummary & {
        customerType: string;
        isVip: boolean;
        cmndNumber?: string;
        cmndIssueDate?: Date;
        cmndIssuePlace?: string;
        passportNumber?: string;
        passportIssueDate?: Date;
        passportIssuePlace?: string;
        phone: string;
        email?: string;
        permanentAddress: string;
        currentAddress?: string;
        referrer?: string;
        dateOfBirth: Date;
        gender: 'male' | 'female' | 'other';
    }>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            customerType: 'individual',
            isVip: false,
            fullName: '',
            permanentAddress: '',
            phone: '',
            dateOfBirth: undefined,
            gender: undefined,
            idType: 'CMND'
        }
    });

    useEffect(() => {
        if (open && initialData) {
            // Populate form with existing data
            Object.keys(initialData).forEach(key => {
                if (key !== 'index') {
                    setValue(key as any, (initialData as any)[key]);
                }
            });
            setIdType(initialData.idType);
        } else if (open) {
            // Reset form for new customer
            reset({
                customerType: 'individual',
                isVip: false,
                fullName: '',
                permanentAddress: '',
                phone: '',
                dateOfBirth: undefined,
                gender: undefined,
                idType: 'CMND'
            });
            setIdType('CMND');
        }
    }, [open, initialData, setValue, reset]);

    const handleLookup = async (_field: string, value: string) => {
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
                setValue(key as any, existingCustomerData[key]);
            });
            toast.success('Đã áp dụng thông tin khách hàng có sẵn');
        }
        setShowExistingCustomer(false);
    };

    const handleIdTypeChange = (type: 'CMND' | 'Passport') => {
        setIdType(type);
        setValue('idType', type);
        // Clear the other ID type when switching
        if (type === 'CMND') {
            setValue('passportNumber', '');
            setValue('passportIssueDate', undefined);
            setValue('passportIssuePlace', '');
        } else {
            setValue('cmndNumber', '');
            setValue('cmndIssueDate', undefined);
            setValue('cmndIssuePlace', '');
        }
    };

    const onSubmit = (data: any) => {
        // Create CustomerSummary object
        const customerSummary: CustomerSummary = {
            id: initialData?.id || uuidv4(),
            fullName: data.fullName,
            idType: data.idType,
            idNumber: data.idType === 'CMND' ? data.cmndNumber : data.passportNumber,
            dob: data.dateOfBirth.toISOString()
        };

        onSave(customerSummary);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
                    {showExistingCustomer && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between">
                                <span>Đã tồn tại thông tin khách hàng. Dùng dữ liệu sẵn có?</span>
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" onClick={handleUseExistingData}>
                                        Dùng
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => setShowExistingCustomer(false)}>
                                        Huỷ
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Customer Type Section */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin cơ bản</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="customerType">Loại Khách hàng *</Label>
                                <Select
                                    value={watch('customerType')}
                                    onValueChange={(value) => setValue('customerType', value)}
                                >
                                    <SelectTrigger className={errors.customerType ? 'border-red-500' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Cá nhân</SelectItem>
                                        <SelectItem value="organization">Tổ chức</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* ID Type Selection */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin giấy tờ</h3>
                        <div className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant={idType === 'CMND' ? 'default' : 'outline'}
                                onClick={() => handleIdTypeChange('CMND')}
                                className="flex-1"
                            >
                                CMND/CCCD
                            </Button>
                            <Button
                                type="button"
                                variant={idType === 'Passport' ? 'default' : 'outline'}
                                onClick={() => handleIdTypeChange('Passport')}
                                className="flex-1"
                            >
                                Passport
                            </Button>
                        </div>

                        {idType === 'CMND' ? (
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="cmndNumber">Số CMND *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="cmndNumber"
                                            {...register('cmndNumber')}
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
                                        onChange={(date) => setValue('cmndIssueDate', date)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cmndIssuePlace">Nơi cấp CMND *</Label>
                                    <Input
                                        id="cmndIssuePlace"
                                        {...register('cmndIssuePlace')}
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
                                            {...register('passportNumber')}
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
                                        onChange={(date) => setValue('passportIssueDate', date)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="passportIssuePlace">Nơi cấp Passport *</Label>
                                    <Input
                                        id="passportIssuePlace"
                                        {...register('passportIssuePlace')}
                                    />
                                </div>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin cá nhân</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="fullName">Họ tên Khách hàng *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="fullName"
                                        {...register('fullName')}
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
                                        {...register('phone')}
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

                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                                <DatePicker
                                    value={watch('dateOfBirth')}
                                    onChange={(date) => setValue('dateOfBirth', date)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="gender">Giới tính *</Label>
                                <Select
                                    value={watch('gender')}
                                    onValueChange={(value) => setValue('gender', value as any)}
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

                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                            </div>

                            <div>
                                <Label htmlFor="referrer">Người giới thiệu</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="referrer"
                                        {...register('referrer')}
                                        placeholder="Tìm kiếm Người giới thiệu"
                                    />
                                    <Button type="button" variant="ghost" size="icon">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin địa chỉ</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="permanentAddress">Địa chỉ thường trú *</Label>
                                <Textarea
                                    id="permanentAddress"
                                    {...register('permanentAddress')}
                                    className={errors.permanentAddress ? 'border-red-500' : ''}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="currentAddress">Chỗ ở hiện tại</Label>
                                <Textarea
                                    id="currentAddress"
                                    {...register('currentAddress')}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-4 pt-6 border-t bg-muted/50 rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="px-8">
                            {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}