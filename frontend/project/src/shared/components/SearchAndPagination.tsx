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
    const buttons = [];
    
    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="h-8 px-3"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      const showPage =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1);

      if (!showPage) {
        if (i === 2 && currentPage > 4) {
          pageNumbers.push(
            <span key={i} className="px-2 text-sm text-gray-500">
              ...
            </span>
          );
        }
        if (i === totalPages - 1 && currentPage < totalPages - 3) {
          pageNumbers.push(
            <span key={i} className="px-2 text-sm text-gray-500">
              ...
            </span>
          );
        }
        continue;
      }

      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={loading}
          className={`h-8 w-8 p-0 ${
            currentPage === i
              ? "bg-orange-600 hover:bg-orange-700"
              : "hover:bg-gray-100"
          }`}
        >
          {i}
        </Button>
      );
    }

    buttons.push(
      <div key="pages" className="flex items-center gap-1">
        {pageNumbers}
      </div>
    );

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="h-8 px-3"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-orange-600" />
            {searchTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">{searchLabel}</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Section */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20 rounded-lg">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              Hiển thị {startItem}-{endItem} trong tổng số {totalItems} kết quả
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};