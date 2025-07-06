'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { CustomerDialog } from '@/src/components/forms/CustomerDialog';
import { Users, PenLine, Trash2, Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import type { CustomerSummary, PartyKey } from '@/src/lib/schemas';

export function PartiesAccordion() {
    const { control, formState: { errors } } = useFormContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentParty, setCurrentParty] = useState<PartyKey>('A');
    const [editingCustomer, setEditingCustomer] = useState<CustomerSummary | null>(null);

    const partiesA = useFieldArray({ control, name: 'parties.A' });
    const partiesB = useFieldArray({ control, name: 'parties.B' });
    const partiesC = useFieldArray({ control, name: 'parties.C' });

    const getFieldArray = (party: PartyKey) => {
        switch (party) {
            case 'A': return partiesA;
            case 'B': return partiesB;
            case 'C': return partiesC;
            default: return partiesA;
        }
    };

    const getPartyLabel = (party: PartyKey) => {
        switch (party) {
            case 'A': return 'Bên A';
            case 'B': return 'Bên B';
            case 'C': return 'Bên C (Tùy chọn)';
            default: return 'Bên A';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleAddCustomer = (party: PartyKey) => {
        setCurrentParty(party);
        setEditingCustomer(null);
        setDialogOpen(true);
    };

    const handleEditCustomer = (party: PartyKey, customer: CustomerSummary, index: number) => {
        setCurrentParty(party);
        setEditingCustomer({ ...customer, index });
        setDialogOpen(true);
    };

    const handleRemoveCustomer = (party: PartyKey, index: number) => {
        const fieldArray = getFieldArray(party);
        fieldArray.remove(index);
        toast.success('Đã xóa khách hàng');
    };

    const handleCustomerSave = (customerData: CustomerSummary) => {
        const fieldArray = getFieldArray(currentParty);

        if (editingCustomer && 'index' in editingCustomer) {
            // Edit existing customer
            fieldArray.update(editingCustomer.index, customerData);
            toast.success('Đã cập nhật thông tin khách hàng');
        } else {
            // Add new customer
            fieldArray.append(customerData);
            toast.success('Đã thêm khách hàng mới');
        }

        setDialogOpen(false);
        setEditingCustomer(null);
    };

    const renderCustomerCard = (customer: CustomerSummary, party: PartyKey, index: number) => (
        <Card key={customer.id} className="mb-3">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h4 className="font-semibold text-lg uppercase text-foreground">
                            {customer.fullName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {customer.idType}: {customer.idNumber} • {formatDate(customer.dob)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCustomer(party, customer, index)}
                        >
                            <PenLine className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomer(party, index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderPartySection = (party: PartyKey) => {
        const fieldArray = getFieldArray(party);
        const customers = fieldArray.fields as CustomerSummary[];
        const hasError = errors?.parties?.[party];

        return (
            <Card key={party}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold">{getPartyLabel(party)}</span>
                        {customers.length > 0 && (
                            <span className="text-sm text-muted-foreground">({customers.length} khách hàng)</span>
                        )}
                        {hasError && (
                            <span className="text-sm text-red-500">*</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        {customers.length > 0 && (
                            <div className="space-y-3">
                                {customers.map((customer, index) =>
                                    renderCustomerCard(customer, party, index)
                                )}
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddCustomer(party)}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm khách hàng
                        </Button>

                        {hasError && (
                            <p className="text-sm text-red-500">
                                {party === 'A' || party === 'B'
                                    ? `${getPartyLabel(party)} phải có ít nhất 1 khách hàng`
                                    : 'Có lỗi trong thông tin khách hàng'
                                }
                            </p>
                        )}
                    </motion.div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Accordion type="single" collapsible defaultValue="parties-info" className="w-full">
                <AccordionItem value="parties-info">
                    <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-600" />
                            Thông tin các bên
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6">
                        {/* Ben A and Ben B on the same row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {renderPartySection('A')}
                            {renderPartySection('B')}
                        </div>

                        {/* Ben C takes full width */}
                        <div className="w-full">
                            {renderPartySection('C')}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <CustomerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleCustomerSave}
                initialData={editingCustomer}
                title={editingCustomer ? 'Chỉnh sửa khách hàng' : `Thêm khách hàng - ${getPartyLabel(currentParty)}`}
            />
        </>
    );
}