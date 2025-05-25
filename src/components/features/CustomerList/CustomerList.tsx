import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Spinner,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../../../hooks/useCustomers';
import { Customer, CustomerFormData, CustomerFilters as ICustomerFilters } from '../../../types/customer';
import { CustomerFilters } from './CustomerFilters';
import { CustomerForm } from './CustomerForm';

export const CustomerList: React.FC = () => {
  const [filters, setFilters] = useState<ICustomerFilters>({
    sortBy: 'full_name',
    sortOrder: 'asc',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomers(filters);

  const handleFiltersChange = (newFilters: ICustomerFilters) => {
    setFilters(newFilters);
  };

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id);
    onDeleteDialogOpen();
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      setCustomerToDelete(null);
      onDeleteDialogClose();
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    onOpen();
  };

  const handleSubmit = async (data: CustomerFormData) => {
    if (selectedCustomer) {
      await updateCustomer({ id: selectedCustomer.id, data });
    } else {
      await createCustomer(data);
    }
    onClose();
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Müşteriler</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAdd}
        >
          Yeni Müşteri
        </Button>
      </Flex>

      <CustomerFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Müşteri Adı</Th>
              <Th>E-posta</Th>
              <Th>Telefon</Th>
              <Th>Son Randevu</Th>
              <Th>Bakiye</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {customers?.map((customer: Customer) => (
              <Tr key={customer.id}>
                <Td>
                  <Link to={`/customers/${customer.id}`}>
                    {customer.full_name}
                  </Link>
                </Td>
                <Td>{customer.email || '-'}</Td>
                <Td>{customer.phone || '-'}</Td>
                <Td>{customer.last_appointment_date ? new Date(customer.last_appointment_date).toLocaleDateString() : '-'}</Td>
                <Td color={customer.total_outstanding_balance_from_jobs && customer.total_outstanding_balance_from_jobs > 0 ? 'red.500' : 'green.500'}>
                  {customer.total_outstanding_balance_from_jobs != null ? `${customer.total_outstanding_balance_from_jobs.toFixed(2)} TL` : '-'}
                </Td>
                <Td>
                  <IconButton
                    aria-label="Düzenle"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleEdit(customer)}
                    isLoading={isUpdating}
                  />
                  <IconButton
                    aria-label="Sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    isLoading={isDeleting && customerToDelete === customer.id}
                    onClick={() => handleDeleteClick(customer.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <CustomerForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={selectedCustomer}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Müşteri Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm veriler silinecektir.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                İptal
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isDeleting}
              >
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}; 