'use client';

import * as React from 'react';
import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
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

    // Fake data for demo - remove this in production
    React.useEffect(() => {
        // Add fake data to Bên A
        if (partiesA.fields.length === 0) {
            partiesA.append([
                {
                    id: '1',
                    fullName: 'Nguyễn Văn Nam',
                    idType: 'CMND',
                    idNumber: '123456789',
                    dob: '1985-05-15',
                    customerType: 'individual'
                },
                {
                    id: '2',
                    fullName: 'Trần Thị Lan',
                    idType: 'CCCD',
                    idNumber: '987654321',
                    dob: '1990-12-20',
                    customerType: 'individual'
                }
            ]);
        }

        // Add fake data to Bên B
        if (partiesB.fields.length === 0) {
            partiesB.append([
                {
                    id: '3',
                    fullName: 'Lê Minh Hoàng',
                    idType: 'Passport',
                    idNumber: 'A1234567',
                    dob: '1988-03-10',
                    customerType: 'organization',
                    businessName: 'Công ty TNHH ABC',
                    businessRegistrationNumber: 'MST123456789'
                }
            ]);
        }
    }, [partiesA, partiesB]);

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
            fieldArray.update(editingCustomer.index ?? 0, customerData);
            toast.success('Đã cập nhật thông tin khách hàng');
        } else {
            // Add new customer
            fieldArray.append(customerData);
            toast.success('Đã thêm khách hàng mới');
        }

        setDialogOpen(false);
        setEditingCustomer(null);
    };

    const getCustomerTypeBadge = (customer: CustomerSummary) => {
        // Check if it's an organization (có businessName hoặc businessRegistrationNumber)
        const isOrganization = (customer as any).businessName || (customer as any).businessRegistrationNumber;
        
        return isOrganization ? (
            <Badge variant="outline">Tổ chức</Badge>
        ) : (
            <Badge variant="secondary">Cá nhân</Badge>
        );
    };

    const getOrganizationName = (customer: CustomerSummary) => {
        return (customer as any).businessName || '-';
    };

    const renderCustomerTable = (customers: CustomerSummary[], party: PartyKey) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Tên khách hàng</TableHead>
                        <TableHead className="font-semibold">Số CCCD/Passport</TableHead>
                        <TableHead className="font-semibold">Tổ chức</TableHead>
                        <TableHead className="font-semibold">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer, index) => (
                        <TableRow key={customer.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{customer.fullName}</TableCell>
                            <TableCell className="font-mono">
                                {customer.idType}: {customer.idNumber}
                            </TableCell>
                            <TableCell>{getOrganizationName(customer)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditCustomer(party, customer, index)}
                                        title="Chỉnh sửa"
                                    >
                                        <PenLine className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveCustomer(party, index)}
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        title="Xóa"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const renderEmptyState = (party: PartyKey) => (
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
                Chưa có khách hàng
            </h3>
            <p className="text-muted-foreground mb-4">
                Nhấn nút bên dưới để thêm khách hàng cho {getPartyLabel(party)}
            </p>
        </div>
    );

    const renderPartySection = (party: PartyKey) => {
        const fieldArray = getFieldArray(party);
        const customers = fieldArray.fields as CustomerSummary[];
        const hasError = (errors?.parties as any)?.[party];

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
                        {customers.length > 0 ? (
                            <div className="space-y-4">
                                {renderCustomerTable(customers, party)}
                            </div>
                        ) : (
                            renderEmptyState(party)
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddCustomer(party)}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {customers.length > 0 ? 'Thêm khách hàng khác' : 'Thêm khách hàng'}
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