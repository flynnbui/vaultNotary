'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Badge } from '@/src/components/ui/badge';
import { Search, Info, User, CalendarIcon, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Phone, Mail, MapPin, Building2, CreditCard, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { extendedCustomerSchema, type CustomerSummary } from '@/src/lib/schemas';
import { z } from 'zod';
import useCustomerService from '@/src/services/useCustomerService';
import { CreateCustomerType, CustomerType } from '@/src/types/customer.type';

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
    existingCustomers?: CustomerSummary[]; // All customers currently in all parties
}

interface CustomerSearchResult {
    found: boolean;
    customer?: CustomerType;
    searchedId: string;
}

export function CustomerDialog({
    open,
    onOpenChange,
    onSave,
    initialData,
    title = 'Thêm khách hàng mới',
    existingCustomers = []
}: CustomerDialogProps) {
    // Search state
    const [idSearchTerm, setIdSearchTerm] = useState<string>('');
    const [searchResult, setSearchResult] = useState<CustomerSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [searchInputError, setSearchInputError] = useState<string>('');

    // Legacy states for backwards compatibility
    const [idType, setIdType] = useState<'CMND' | 'Passport'>('CMND');

    const { createCustomer, searchCustomers } = useCustomerService();

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
            gender: undefined
        }
    });

    // Zod schemas for ID validation
    const cmndSchema = z.string()
        .regex(/^[0-9]{9}$|^[0-9]{12}$/, 'CMND/CCCD phải có 9 hoặc 12 chữ số')
        .transform((val) => ({ value: val, type: 'CMND' as const }));

    const passportSchema = z.string()
        .regex(/^[A-Z0-9]{8,9}$/, 'Passport phải có 8-9 ký tự chữ in hoa và số')
        .transform((val) => ({ value: val, type: 'Passport' as const }));

    const idSearchSchema = z.string()
        .min(1, 'Vui lòng nhập số CMND/Passport')
        .transform((val) => val.trim().toUpperCase())
        .pipe(z.union([cmndSchema, passportSchema]));

    // Validate ID using Zod
    const validateIdFormat = useCallback((id: string): { isValid: boolean; type: 'CMND' | 'Passport' | null; error?: string; normalizedId?: string } => {
        const result = idSearchSchema.safeParse(id);

        if (result.success) {
            return {
                isValid: true,
                type: result.data.type,
                normalizedId: result.data.value
            };
        } else {
            const errorMessage = result.error.errors[0]?.message || 'Số ID không hợp lệ';
            return {
                isValid: false,
                type: null,
                error: errorMessage
            };
        }
    }, []);

    // Customer ID search handler
    const handleIdSearch = useCallback(async (searchId: string) => {
        const validation = validateIdFormat(searchId);

        if (!validation.isValid) {
            toast.error(validation.error || 'Số ID không hợp lệ');
            return;
        }

        try {
            setIsSearching(true);
            const normalizedId = validation.normalizedId || searchId.trim();
            console.log('🔍 Searching for customer with ID:', normalizedId);

            const response = await searchCustomers(normalizedId, 1, 10);
            const customers = response?.items || [];

            if (customers.length > 0) {
                // Found existing customer
                const foundCustomer = customers[0];
                console.log('✅ Found existing customer:', foundCustomer);

                setSearchResult({
                    found: true,
                    customer: foundCustomer,
                    searchedId: normalizedId
                });
                setShowCreateForm(false);
            } else {
                // No customer found
                console.log('❌ No customer found with ID:', normalizedId);
                setSearchResult({
                    found: false,
                    searchedId: normalizedId
                });
                setShowCreateForm(false); // Don't auto-show create form

                // Pre-fill the ID field for when user decides to create (but don't show form yet)
                setIdType(validation.type || 'CMND');

                if (validation.type === 'Passport') {
                    setValue('passportNumber', normalizedId);
                    setValue('cmndNumber', '');
                } else {
                    setValue('cmndNumber', normalizedId);
                    setValue('passportNumber', '');
                }
            }
        } catch (error) {
            console.error('❌ Error searching for customer:', error);
            toast.error('Có lỗi khi tìm kiếm khách hàng');
        } finally {
            setIsSearching(false);
        }
    }, [searchCustomers, setValue]);

    // Check if customer already exists in parties
    const isCustomerAlreadyAdded = useCallback((customerId: string): boolean => {
        return existingCustomers.some(existing => existing.id === customerId);
    }, [existingCustomers]);

    // Check if document ID already exists in parties
    const isDocumentIdAlreadyUsed = useCallback((documentId: string, passportId: string): boolean => {
        return existingCustomers.some(existing => {
            const existingDocId = existing.documentId || existing.passportId;
            const checkingDocId = documentId || passportId;
            return existingDocId && checkingDocId && existingDocId === checkingDocId;
        });
    }, [existingCustomers]);

    // Handle using existing customer
    const handleUseExistingCustomer = useCallback(() => {
        if (!searchResult?.customer) return;

        const customer = searchResult.customer;

        // Check for duplicates
        if (isCustomerAlreadyAdded(customer.id)) {
            toast.error(`Khách hàng "${customer.fullName}" đã được thêm vào một bên khác. Mỗi khách hàng chỉ có thể thuộc một bên duy nhất.`);
            return;
        }

        if (isDocumentIdAlreadyUsed(customer.documentId || '', customer.passportId || '')) {
            const docId = customer.documentId || customer.passportId;
            toast.error(`Số giấy tờ "${docId}" đã được sử dụng bởi khách hàng khác trong hồ sơ này.`);
            return;
        }

        const customerSummary: CustomerSummary = {
            id: customer.id,
            fullName: customer.fullName,
            address: customer.address,
            phone: customer.phone || '',
            email: customer.email || '',
            type: customer.type,
            documentId: customer.documentId || '',
            passportId: customer.passportId || '',
            businessRegistrationNumber: customer.businessRegistrationNumber || '',
            businessName: customer.businessName || '',
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        };

        console.log('✅ Using existing customer:', customerSummary);
        onSave(customerSummary);
    }, [searchResult, onSave, isCustomerAlreadyAdded, isDocumentIdAlreadyUsed]);

    // Reset dialog state when opened/closed
    useEffect(() => {
        if (open && initialData) {
            // Editing existing customer
            Object.keys(initialData).forEach(key => {
                if (key !== 'index') {
                    setValue(key as any, (initialData as any)[key]);
                }
            });
            setIdType(initialData.documentId ? 'CMND' : 'Passport');
            setShowCreateForm(true); // Show form for editing
            setSearchResult(null);
        } else if (open) {
            // New customer - reset everything
            reset({
                customerType: 'individual',
                isVip: false,
                fullName: '',
                permanentAddress: '',
                phone: '',
                dateOfBirth: undefined,
                gender: undefined
            });
            setIdType('CMND');
            setIdSearchTerm('');
            setSearchResult(null);
            setShowCreateForm(false);
            setSearchInputError('');
        }
    }, [open, initialData, setValue, reset]);

    // Get customer type badge (following customer page pattern)
    const getCustomerTypeBadge = (type: number) => {
        const isIndividual = type === 0;
        return isIndividual ? (
            <Badge variant="secondary">Cá nhân</Badge>
        ) : (
            <Badge variant="outline">Doanh nghiệp</Badge>
        );
    };

    const handleIdTypeChange = (type: 'CMND' | 'Passport') => {
        setIdType(type);
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

    const onSubmit = async (data: any) => {
    const onSubmit = async (data: any) => {
        console.log("🚀 CustomerDialog onSubmit called with data:", data);
        console.log("🚀 Form errors:", errors);

        try {
            let customerId = initialData?.id;

            // Check for duplicates when creating new customer
            if (!initialData) {
                const docId = idType === 'CMND' ? data.cmndNumber : data.passportNumber;
                if (isDocumentIdAlreadyUsed(idType === 'CMND' ? docId : '', idType === 'Passport' ? docId : '')) {
                    toast.error(`Số giấy tờ "${docId}" đã được sử dụng bởi khách hàng khác trong hồ sơ này.`);
                    return;
                }
            }

            // Only create customer via API if this is a new customer (not editing)
            if (!initialData) {
                // Transform form data to match backend customer format
                const customerApiData: CreateCustomerType = {
                    fullName: data.fullName,
                    address: data.permanentAddress,
                    phone: data.phone || null,
                    email: data.email || null,
                    type: data.customerType === 'organization' ? 1 : 0,
                    documentId: idType === 'CMND' ? data.cmndNumber : null,
                    passportId: idType === 'Passport' ? data.passportNumber : null,
                    businessRegistrationNumber: data.businessRegistrationNumber || null,
                    businessName: data.businessName || null,
                };

                console.log("🚀 Creating customer via API:", customerApiData);
                customerId = await createCustomer(customerApiData);
                console.log("✅ Customer created with ID:", customerId);
            }

            // Transform form data to CustomerSummary format for the parties array
            const customerSummaryData: CustomerSummary = {
                id: customerId || uuidv4(),
                fullName: data.fullName,
                address: data.permanentAddress,
                phone: data.phone || '',
                email: data.email || '',
                type: data.customerType === 'organization' ? 1 : 0,
                documentId: idType === 'CMND' ? (data.cmndNumber || '') : '',
                passportId: idType === 'Passport' ? (data.passportNumber || '') : '',
                businessRegistrationNumber: data.businessRegistrationNumber || '',
                businessName: data.businessName || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            console.log("🚀 CustomerDialog submitting CustomerSummary to form:", customerSummaryData);
            onSave(customerSummaryData);
        } catch (error) {
            console.error("❌ Error creating customer:", error);
            toast.error("Không thể tạo khách hàng. Vui lòng thử lại!");
        }
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

                <div className="space-y-6 mt-6">
                    {/* Search Section - Only show for new customers */}
                    {!initialData && (
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Tìm kiếm khách hàng</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Nhập số CMND/Passport (VD: 068203000015 hoặc A1234567)"
                                                value={idSearchTerm}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setIdSearchTerm(value);

                                                    // Clear previous error and validate on change
                                                    setSearchInputError('');
                                                    if (value.trim()) {
                                                        const validation = validateIdFormat(value);
                                                        if (!validation.isValid) {
                                                            setSearchInputError(validation.error || '');
                                                        }
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (!searchInputError && idSearchTerm.trim()) {
                                                            handleIdSearch(idSearchTerm);
                                                        }
                                                    }
                                                }}
                                                disabled={isSearching}
                                                className={`${searchInputError ? 'border-red-500 focus:border-red-500' : ''}`}
                                            />
                                            {searchInputError && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                                    <XCircle className="h-3 w-3" />
                                                    {searchInputError}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => handleIdSearch(idSearchTerm)}
                                            disabled={isSearching || !idSearchTerm.trim() || !!searchInputError}
                                            className="px-6"
                                        >
                                            {isSearching ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                            Tìm kiếm
                                        </Button>
                                    </div>

                                    {/* Helper text */}
                                    {!searchInputError && !searchResult && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            CMND/CCCD: 9 hoặc 12 chữ số • Passport: 8-9 ký tự (chữ in hoa + số)
                                        </p>
                                    )}
                                </div>

                                {/* Search Results */}
                                {searchResult && (
                                    <div className="mt-4">
                                        {searchResult.found ? (
                                            (() => {
                                                const customer = searchResult.customer!;
                                                const isDuplicateCustomer = isCustomerAlreadyAdded(customer.id);
                                                const isDuplicateDocId = isDocumentIdAlreadyUsed(customer.documentId || '', customer.passportId || '');
                                                const hasAnyDuplicate = isDuplicateCustomer || isDuplicateDocId;

                                                return (
                                                    <Card className={`${hasAnyDuplicate
                                                        ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20'
                                                        : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20'
                                                        }`}>
                                                        <CardContent className="p-6">
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex-shrink-0">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasAnyDuplicate
                                                                        ? 'bg-amber-100 dark:bg-amber-900/30'
                                                                        : 'bg-emerald-100 dark:bg-emerald-900/30'
                                                                        }`}>
                                                                        {hasAnyDuplicate ? (
                                                                            <XCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                                        ) : (
                                                                            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <h4 className={`text-lg font-semibold ${hasAnyDuplicate
                                                                            ? 'text-amber-900 dark:text-amber-100'
                                                                            : 'text-emerald-900 dark:text-emerald-100'
                                                                            }`}>
                                                                            {hasAnyDuplicate ? 'Khách hàng đã được thêm' : 'Khách hàng đã tồn tại'}
                                                                        </h4>
                                                                        {getCustomerTypeBadge(searchResult.customer?.type || 0)}
                                                                    </div>


                                                                    {/* ID Number - Most Prominent */}
                                                                    <div className="mb-4 p-3 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                                        <div className="flex items-center gap-3">
                                                                            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                                            <div>
                                                                                {searchResult.customer?.documentId && (
                                                                                    <div>
                                                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide">CMND/CCCD</div>
                                                                                        <div className="text-2xl font-mono font-bold text-emerald-800 dark:text-emerald-200">
                                                                                            {searchResult.customer.documentId}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {searchResult.customer?.passportId && !searchResult.customer?.documentId && (
                                                                                    <div>
                                                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide">Passport</div>
                                                                                        <div className="text-2xl font-mono font-bold text-emerald-800 dark:text-emerald-200">
                                                                                            {searchResult.customer.passportId}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                            <span className="font-medium text-emerald-800 dark:text-emerald-200">
                                                                                {searchResult.customer?.fullName}
                                                                            </span>
                                                                        </div>

                                                                        {searchResult.customer?.businessName && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-sm text-emerald-700 dark:text-emerald-300">
                                                                                    {searchResult.customer.businessName}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                            {searchResult.customer?.phone && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                                    <span className="text-emerald-700 dark:text-emerald-300 font-mono">
                                                                                        {searchResult.customer.phone}
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            {searchResult.customer?.email && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                                    <span className="text-emerald-700 dark:text-emerald-300">
                                                                                        {searchResult.customer.email}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {searchResult.customer?.address && (
                                                                            <div className="flex items-start gap-2 mt-2">
                                                                                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                                                                <span className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                                                                                    {searchResult.customer.address}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex-shrink-0">
                                                                    <Button
                                                                        type="button"
                                                                        onClick={handleUseExistingCustomer}
                                                                        disabled={hasAnyDuplicate}
                                                                        className={`shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 ${hasAnyDuplicate
                                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                                                            : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white'
                                                                            }`}
                                                                        size="lg"
                                                                    >
                                                                        {hasAnyDuplicate ? (
                                                                            <>
                                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                                Không thể sử dụng
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                                Sử dụng khách hàng này
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })()
                                        ) : (
                                            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                                <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                                                                Khách hàng chưa tồn tại
                                                            </h4>

                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                                    <span className="text-orange-800 dark:text-orange-200">
                                                                        Không tìm thấy khách hàng với ID:
                                                                        <span className="font-mono font-medium ml-1">{searchResult.searchedId}</span>
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-start gap-2 mt-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-md">
                                                                    <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                                                                    <div className="text-sm text-orange-700 dark:text-orange-300">
                                                                        <strong>Gợi ý:</strong> Bạn có thể tạo khách hàng mới với số ID này.
                                                                        Thông tin ID sẽ được tự động điền vào form bên dưới.
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            <Button
                                                                type="button"
                                                                onClick={() => setShowCreateForm(true)}
                                                                variant="outline"
                                                                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/30 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-2.5"
                                                                size="lg"
                                                            >
                                                                <User className="h-4 w-4 mr-2" />
                                                                Tạo khách hàng mới
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Create/Edit Form */}
                    {(showCreateForm || initialData) && (
                        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">{/* Form continues... */}

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
                                                            <Input
                                                                id="cmndNumber"
                                                                {...register('cmndNumber')}
                                                                placeholder="Nhập số CMND"
                                                                className={errors.cmndNumber ? 'border-red-500' : ''}
                                                            />
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
                                                            <Input
                                                                id="passportNumber"
                                                                {...register('passportNumber')}
                                                                placeholder="Nhập số Passport"
                                                                className={errors.passportNumber ? 'border-red-500' : ''}
                                                            />
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
                                >
                                    {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm')}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Show Cancel button when not in create form mode */}
                    {!showCreateForm && !initialData && (
                        <DialogFooter className="flex justify-end gap-4 pt-6 rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Đóng
                            </Button>
                        </DialogFooter>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}