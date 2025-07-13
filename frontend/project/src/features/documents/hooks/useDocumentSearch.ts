import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { DocumentDto, PagedResultDto } from '@/src/types/api.types';
import useDocumentApiService from '../services/documentApiService';

interface UseDocumentSearchProps {
  initialPage?: number;
  initialItemsPerPage?: number;
}

export const useDocumentSearch = ({ 
  initialPage = 1, 
  initialItemsPerPage = 5 
}: UseDocumentSearchProps = {}) => {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const { getPaginatedDocuments } = useDocumentApiService();

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use unified paginated endpoint with optional search term
      const response = await getPaginatedDocuments(currentPage, itemsPerPage, debouncedSearchTerm.trim() || undefined);

      if (response) {
        setDocuments(response.items || []);
        setTotalItems(response.totalCount || 0);
      } else {
        setDocuments([]);
        setTotalItems(0);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách hồ sơ từ máy chủ");
      setDocuments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, getPaginatedDocuments]);

  // Debounce search term changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Load documents when page or debounced search term changes
  useEffect(() => {
    loadDocuments();
  }, [currentPage, debouncedSearchTerm, loadDocuments]);

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refreshDocuments = useCallback(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    documents,
    loading,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handleSearchChange,
    handlePageChange,
    refreshDocuments,
    loadDocuments
  };
};