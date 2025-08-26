'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { type CustomerSummary } from '@/src/lib/schemas';
import { CustomerSearch } from './CustomerSearch';
import { CustomerForm } from './CustomerForm';
import { validateIdFormat } from '@/src/lib/customer-validation';

interface CustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (customer: CustomerSummary, isEditing: boolean) => void;
    initialData?: CustomerSummary | null;
    title?: string;
    existingCustomers?: CustomerSummary[]; // All customers currently in all parties
    isSaving?: boolean; // Loading state controlled by parent
}

type DialogStep = 'search' | 'create' | 'edit';

export function CustomerDialog({
    open,
    onOpenChange,
    onSave,
    initialData,
    title = 'Thêm khách hàng mới',
    existingCustomers = [],
    isSaving = false
}: CustomerDialogProps) {
    const isMobile = useIsMobile();
    const [step, setStep] = useState<DialogStep>('search');
    const [prefillData, setPrefillData] = useState<{ searchedId: string; idType: 'CMND' | 'Passport' } | null>(null);

    // Determine initial step based on whether we're editing
    useEffect(() => {
        if (open) {
            if (initialData) {
                setStep('edit');
            } else {
                setStep('search');
                setPrefillData(null);
            }
        }
    }, [open, initialData]);

    // Handle using existing customer from search
    const handleUseExistingCustomer = (customer: CustomerSummary) => {
        onSave(customer, false); // Using existing customer (not editing)
    };

    // Handle creating new customer after search
    const handleInitiateCreateNew = (searchedId: string, idType: 'CMND' | 'Passport') => {
        setPrefillData({ searchedId, idType });
        setStep('create');
    };

    // Handle form submission (both create and edit)
    const handleFormSubmit = (customer: CustomerSummary, isEditing: boolean) => {
        onSave(customer, isEditing);
    };

    // Handle cancel from form
    const handleFormCancel = () => {
        if (step === 'create') {
            setStep('search');
            setPrefillData(null);
        } else {
            onOpenChange(false);
        }
    };

    // Create form data with prefilled values for new customers
    const getFormInitialData = (): CustomerSummary | null => {
        if (step === 'edit' && initialData) {
            return initialData;
        }
        
        if (step === 'create' && prefillData) {
            // Create a minimal CustomerSummary with the searched ID prefilled
            const { searchedId, idType } = prefillData;
            return {
                id: '',
                fullName: '',
                gender: 0,
                address: '',
                phone: '',
                email: '',
                type: 0,
                documentId: idType === 'CMND' ? searchedId : '',
                passportId: idType === 'Passport' ? searchedId : '',
                businessRegistrationNumber: '',
                businessName: '',
                createdAt: '',
                updatedAt: '',
            } as CustomerSummary;
        }
        
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`w-full overflow-y-auto p-4 sm:p-6 ${
                isMobile 
                    ? 'max-w-[95vw] h-[95vh] mx-2' 
                    : 'max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl h-[90vh]'
            }`}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className={`space-y-6 mt-6 ${isMobile ? 'pb-safe' : ''}`}>
                    {/* Search Section - Only show when searching for new customers */}
                    {step === 'search' && (
                        <CustomerSearch
                            onUseExistingCustomer={handleUseExistingCustomer}
                            onInitiateCreateNew={handleInitiateCreateNew}
                            existingCustomers={existingCustomers}
                        />
                    )}

                    {/* Form Section - Show when creating or editing */}
                    {(step === 'create' || step === 'edit') && (
                        <CustomerForm
                            initialData={getFormInitialData()}
                            onSubmit={handleFormSubmit}
                            isSaving={isSaving}
                            existingCustomers={existingCustomers}
                            onCancel={handleFormCancel}
                        />
                    )}

                    {/* Show Close button when only searching and no form is shown */}
                    {step === 'search' && (
                        <DialogFooter className={`flex justify-end gap-4 pt-6 rounded-b-lg -mx-6 -mb-6 px-6 py-4 ${isMobile ? 'pb-safe sticky bottom-0 bg-background border-t' : ''}`}>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px] sm:min-h-auto">
                                Đóng
                            </Button>
                        </DialogFooter>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}