import { useQuery } from '@tanstack/react-query';
import useCustomerApiService from '../services/customerApiService';
import { CustomerDto } from '@/src/types/api.types';

// Query key factory for consistent cache keys
export const customerQueryKeys = {
  all: ['customers'] as const,
  lists: () => [...customerQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...customerQueryKeys.lists(), filters] as const,
  details: () => [...customerQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerQueryKeys.details(), id] as const,
  search: (term: string) => [...customerQueryKeys.all, 'search', term] as const,
};

/**
 * Hook to fetch customers with pagination
 */
export const useCustomers = (pageNumber = 1, pageSize = 10) => {
  const { getPaginatedCustomers } = useCustomerApiService();
  
  return useQuery({
    queryKey: customerQueryKeys.list({ pageNumber, pageSize }),
    queryFn: () => getPaginatedCustomers(pageNumber, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch a single customer by ID
 */
export const useCustomer = (id: string) => {
  const { getCustomerById } = useCustomerApiService();
  
  return useQuery({
    queryKey: customerQueryKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to search customers with debouncing
 */
export const useCustomerSearch = (searchTerm: string, pageNumber = 1, pageSize = 10) => {
  const { searchCustomers } = useCustomerApiService();
  
  return useQuery({
    queryKey: customerQueryKeys.search(searchTerm + `_${pageNumber}_${pageSize}`),
    queryFn: () => searchCustomers(searchTerm, pageNumber, pageSize),
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get all customers (for dropdowns and selects)
 */
export const useAllCustomers = () => {
  const { getAllCustomers } = useCustomerApiService();
  
  return useQuery({
    queryKey: customerQueryKeys.lists(),
    queryFn: () => getAllCustomers(),
    staleTime: 1000 * 60 * 10, // 10 minutes - customer list changes less frequently
  });
};