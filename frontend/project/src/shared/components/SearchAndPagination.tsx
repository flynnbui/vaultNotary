import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchAndPaginationProps {
  // Search props
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  searchTitle?: string;
  
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  
  // Loading state
  loading?: boolean;
}

export const SearchAndPagination: React.FC<SearchAndPaginationProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Nhập thông tin tìm kiếm...",
  searchLabel = "Tìm kiếm",
  searchTitle = "Tìm kiếm",
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startItem,
  endItem,
  onPageChange,
  loading = false,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const renderPaginationButtons = () => {
    return (
      <>
        {/* Desktop pagination */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="h-8 px-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers for desktop */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!showPage) {
                if (page === 2 && currentPage > 4) {
                  return <span key={page} className="px-2 text-sm text-gray-500">...</span>;
                }
                if (page === totalPages - 1 && currentPage < totalPages - 3) {
                  return <span key={page} className="px-2 text-sm text-gray-500">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page
                      ? "bg-[#800020] hover:bg-[#722F37] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="h-8 px-3"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile pagination - simplified */}
        <div className="flex md:hidden items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="min-h-[44px] px-3 text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs">Trước</span>
          </Button>
          
          <span className="text-xs font-medium px-2 py-2 bg-muted rounded">
            {currentPage}/{totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="min-h-[44px] px-3 text-sm"
          >
            <span className="text-xs">Sau</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-[#800020] dark:text-[#e6b3b3]" />
            <span className="text-base md:text-lg">{searchTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">{searchLabel}</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="mt-1 min-h-[44px] text-sm md:text-base"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Section */}
      {totalItems > 0 && (
        <div className="px-6 py-4 border-t bg-muted/20 rounded-lg">
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>
                Hiển thị {startItem}-{endItem} trong tổng số {totalItems} kết quả
              </span>
            </div>
            <div className="flex items-center gap-2">
              {renderPaginationButtons()}
            </div>
          </div>
          
          {/* Mobile layout - stacked */}
          <div className="md:hidden space-y-4">
            <div className="text-center text-xs text-muted-foreground">
              Hiển thị {startItem}-{endItem} trong tổng số {totalItems} kết quả
            </div>
            <div className="flex justify-center">
              {renderPaginationButtons()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};