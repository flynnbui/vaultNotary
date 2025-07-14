import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCustomerApiService from '../services/customerApiService';
import { customerQueryKeys } from './useCustomerQueries';
import { documentQueryKeys } from '../../documents/hooks/useDocumentQueries';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto } from '@/src/types/api.types';

/**
 * Hook to create a new customer with optimistic updates
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { createCustomer } = useCustomerApiService();

  return useMutation({
    mutationFn: (customerData: CreateCustomerDto) => createCustomer(customerData),
    onMutate: async (newCustomer) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: customerQueryKeys.lists() });

      // Snapshot the previous value
      const previousCustomers = queryClient.getQueryData(customerQueryKeys.lists());

      // Optimistically update to the new value
      // Note: We can't optimistically update the list without knowing the ID
      // So we'll just invalidate the list queries after success

      return { previousCustomers };
    },
    onError: (err, newCustomer, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCustomers) {
        queryClient.setQueryData(customerQueryKeys.lists(), context.previousCustomers);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch customer lists
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      
      // Set the created customer in the detail cache
      if (data?.id) {
        queryClient.setQueryData(customerQueryKeys.detail(data.id), data);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
    },
  });
};

/**
 * Hook to update a customer with optimistic updates
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { updateCustomer } = useCustomerApiService();

  return useMutation({
    mutationFn: ({ id, customerData }: { id: string; customerData: UpdateCustomerDto }) => 
      updateCustomer(id, customerData),
    onMutate: async ({ id, customerData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: customerQueryKeys.detail(id) });

      // Snapshot the previous value
      const previousCustomer = queryClient.getQueryData<CustomerDto>(customerQueryKeys.detail(id));

      // Optimistically update to the new value
      if (previousCustomer) {
        queryClient.setQueryData(customerQueryKeys.detail(id), {
          ...previousCustomer,
          ...customerData,
        });
      }

      return { previousCustomer };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCustomer) {
        queryClient.setQueryData(customerQueryKeys.detail(id), context.previousCustomer);
      }
    },
    onSuccess: (data, { id }) => {
      // Update the customer detail cache with the response
      if (data) {
        queryClient.setQueryData(customerQueryKeys.detail(id), data);
      }
      
      // Invalidate customer lists to show updated data
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      
      // Invalidate document queries that might contain this customer
      queryClient.invalidateQueries({ 
        queryKey: documentQueryKeys.all,
        predicate: (query) => {
          // Invalidate document queries with parties that might contain this customer
          const queryKey = query.queryKey;
          return queryKey.includes('parties') || queryKey.includes('parties,files');
        }
      });
    },
    onSettled: ({ id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.detail(id) });
    },
  });
};

/**
 * Hook to delete a customer
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { deleteCustomer } = useCustomerApiService();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: customerQueryKeys.detail(id) });

      // Snapshot the previous value
      const previousCustomer = queryClient.getQueryData(customerQueryKeys.detail(id));

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: customerQueryKeys.detail(id) });

      return { previousCustomer };
    },
    onError: (err, id, context) => {
      // If the mutation fails, restore the customer
      if (context?.previousCustomer) {
        queryClient.setQueryData(customerQueryKeys.detail(id), context.previousCustomer);
      }
    },
    onSuccess: (data, id) => {
      // Remove the customer from cache
      queryClient.removeQueries({ queryKey: customerQueryKeys.detail(id) });
      
      // Invalidate customer lists
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      
      // Invalidate document queries that might contain this customer
      queryClient.invalidateQueries({ 
        queryKey: documentQueryKeys.all,
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.includes('parties') || queryKey.includes('parties,files');
        }
      });
    },
    onSettled: (data, error, id) => {
      // Always refetch lists after error or success
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
    },
  });
};