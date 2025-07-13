"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Separator } from "@/src/components/ui/separator";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Calendar, 
  Eye, 
  Download,
  AlertCircle,
  Clock,
  CheckCircle
} from "lucide-react";
import { CustomerType } from "@/src/types/customer.type";
import { DocumentListType } from "@/src/types/document.type";
import useCustomerService from "@/src/services/useCustomerService";
import useDocumentApiService from "@/src/features/documents/services/documentApiService";
import { formatDate } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";

interface CustomerDetailsDialogProps {
  customer: CustomerType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (customer: CustomerType) => void;
}

export function CustomerDetailsDialog({ 
  customer, 
  open, 
  onOpenChange, 
  onEdit 
}: CustomerDetailsDialogProps) {
  const [customerDocuments, setCustomerDocuments] = useState<DocumentListType[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentListType | null>(null);
  const { getCustomerDocuments } = useCustomerService();
  const { getDocumentById } = useDocumentApiService();

  const loadCustomerDocuments = useCallback(async () => {
    if (!customer) return;
    
    try {
      setDocumentsLoading(true);
      const response = await getCustomerDocuments(customer.id);
      setCustomerDocuments(response?.items || []);
    } catch (error) {
    } finally {
      setDocumentsLoading(false);
    }
  }, [customer, getCustomerDocuments]);

  useEffect(() => {
    if (customer && open) {
      loadCustomerDocuments();
    }
  }, [customer, open, loadCustomerDocuments]);

  const handleDocumentClick = async (document: DocumentListType) => {
    setSelectedDocument(document);
  };

  const getCustomerTypeInfo = (type: number) => {
    const isIndividual = type === 0; // Backend uses 0 for Individual, 1 for Business
    return {
      label: isIndividual ? "Cá nhân" : "Doanh nghiệp",
      icon: isIndividual ? User : Building,
      variant: isIndividual ? "secondary" : "outline" as const
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!customer) return null;

  const typeInfo = getCustomerTypeInfo(customer.type);
  const TypeIcon = typeInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <TypeIcon className="h-6 w-6 text-[#800020]" />
            Chi tiết khách hàng
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="documents" className="relative">
              Tài liệu liên quan
              {customerDocuments.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {customerDocuments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="h-5 w-5 text-[#800020]" />
                    Thông tin cơ bản
                  </div>
                  <Badge variant={typeInfo.variant as "default" | "destructive" | "outline" | "secondary"}>
                    {typeInfo.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Họ và tên</p>
                        <p className="text-sm text-muted-foreground">{customer.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Số điện thoại</p>
                        <p className="text-sm text-muted-foreground">{customer.phone || "Chưa cung cấp"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{customer.email || "Chưa cung cấp"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Địa chỉ</p>
                        <p className="text-sm text-muted-foreground">{customer.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">CMND/CCCD</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {customer.documentId || "Chưa cung cấp"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Passport</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {customer.passportId || "Chưa cung cấp"}
                        </p>
                      </div>
                    </div>

                    {customer.type === 1 && (
                      <>
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Tên doanh nghiệp</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.businessName || "Chưa cung cấp"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Số đăng ký kinh doanh</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {customer.businessRegistrationNumber || "Chưa cung cấp"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Tạo: {formatDate(new Date(customer.createdAt))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Cập nhật: {formatDate(new Date(customer.updatedAt))}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => onEdit?.(customer)}
                    className="bg-[#800020] hover:bg-[#722F37] text-white"
                  >
                    Chỉnh sửa thông tin
                  </Button>
                  <Button variant="outline">
                    Xem lịch sử
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#800020]" />
                  Tài liệu liên quan ({customerDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {documentsLoading ? (
                    <div className="p-6 space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : customerDocuments.length === 0 ? (
                    <div className="p-12 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Chưa có tài liệu
                      </h3>
                      <p className="text-muted-foreground">
                        Khách hàng này chưa có tài liệu nào trong hệ thống.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="space-y-3">
                        {customerDocuments.map((document) => (
                          <div
                            key={document.id}
                            className={cn(
                              "flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                              selectedDocument?.id === document.id && "bg-[#800020]/10 dark:bg-[#800020]/20 border-[#800020]/30 dark:border-[#800020]/40"
                            )}
                            onClick={() => handleDocumentClick(document)}
                          >
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 bg-[#800020]/20 dark:bg-[#800020]/40 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-[#800020] dark:text-[#e6b3b3]" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">
                                  {document.documentType}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {document.transactionCode}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {document.description || "Không có mô tả"}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>Thư ký: {document.secretary}</span>
                                <span>Công chứng viên: {document.notaryPublic}</span>
                                <span>{formatDate(new Date(document.createdDate))}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Tải
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}