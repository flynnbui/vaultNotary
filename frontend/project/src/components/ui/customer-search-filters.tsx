"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchIcon, X, Loader2, Info, XCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { CustomerFilterOptions } from "@/src/types/customer.type";
import { validateIdFormat, getIdSearchHelpText } from "@/src/lib/customer-validation";

type SearchMode = 'general' | 'exact-id';

interface CustomerSearchFiltersProps {
  onFiltersChange: (filters: CustomerFilterOptions) => void;
  onSearch: (searchTerm: string) => void;
  loading?: boolean;
  mode?: SearchMode;
  onExactIdSearch?: (id: string) => void;
  placeholder?: string;
  showTypeFilters?: boolean;
}

export function CustomerSearchFilters({ 
  onFiltersChange, 
  onSearch, 
  loading = false,
  mode = 'general',
  onExactIdSearch,
  placeholder,
  showTypeFilters = true
}: CustomerSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CustomerFilterOptions>({});
  const [searchError, setSearchError] = useState("");

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
    
    // Clear previous error
    setSearchError('');
    
    if (mode === 'exact-id' && value.trim()) {
      // Validate ID format in exact-id mode
      const validation = validateIdFormat(value);
      if (!validation.isValid) {
        setSearchError(validation.error || '');
      }
    } else if (mode === 'general') {
      // Use debounced search for general mode
      debouncedSearch(value);
    }
  };

  const handleExactIdSearch = () => {
    if (mode === 'exact-id' && onExactIdSearch && !searchError && searchTerm.trim()) {
      onExactIdSearch(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'exact-id') {
        handleExactIdSearch();
      }
    }
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
            {mode === 'exact-id' ? (
              <>
                <Label htmlFor="search" className="text-sm font-medium">
                  Tìm kiếm bằng ID chính xác
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={placeholder || "Nhập số CMND/Passport (VD: 068203000015 hoặc A1234567)"}
                      className={`min-h-[44px] text-base ${searchError ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={loading}
                    />
                    {searchError && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {searchError}
                      </p>
                    )}
                  </div>
                  {onExactIdSearch && (
                    <Button
                      type="button"
                      onClick={handleExactIdSearch}
                      disabled={loading || !searchTerm.trim() || !!searchError}
                      className="px-6 min-h-[44px] sm:min-h-auto text-white"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SearchIcon className="h-4 w-4" />
                      )}
                      Tìm kiếm
                    </Button>
                  )}
                </div>
                {!searchError && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {getIdSearchHelpText()}
                  </p>
                )}
              </>
            ) : (
              <>
                <Label htmlFor="search" className="text-sm font-medium">
                  <span className="block md:hidden">Tìm kiếm CMND/CCCD, Passport, số doanh nghiệp</span>
                  <span className="hidden md:block">Tìm kiếm CMND/CCCD, Passport cho cá nhân | Số doanh nghiệp cho KH doanh nghiệp</span>
                </Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={placeholder || "Nhập thông tin tìm kiếm..."}
                  className="min-h-[44px] text-base"
                  disabled={loading}
                />
              </>
            )}
          </div>
          
          {showTypeFilters && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}