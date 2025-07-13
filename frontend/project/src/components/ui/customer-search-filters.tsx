"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { CustomerFilterOptions } from "@/src/types/customer.type";

interface CustomerSearchFiltersProps {
  onFiltersChange: (filters: CustomerFilterOptions) => void;
  onSearch: (searchTerm: string) => void;
  loading?: boolean;
}

export function CustomerSearchFilters({ 
  onFiltersChange, 
  onSearch, 
  loading = false 
}: CustomerSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CustomerFilterOptions>({});

  // Debounce search to prevent excessive API calls
  const searchFunction = useCallback((value: string) => {
    onSearch(value);
  }, [onSearch]);

  const debouncedSearch = useCallback(
    (value: string) => {
      const debouncedFunction = debounce(searchFunction, 500);
      debouncedFunction(value);
    },
    [searchFunction]
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleFilterChange = (key: keyof CustomerFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    onFiltersChange({});
    onSearch("");
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4 md:h-5 md:w-5 text-[#800020] dark:text-[#e6b3b3]" />
            <span className="text-base md:text-lg">Tìm kiếm khách hàng</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFiltersCount} bộ lọc
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground min-h-[44px] text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Xóa bộ lọc</span>
                <span className="sm:hidden">Xóa</span>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              <span className="block md:hidden">Tìm kiếm CMND/CCCD, Passport, số doanh nghiệp</span>
              <span className="hidden md:block">Tìm kiếm CMND/CCCD, Passport cho cá nhân | Số doanh nghiệp cho KH doanh nghiệp</span>
            </Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nhập thông tin tìm kiếm..."
              className="min-h-[44px] text-base"
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange('type', 0)}
              className={cn(
                "transition-colors min-h-[44px] text-sm flex-1 sm:flex-none",
                filters.type === 0 && "bg-[#800020]/10 dark:bg-[#800020]/20 border-[#800020]/30 dark:border-[#800020]/50 text-[#800020] dark:text-[#e6b3b3]"
              )}
            >
              Cá nhân
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFilterChange('type', 1)}
              className={cn(
                "transition-colors min-h-[44px] text-sm flex-1 sm:flex-none",
                filters.type === 1 && "bg-[#800020]/10 dark:bg-[#800020]/20 border-[#800020]/30 dark:border-[#800020]/50 text-[#800020] dark:text-[#e6b3b3]"
              )}
            >
              Doanh nghiệp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}