"use client";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit, 
  Eye,
  FileText
} from "lucide-react";
import { CustomerType } from "@/src/types/customer.type";
import { formatDate } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";

interface CustomerCardViewProps {
  customers: CustomerType[];
  selectedCustomers: string[];
  onCustomerSelect: (customerId: string) => void;
  onCustomerEdit: (customer: CustomerType) => void;
  onCustomerView: (customer: CustomerType) => void;
  loading?: boolean;
}

export function CustomerCardView({
  customers,
  selectedCustomers,
  onCustomerSelect,
  onCustomerEdit,
  onCustomerView,
  loading = false
}: CustomerCardViewProps) {
  const getCustomerTypeInfo = (type: number) => {
    const isIndividual = type === 1;
    return {
      label: isIndividual ? "Cá nhân" : "Doanh nghiệp",
      icon: isIndividual ? User : Building,
      variant: isIndividual ? "secondary" : "outline" as const,
      color: isIndividual ? "text-blue-600" : "text-purple-600"
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div>
                    <div className="h-5 w-32 bg-muted rounded mb-2" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => {
        const typeInfo = getCustomerTypeInfo(customer.type);
        const TypeIcon = typeInfo.icon;
        const isSelected = selectedCustomers.includes(customer.id);

        return (
          <Card 
            key={customer.id} 
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              isSelected && "ring-2 ring-orange-500 ring-offset-2"
            )}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onCustomerSelect(customer.id)}
                    className="mt-1"
                  />
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn("text-white", 
                      customer.type === 1 ? "bg-blue-500" : "bg-purple-500"
                    )}>
                      {getInitials(customer.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg truncate max-w-[150px]">
                      {customer.fullName}
                    </h3>
                    <Badge variant={typeInfo.variant} className="text-xs">
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                )}
                
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground line-clamp-2">
                    {customer.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {formatDate(new Date(customer.createdAt))}
                  </span>
                </div>

                {/* Document info */}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground font-mono text-xs">
                    {customer.documentId || customer.passportId || "Chưa có"}
                  </span>
                </div>

                {/* Business info for organizations */}
                {customer.type === 2 && customer.businessName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">
                      {customer.businessName}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCustomerView(customer)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCustomerEdit(customer)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}