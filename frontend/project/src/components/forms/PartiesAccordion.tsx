"use client";
"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { CustomerDialog } from "@/src/components/forms/CustomerDialog";
import { Users, PenLine, Trash2, Plus, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CustomerSummary, PartyKey } from "@/src/lib/schemas";
import useCustomerService from "@/src/services/useCustomerService";

interface PartiesAccordionProps {
  readOnly?: boolean;
  onCustomerDialogChange?: (isOpen: boolean) => void;
}

interface CustomerDetails {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  type: number; // 0 = Individual, 1 = Business
  documentId: string;
  passportId: string;
  businessRegistrationNumber: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
}

export function PartiesAccordion({
  readOnly = false,
  onCustomerDialogChange,
}: PartiesAccordionProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentParty, setCurrentParty] = useState<PartyKey>("A");
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerSummary | null>(null);
export function PartiesAccordion({
  readOnly = false,
  onCustomerDialogChange,
}: PartiesAccordionProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentParty, setCurrentParty] = useState<PartyKey>("A");
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerSummary | null>(null);

  // 🆕 State để lưu thông tin chi tiết khách hàng
  const [customerDetails, setCustomerDetails] = useState<
    Record<string, CustomerDetails>
  >({});
  const [loadingCustomers, setLoadingCustomers] = useState<
    Record<string, boolean>
  >({});

  // 🆕 Import customer service
  const { getCustomerById } = useCustomerService();

  const partiesA = useFieldArray({ control, name: "parties.A" });
  const partiesB = useFieldArray({ control, name: "parties.B" });
  const partiesC = useFieldArray({ control, name: "parties.C" });
  // 🆕 State để lưu thông tin chi tiết khách hàng
  const [customerDetails, setCustomerDetails] = useState<
    Record<string, CustomerDetails>
  >({});
  const [loadingCustomers, setLoadingCustomers] = useState<
    Record<string, boolean>
  >({});

  // 🆕 Import customer service
  const { getCustomerById } = useCustomerService();

  const partiesA = useFieldArray({ control, name: "parties.A" });
  const partiesB = useFieldArray({ control, name: "parties.B" });
  const partiesC = useFieldArray({ control, name: "parties.C" });

  // Watch for changes in parties to load customer details
  const partiesAData = watch("parties.A");
  const partiesBData = watch("parties.B");
  const partiesCData = watch("parties.C");
  
  const watchedPartiesA = useMemo(() => partiesAData || [], [partiesAData]);
  const watchedPartiesB = useMemo(() => partiesBData || [], [partiesBData]);
  const watchedPartiesC = useMemo(() => partiesCData || [], [partiesCData]);

  const loadCustomerDetails = useCallback(async (customerId: string) => {
    if (!customerId || customerDetails[customerId] || loadingCustomers[customerId]) {
      return;
    }

    setLoadingCustomers((prev) => ({ ...prev, [customerId]: true }));

    try {
      const customer = await getCustomerById(customerId);
      if (customer) {
        setCustomerDetails((prev) => ({
          ...prev,
          [customerId]: customer as CustomerDetails,
        }));
      }
    } catch (error) {
      console.error(`Error loading customer ${customerId}:`, error);
    } finally {
      setLoadingCustomers((prev) => ({ ...prev, [customerId]: false }));
    }
  }, [customerDetails, loadingCustomers, getCustomerById]);

  // Load customer details when parties change
  useEffect(() => {
    const allCustomers = [
      ...watchedPartiesA,
      ...watchedPartiesB,
      ...watchedPartiesC
    ];
    
    allCustomers.forEach(customer => {
      if (customer?.id && !customerDetails[customer.id]) {
        loadCustomerDetails(customer.id);
      }
    });
  }, [watchedPartiesA, watchedPartiesB, watchedPartiesC, customerDetails, loadCustomerDetails]);

  // Notify parent when dialog state changes
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    onCustomerDialogChange?.(open);

    if (!open) {
      setEditingCustomer(null);
    }
  };

  const getFieldArray = (party: PartyKey) => {
    switch (party) {
      case "A":
        return partiesA;
      case "B":
        return partiesB;
      case "C":
        return partiesC;
      default:
        return partiesA;
    }
  };

  const getParties = (party: PartyKey): CustomerSummary[] => {
    const fieldArray = getFieldArray(party);
    return fieldArray.fields as CustomerSummary[];
  };

  const getPartyLabel = (party: PartyKey) => {
    switch (party) {
      case "A":
        return "Bên A";
      case "B":
        return "Bên B";
      case "C":
        return "Bên C (Tùy chọn)";
      default:
        return "Bên A";
    }
  };
  const getPartyLabel = (party: PartyKey) => {
    switch (party) {
      case "A":
        return "Bên A";
      case "B":
        return "Bên B";
      case "C":
        return "Bên C (Tùy chọn)";
      default:
        return "Bên A";
    }
  };

  const handleAddCustomer = (party: PartyKey) => {
    if (readOnly) return;
    setCurrentParty(party);
    setEditingCustomer(null);
    handleDialogOpenChange(true);
  };
  const handleAddCustomer = (party: PartyKey) => {
    if (readOnly) return;
    setCurrentParty(party);
    setEditingCustomer(null);
    handleDialogOpenChange(true);
  };

  const handleEditCustomer = (
    party: PartyKey,
    customer: CustomerSummary,
    index: number
  ) => {
    if (readOnly) return;
    setCurrentParty(party);
    setEditingCustomer(customer);
    handleDialogOpenChange(true);
  };

  const handleRemoveCustomer = (party: PartyKey, index: number) => {
    if (readOnly) return;
    const fieldArray = getFieldArray(party);
    fieldArray.remove(index);
    toast.success("Đã xóa khách hàng");
  };
  const handleRemoveCustomer = (party: PartyKey, index: number) => {
    if (readOnly) return;
    const fieldArray = getFieldArray(party);
    fieldArray.remove(index);
    toast.success("Đã xóa khách hàng");
  };

  const handleCustomerSave = (customerData: CustomerSummary) => {
    if (readOnly) return;
    console.log('👥 Adding customer to party:', currentParty, customerData);
    
    // Check for duplicates within the same party
    const currentPartyCustomers = getParties(currentParty);
    const isAlreadyInSameParty = currentPartyCustomers.some(existing => 
      existing.id === customerData.id && (!editingCustomer || existing.id !== editingCustomer.id)
    );
    
    if (isAlreadyInSameParty) {
      toast.error(`Khách hàng "${customerData.fullName}" đã có trong ${getPartyLabel(currentParty)}. Không thể thêm cùng một khách hàng nhiều lần trong cùng một bên.`);
      return;
    }
    
    // Check for document ID duplicates within the same party
    const customerDocId = customerData.documentId || customerData.passportId;
    const isDocIdDuplicateInSameParty = currentPartyCustomers.some(existing => {
      const existingDocId = existing.documentId || existing.passportId;
      return existingDocId && customerDocId && existingDocId === customerDocId && 
        (!editingCustomer || existing.id !== editingCustomer.id);
    });
    
    if (isDocIdDuplicateInSameParty) {
      toast.error(`Số giấy tờ "${customerDocId}" đã được sử dụng trong ${getPartyLabel(currentParty)}. Không thể có số giấy tờ trùng lặp.`);
      return;
    }
    
    // Ensure all required fields are properly formatted
    const normalizedCustomerData: CustomerSummary = {
      ...customerData,
      phone: customerData.phone || '',
      email: customerData.email || '',
      documentId: customerData.documentId || '',
      passportId: customerData.passportId || '',
      businessRegistrationNumber: customerData.businessRegistrationNumber || '',
      businessName: customerData.businessName || '',
      createdAt: customerData.createdAt || new Date().toISOString(),
      updatedAt: customerData.updatedAt || new Date().toISOString(),
    };
    
    console.log('👥 Normalized customer data:', normalizedCustomerData);
    const fieldArray = getFieldArray(currentParty);

    if (editingCustomer) {
      // Find the index of the existing customer by ID
      const customers = getParties(currentParty);
      const existingIndex = customers.findIndex(c => c.id === editingCustomer.id);
      
      if (existingIndex !== -1) {
        // Edit existing customer
        console.log('✏️ Updating existing customer at index:', existingIndex);
        fieldArray.update(existingIndex, normalizedCustomerData);
        toast.success("Đã cập nhật thông tin khách hàng");
      } else {
        // Add new customer if not found
        console.log('➕ Adding customer (not found for edit)');
        fieldArray.append(normalizedCustomerData);
        toast.success("Đã thêm khách hàng mới");
      }
    } else {
      // Add new customer
      console.log('➕ Adding new customer to party', currentParty);
      fieldArray.append(normalizedCustomerData);
      toast.success("Đã thêm khách hàng mới");
    }

    // Log current state after adding
    setTimeout(() => {
      const updatedA = watch("parties.A");
      const updatedB = watch("parties.B");
      console.log('🔍 Form state after customer add:', {
        A: updatedA?.length || 0,
        B: updatedB?.length || 0,
        AData: updatedA,
        BData: updatedB
      });
    }, 100);

    handleDialogOpenChange(false);
  };

  // Enhanced function to get customer type badge from API data or form data
  const getCustomerTypeBadge = (customer: CustomerSummary) => {
    const customerId = customer.id;
    const details = customerDetails[customerId];

    // Use API data if available
    if (details && details.type !== undefined) {
      const isIndividual = details.type === 0;
      return isIndividual ? (
        <Badge variant="secondary">Cá nhân</Badge>
      ) : (
        <Badge variant="outline">Tổ chức</Badge>
      );
    }

    // Use form data as fallback
    if (customer.type !== undefined) {
      const isIndividual = customer.type === 0;
      return isIndividual ? (
        <Badge variant="secondary">Cá nhân</Badge>
      ) : (
        <Badge variant="outline">Tổ chức</Badge>
      );
    }

    // Final fallback based on business fields
    const isOrganization =
      customer.businessName ||
      customer.businessRegistrationNumber;

    return isOrganization ? (
      <Badge variant="outline">Tổ chức</Badge>
    ) : (
      <Badge variant="secondary">Cá nhân</Badge>
    );
  };

  // 🆕 Enhanced table với thông tin đầy đủ từ API
  const renderCustomerTable = (
    customers: CustomerSummary[],
    party: PartyKey
  ) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Tên khách hàng</TableHead>
            <TableHead className="font-semibold">Loại</TableHead>
            <TableHead className="font-semibold">Điện thoại</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Địa chỉ</TableHead>
            <TableHead className="font-semibold">CMND/CCCD</TableHead>
            <TableHead className="font-semibold">Passport</TableHead>
            <TableHead className="font-semibold">Tổ chức</TableHead>
            {!readOnly && (
              <TableHead className="font-semibold">Thao tác</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => {
            const customerId = customer.id;
            const details = customerDetails[customerId];
            const isLoading = loadingCustomers[customerId];

            return (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {details?.fullName || customer.fullName}
                      </div>
                      {(details?.businessName || customer.businessName) && (
                        <div className="text-sm text-muted-foreground">
                          {details?.businessName || customer.businessName}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getCustomerTypeBadge(customer)}</TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {details?.phone || customer.phone || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{details?.email || customer.email || "-"}</div>
                </TableCell>
                <TableCell className="max-w-[200px]" title={details?.address || customer.address}>
                  <div className="text-sm">{details?.address || customer.address || "-"}</div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {details?.documentId || customer.documentId || "-"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {details?.passportId || customer.passportId || "-"}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{details?.businessName || customer.businessName || "-"}</div>
                    {(details?.businessRegistrationNumber || customer.businessRegistrationNumber) && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {details?.businessRegistrationNumber || customer.businessRegistrationNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleEditCustomer(party, customer, index)
                        }
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
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
  // 🆕 Enhanced table với thông tin đầy đủ từ API
  const renderCustomerTable = (
    customers: CustomerSummary[],
    party: PartyKey
  ) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Tên khách hàng</TableHead>
            <TableHead className="font-semibold">Loại</TableHead>
            <TableHead className="font-semibold">Điện thoại</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Địa chỉ</TableHead>
            <TableHead className="font-semibold">CMND/CCCD</TableHead>
            <TableHead className="font-semibold">Passport</TableHead>
            <TableHead className="font-semibold">Tổ chức</TableHead>
            {!readOnly && (
              <TableHead className="font-semibold">Thao tác</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => {
            const customerId = customer.id;
            const details = customerDetails[customerId];
            const isLoading = loadingCustomers[customerId];

            return (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {details?.fullName || customer.fullName}
                      </div>
                      {(details?.businessName || customer.businessName) && (
                        <div className="text-sm text-muted-foreground">
                          {details?.businessName || customer.businessName}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getCustomerTypeBadge(customer)}</TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {details?.phone || customer.phone || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{details?.email || customer.email || "-"}</div>
                </TableCell>
                <TableCell className="max-w-[200px]" title={details?.address || customer.address}>
                  <div className="text-sm">{details?.address || customer.address || "-"}</div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {details?.documentId || customer.documentId || "-"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {details?.passportId || customer.passportId || "-"}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{details?.businessName || customer.businessName || "-"}</div>
                    {(details?.businessRegistrationNumber || customer.businessRegistrationNumber) && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {details?.businessRegistrationNumber || customer.businessRegistrationNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleEditCustomer(party, customer, index)
                        }
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
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const renderEmptyState = (party: PartyKey) => (
    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {readOnly ? "Không có khách hàng" : "Chưa có khách hàng"}
      </h3>
      {!readOnly && (
        <p className="text-muted-foreground mb-4">
          Nhấn nút bên dưới để thêm khách hàng cho {getPartyLabel(party)}
        </p>
      )}
    </div>
  );
  const renderEmptyState = (party: PartyKey) => (
    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {readOnly ? "Không có khách hàng" : "Chưa có khách hàng"}
      </h3>
      {!readOnly && (
        <p className="text-muted-foreground mb-4">
          Nhấn nút bên dưới để thêm khách hàng cho {getPartyLabel(party)}
        </p>
      )}
    </div>
  );

  const renderPartySection = (party: PartyKey) => {
    const fieldArray = getFieldArray(party);
    const customers = fieldArray.fields as CustomerSummary[];
    const hasError = (errors?.parties as any)?.[party];
  const renderPartySection = (party: PartyKey) => {
    const fieldArray = getFieldArray(party);
    const customers = fieldArray.fields as CustomerSummary[];
    const hasError = (errors?.parties as any)?.[party];

    return (
      <Card key={party} className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-600" />
            <span className="font-semibold">{getPartyLabel(party)}</span>
            {customers.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({customers.length} khách hàng)
              </span>
            )}
            {hasError && !readOnly && (
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
    return (
      <Card key={party} className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-600" />
            <span className="font-semibold">{getPartyLabel(party)}</span>
            {customers.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({customers.length} khách hàng)
              </span>
            )}
            {hasError && !readOnly && (
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

            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddCustomer(party)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {customers.length > 0
                  ? "Thêm khách hàng khác"
                  : "Thêm khách hàng"}
              </Button>
            )}
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddCustomer(party)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {customers.length > 0
                  ? "Thêm khách hàng khác"
                  : "Thêm khách hàng"}
              </Button>
            )}

            {hasError && !readOnly && (
              <p className="text-sm text-red-500">
                {party === "A" || party === "B"
                  ? `${getPartyLabel(party)} phải có ít nhất 1 khách hàng`
                  : "Có lỗi trong thông tin khách hàng"}
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  };
            {hasError && !readOnly && (
              <p className="text-sm text-red-500">
                {party === "A" || party === "B"
                  ? `${getPartyLabel(party)} phải có ít nhất 1 khách hàng`
                  : "Có lỗi trong thông tin khách hàng"}
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Accordion
        type="single"
        collapsible
        defaultValue="parties-info"
        className="w-full"
      >
        <AccordionItem value="parties-info">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Thông tin các bên
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* All cards in a single column */}
            <div className="space-y-6">
              {renderPartySection("A")}
              {renderPartySection("B")}
              {renderPartySection("C")}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
  return (
    <>
      <Accordion
        type="single"
        collapsible
        defaultValue="parties-info"
        className="w-full"
      >
        <AccordionItem value="parties-info">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Thông tin các bên
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* All cards in a single column */}
            <div className="space-y-6">
              {renderPartySection("A")}
              {renderPartySection("B")}
              {renderPartySection("C")}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!readOnly && (
        <CustomerDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          onSave={handleCustomerSave}
          initialData={editingCustomer}
          title={
            editingCustomer
              ? "Chỉnh sửa khách hàng"
              : `Thêm khách hàng - ${getPartyLabel(currentParty)}`
          }
          existingCustomers={[
            ...watchedPartiesA,
            ...watchedPartiesB,
            ...watchedPartiesC
          ]}
        />
      )}
    </>
  );
}