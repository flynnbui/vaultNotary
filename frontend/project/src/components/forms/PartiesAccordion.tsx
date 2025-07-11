"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
  const watchedPartiesA = watch("parties.A") || [];
  const watchedPartiesB = watch("parties.B") || [];
  const watchedPartiesC = watch("parties.C") || [];

  

  // 🆕 Function để load chi tiết khách hàng
// Thay thế useEffect trong PartiesAccordion (paste-2.txt)
useEffect(() => {
  console.log("🔍 [PartiesAccordion] useEffect triggered");
  console.log("🔍 [PartiesAccordion] watchedPartiesA:", watchedPartiesA);
  console.log("🔍 [PartiesAccordion] watchedPartiesB:", watchedPartiesB);
  console.log("🔍 [PartiesAccordion] watchedPartiesC:", watchedPartiesC);
  
  const allCustomers = [
    ...watchedPartiesA,
    ...watchedPartiesB,
    ...watchedPartiesC
  ];
  
  console.log("🔍 [PartiesAccordion] allCustomers:", allCustomers);
  console.log("🔍 [PartiesAccordion] allCustomers length:", allCustomers.length);

  if (allCustomers.length === 0) {
    console.warn("⚠️ [PartiesAccordion] No customers found in watched parties");
    return;
  }

  allCustomers.forEach((customer, index) => {
    console.log(`🔍 [PartiesAccordion] Processing customer ${index}:`, customer);
    
    if (customer?.id) {
      console.log(`🔍 [PartiesAccordion] Customer ${index} has ID: ${customer.id}`);
      
      // Chỉ load nếu chưa có dữ liệu và không đang loading
      if (!customerDetails[customer.id] && !loadingCustomers[customer.id]) {
        console.log(`🔍 [PartiesAccordion] Loading details for customer: ${customer.id}`);
        loadCustomerDetails(customer.id);
      } else {
        console.log(`✅ [PartiesAccordion] Customer ${customer.id} already loaded or loading`);
      }
    } else {
      console.warn(`⚠️ [PartiesAccordion] Customer ${index} has no ID:`, customer);
    }
  });
}, [watchedPartiesA, watchedPartiesB, watchedPartiesC, customerDetails, loadingCustomers]);

// Cập nhật loadCustomerDetails function
const loadCustomerDetails = async (customerId: string) => {
  console.log(`🔍 [PartiesAccordion] loadCustomerDetails called with ID: ${customerId}`);
  
  if (!customerId) {
    console.warn("⚠️ [PartiesAccordion] No customerId provided");
    return;
  }
  
  if (customerDetails[customerId]) {
    console.log(`✅ [PartiesAccordion] Customer ${customerId} already loaded`);
    return;
  }
  
  if (loadingCustomers[customerId]) {
    console.log(`⏳ [PartiesAccordion] Customer ${customerId} already loading`);
    return;
  }

  console.log(`🔄 [PartiesAccordion] Starting to load customer: ${customerId}`);
  setLoadingCustomers((prev) => ({ ...prev, [customerId]: true }));

  try {
    console.log(`🌐 [PartiesAccordion] Calling API getCustomerById(${customerId})`);
    const customer = await getCustomerById(customerId);
    
    console.log(`🌐 [PartiesAccordion] API response for ${customerId}:`, customer);

    if (customer) {
      console.log(`✅ [PartiesAccordion] Successfully loaded customer ${customerId}`);
      setCustomerDetails((prev) => ({
        ...prev,
        [customerId]: customer as CustomerDetails,
      }));
    } else {
      console.warn(`⚠️ [PartiesAccordion] No customer data returned for ID: ${customerId}`);
    }
  } catch (error) {
    console.error(`❌ [PartiesAccordion] Error loading customer ${customerId}:`, error);
  } finally {
    console.log(`🏁 [PartiesAccordion] Finished loading customer ${customerId}`);
    setLoadingCustomers((prev) => ({ ...prev, [customerId]: false }));
  }
};


  // 🔍 Load customer details when parties change
  useEffect(() => {
    console.log("🔍 Debug - Watched parties:");
    console.log("- Bên A:", watchedPartiesA);
    console.log("- Bên B:", watchedPartiesB);
    console.log("- Bên C:", watchedPartiesC);
    
    const allCustomers = [
      ...watchedPartiesA,
      ...watchedPartiesB,
      ...watchedPartiesC
    ];
    
    console.log("🔍 All customers to load:", allCustomers);

    allCustomers.forEach(customer => {
      if (customer?.id) {
        console.log(`🔍 Found customer ID: ${customer.id}`);
        if (!customerDetails[customer.id]) {
          loadCustomerDetails(customer.id);
        } else {
          console.log(`✅ Customer ${customer.id} already loaded`);
        }
      } else {
        console.log("⚠️ Customer without ID:", customer);
      }
    });
  }, [watchedPartiesA, watchedPartiesB, watchedPartiesC]);

  // 🔍 Debug customer details state
  useEffect(() => {
    console.log("🔍 Customer details state updated:", customerDetails);
    console.log("🔍 Loading customers state:", loadingCustomers);
  }, [customerDetails, loadingCustomers]);

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

  const handleEditCustomer = (
    party: PartyKey,
    customer: CustomerSummary,
    index: number
  ) => {
    if (readOnly) return;
    setCurrentParty(party);
    setEditingCustomer({ ...customer, index });
    handleDialogOpenChange(true);
  };

  const handleRemoveCustomer = (party: PartyKey, index: number) => {
    if (readOnly) return;
    const fieldArray = getFieldArray(party);
    fieldArray.remove(index);
    toast.success("Đã xóa khách hàng");
  };

  const handleCustomerSave = (customerData: CustomerSummary) => {
    if (readOnly) return;
    const fieldArray = getFieldArray(currentParty);

    if (editingCustomer && "index" in editingCustomer) {
      // Edit existing customer
      fieldArray.update(editingCustomer.index ?? 0, customerData);
      toast.success("Đã cập nhật thông tin khách hàng");
    } else {
      // Add new customer
      fieldArray.append(customerData);
      toast.success("Đã thêm khách hàng mới");
    }

    handleDialogOpenChange(false);
  };

  // 🆕 Enhanced function để lấy badge loại khách hàng từ API data
  const getCustomerTypeBadge = (customer: CustomerSummary) => {
    const customerId = customer.id;
    const details = customerDetails[customerId];

    if (details) {
      // Sử dụng type từ API (0 = Individual, 1 = Business)
      const isIndividual = details.type === 0;
      return isIndividual ? (
        <Badge variant="secondary">Cá nhân</Badge>
      ) : (
        <Badge variant="outline">Tổ chức</Badge>
      );
    }

    // Fallback nếu chưa có dữ liệu từ API
    const isOrganization =
      (customer as any).businessName ||
      (customer as any).businessRegistrationNumber ||
      (customer as any).type === 1;

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
                      {details?.businessName && (
                        <div className="text-sm text-muted-foreground">
                          {details.businessName}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getCustomerTypeBadge(customer)}</TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {details?.phone || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{details?.email || "-"}</div>
                </TableCell>
                <TableCell className="max-w-[200px]" title={details?.address}>
                  <div className="text-sm">{details?.address || "-"}</div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {details?.documentId || "-"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {details?.passportId || "-"}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{details?.businessName || "-"}</div>
                    {details?.businessRegistrationNumber && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {details.businessRegistrationNumber}
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
        />
      )}
    </>
  );
}