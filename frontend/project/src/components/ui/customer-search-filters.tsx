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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-orange-600" />
            Tìm kiếm khách hàng
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
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
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search">
              Tìm kiếm CMND/CCCD, Passport cho cá nhân | Số doanh nghiệp cho KH doanh nghiệp
            </Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nhập thông tin tìm kiếm..."
              className="mt-1"
              disabled={loading}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange('type', 0)}
              className={cn(
                "transition-colors",
                filters.type === 0 && "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
              )}
            >
              Cá nhân
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFilterChange('type', 1)}
              className={cn(
                "transition-colors",
                filters.type === 1 && "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
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