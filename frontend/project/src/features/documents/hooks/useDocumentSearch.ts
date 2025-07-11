import { useState, useCallback, useEffect } from 'react';
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
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const { getPaginatedDocuments } = useDocumentApiService();

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedDocuments(currentPage, itemsPerPage);

      if (response) {
        let filteredItems = response.items || [];

        // Apply search filter
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(
            (doc) =>
              doc.transactionCode?.toLowerCase().includes(searchLower) ||
              doc.description?.toLowerCase().includes(searchLower) ||
              doc.secretary?.toLowerCase().includes(searchLower) ||
              doc.notaryPublic?.toLowerCase().includes(searchLower) ||
              doc.documentType?.toLowerCase().includes(searchLower)
          );
        }

        setDocuments(filteredItems);
        setTotalItems(searchTerm.trim() ? filteredItems.length : response.totalItems || 0);
      } else {
        setDocuments([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Không thể tải danh sách hồ sơ từ máy chủ");
      setDocuments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, getPaginatedDocuments]);

  // Load documents when page or search term changes
  useEffect(() => {
    loadDocuments();
  }, [currentPage, searchTerm, loadDocuments]);

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
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