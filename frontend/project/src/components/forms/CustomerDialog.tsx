'use client';

import * as React from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Search, Info, User, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { extendedCustomerSchema, type CustomerSummary } from '@/src/lib/schemas';
import { apiService } from '@/src/lib/api';

// Custom DatePicker Component
interface CustomDatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    error?: boolean;
    label?: string;
    className?: string;
}

function CustomDatePicker({ value, onChange, placeholder = "Chọn ngày", error = false, label, className }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(value || new Date());
    const [inputValue, setInputValue] = React.useState(
        value ? formatDate(value) : ''
    );

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Format date as dd/MM/yyyy
    function formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Parse date from dd/MM/yyyy format
    function parseDate(dateString: string): Date | null {
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) return null;
        
        const date = new Date(year, month, day);
        return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year ? date : null;
    }

    // Get days in month
    function getDaysInMonth(date: Date): (Date | null)[] {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days: (Date | null)[] = [];
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        setInputValue(inputVal);
        
        const parsedDate = parseDate(inputVal);
        if (parsedDate) {
            onChange(parsedDate);
            setCurrentMonth(parsedDate);
        }
    };

    const handleDateSelect = (date: Date) => {
        onChange(date);
        setInputValue(formatDate(date));
        setIsOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            if (direction === 'prev') {
                newMonth.setMonth(newMonth.getMonth() - 1);
            } else {
                newMonth.setMonth(newMonth.getMonth() + 1);
            }
            return newMonth;
        });
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const days = getDaysInMonth(currentMonth);
    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <div className={className}>
            {label && <Label className="mb-2 block">{label}</Label>}
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className={`pr-10 ${error ? 'border-red-500' : ''}`}
                        onFocus={() => setIsOpen(true)}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none">
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-4 gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    <select 
                                        value={currentMonth.getMonth()}
                                        onChange={(e) => {
                                            const newMonth = new Date(currentMonth);
                                            newMonth.setMonth(parseInt(e.target.value));
                                            setCurrentMonth(newMonth);
                                        }}
                                        className="text-sm font-medium px-2 py-1 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                    >
                                        {monthNames.map((month, index) => (
                                            <option key={index} value={index} className="bg-background text-foreground">
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <select 
                                        value={currentMonth.getFullYear()}
                                        onChange={(e) => {
                                            const newMonth = new Date(currentMonth);
                                            newMonth.setFullYear(parseInt(e.target.value));
                                            setCurrentMonth(newMonth);
                                        }}
                                        className="text-sm font-medium px-2 py-1 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                    >
                                        {Array.from({ length: 101 }, (_, i) => {
                                            const year = new Date().getFullYear() - 100 + i;
                                            return (
                                                <option key={year} value={year} className="bg-background text-foreground">
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {dayNames.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => {
                                    if (!day) {
                                        return <div key={index} className="p-1" />;
                                    }

                                    const isSelected = value && 
                                        day.getDate() === value.getDate() &&
                                        day.getMonth() === value.getMonth() &&
                                        day.getFullYear() === value.getFullYear();

                                    const isToday = 
                                        day.getDate() === new Date().getDate() &&
                                        day.getMonth() === new Date().getMonth() &&
                                        day.getFullYear() === new Date().getFullYear();

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`
                                                h-8 w-8 text-sm rounded-md font-normal
                                                hover:bg-accent hover:text-accent-foreground
                                                focus:bg-accent focus:text-accent-foreground
                                                ${isSelected 
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' 
                                                    : ''
                                                }
                                                ${isToday && !isSelected 
                                                    ? 'bg-accent text-accent-foreground' 
                                                    : ''
                                                }
                                            `}
                                            onClick={() => handleDateSelect(day)}
                                        >
                                            {day.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

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
        phone?: string;
        email?: string;
        permanentAddress: string;
        currentAddress?: string;
        dateOfBirth: Date;
        gender: 'male' | 'female' | 'other';
        businessName?: string;
        businessRegistrationNumber?: string;
    }>({
        resolver: zodResolver(extendedCustomerSchema),
        defaultValues: {
            customerType: 'individual',
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
            Object.keys(initialData).forEach(key => {
                if (key !== 'index') {
                    setValue(key as any, (initialData as any)[key]);
                }
            });
            setIdType(initialData.idType);
        } else if (open) {
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

    // TODO: Implement proper lookup when API service is available
    const handleLookup = async (field: string, value: string) => {
        if (!value || value.length < 3) return;

        try {
            // For now, disable lookup functionality as apiService methods don't exist
            console.log('Lookup not implemented for:', field, value);
        } catch (error) {
            console.log('Customer not found for lookup:', value);
        }
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
        console.log("🚀 CustomerDialog onSubmit called with data:", data);
        console.log("🚀 Form errors:", errors);
        
        const completeCustomerData = {
            ...data,
            id: initialData?.id || uuidv4(),
            idType: idType,
            idNumber: idType === 'CMND' ? data.cmndNumber : data.passportNumber,
            dob: data.dateOfBirth?.toISOString() || null
        };

        console.log("🚀 CustomerDialog submitting:", completeCustomerData);
        onSave(completeCustomerData);
    };

    const onError = (errors: any) => {
        console.log("❌ Form validation errors:", errors);
        
        // Display validation errors using toast
        const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => {
            return error.message || `Lỗi ở trường ${field}`;
        });
        
        if (errorMessages.length > 0) {
            toast.error(`Vui lòng kiểm tra lại thông tin: ${errorMessages.join(', ')}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 mt-6">
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
                        
                        {watch('customerType') === 'organization' && (
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <Label htmlFor="businessName">Tên doanh nghiệp *</Label>
                                    <Input
                                        id="businessName"
                                        {...register('businessName')}
                                        placeholder="Nhập tên doanh nghiệp"
                                        className={errors.businessName ? 'border-red-500' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="businessRegistrationNumber">Số đăng ký kinh doanh *</Label>
                                    <Input
                                        id="businessRegistrationNumber"
                                        {...register('businessRegistrationNumber')}
                                        placeholder="Nhập số đăng ký kinh doanh"
                                        className={errors.businessRegistrationNumber ? 'border-red-500' : ''}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personal Information Section */}
                    <Accordion type="single" collapsible defaultValue="customer-info" className="w-full">
                        <AccordionItem value="customer-info">
                            <AccordionTrigger className="text-lg font-semibold">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-orange-600" />
                                    Thông tin nhân sự
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-6">
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
                                                <CustomDatePicker
                                                    label="Ngày cấp CMND *"
                                                    value={watch('cmndIssueDate') || null}
                                                    onChange={(date) => setValue('cmndIssueDate', date || undefined)}
                                                    placeholder="Chọn ngày cấp"
                                                    error={!!errors.cmndIssueDate}
                                                />
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
                                                <CustomDatePicker
                                                    label="Ngày cấp Passport *"
                                                    value={watch('passportIssueDate') || null}
                                                    onChange={(date) => setValue('passportIssueDate', date || undefined)}
                                                    placeholder="Chọn ngày cấp"
                                                    error={!!errors.passportIssueDate}
                                                />
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

                                {/* Personal Information */}
                                <div className="border-b pb-6">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin cá nhân</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="fullName">Họ tên Khách hàng *</Label>
                                            <Input
                                                id="fullName"
                                                {...register('fullName')}
                                                placeholder="Nhập họ tên khách hàng"
                                                className={errors.fullName ? 'border-red-500' : ''}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Số điện thoại</Label>
                                            <Input
                                                id="phone"
                                                {...register('phone')}
                                                onBlur={(e) => handleLookup('phone', e.target.value)}
                                                placeholder="Nhập số điện thoại"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <CustomDatePicker
                                            label="Ngày sinh *"
                                            value={watch('dateOfBirth') || null}
                                            onChange={(date) => setValue('dateOfBirth', date || new Date())}
                                            placeholder="Chọn ngày sinh"
                                            error={!!errors.dateOfBirth}
                                        />

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
                                    </div>
                                </div>

                                {/* Address Information */}
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <DialogFooter className="flex justify-end gap-4 pt-6 border-t bg-muted/50 rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-8"
                            onClick={() => console.log("🔥 Submit button clicked!")}
                        >
                            {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}