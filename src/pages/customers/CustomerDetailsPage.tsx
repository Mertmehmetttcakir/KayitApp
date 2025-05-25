import { AddIcon, CalendarIcon, EmailIcon, InfoOutlineIcon, LinkIcon, PhoneIcon, WarningTwoIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { PaymentModal } from '../../components/features/Payments/PaymentModal';
import { VehicleForm } from '../../components/features/Vehicles/VehicleForm';
import { VehicleList } from '../../components/features/Vehicles/VehicleList';
import { useCustomerById } from '../../hooks/useCustomers';
import { useGetJobsByCustomerId } from '../../hooks/useJobs';
import { useCustomerVehicles, useDeleteVehicle } from '../../hooks/useVehicles';
import { JobSummary } from '../../types/job';
import { Vehicle } from '../../types/vehicle';
import { formatCurrency } from '../../utils/formatters';

export const CustomerDetailsPage: React.FC = () => {
  const { id: customerId } = useParams<{ id: string }>();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: customer, isLoading: isLoadingCustomer, error: customerError, refetch: refetchCustomer } = useCustomerById(customerId);
  const { data: vehicles, isLoading: isLoadingVehicles, error: vehiclesError, refetch: refetchVehicles } = useCustomerVehicles(customerId);
  const { data: jobs, isLoading: isLoadingJobs, error: jobsError, refetch: refetchJobs } = useGetJobsByCustomerId(customerId);
  const { mutate: deleteVehicle } = useDeleteVehicle();

  const { isOpen: isVehicleFormOpen, onOpen: onVehicleFormOpen, onClose: onVehicleFormClose } = useDisclosure();
  const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<JobSummary | null>(null);

  // Mevcut araçlara göre işleri filtrele
  const filteredJobs = React.useMemo(() => {
    if (!jobs || !vehicles) return [];
    const vehicleIds = new Set(vehicles.map(v => v.id));
    // Sadece vehicle_id'si olan ve mevcut araçlar listesinde bulunan işleri göster
    return jobs.filter(job => job.vehicle_id && vehicleIds.has(job.vehicle_id));
  }, [jobs, vehicles]);

  // Filtrelenmiş işlere göre toplam bakiyeyi hesapla
  const calculatedTotalOutstandingBalance = React.useMemo(() => {
    return filteredJobs.reduce((acc, job) => acc + (job.remaining_balance_for_job ?? 0), 0);
  }, [filteredJobs]);

  if (isLoadingCustomer || (customerId && !customer && !customerError)) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Flex>
    );
  }
  if (customerError) return <Text color="red.500" fontSize="lg" p={6}>Müşteri yüklenirken hata: {customerError.message}</Text>;
  if (!customer) return <Text fontSize="lg" p={6}>Müşteri bulunamadı.</Text>;

  const handleOpenVehicleForm = (vehicle?: Vehicle) => {
    setSelectedVehicle(vehicle || null);
    onVehicleFormOpen();
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      deleteVehicle({ vehicleId, customerId: customer.id }, {
        onSuccess: () => {
          toast({ title: 'Araç başarıyla silindi.', status: 'success', duration: 3000, isClosable: true });
          refetchVehicles();
          refetchCustomer();
          refetchJobs();
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
        onError: (error) => {
          toast({ title: 'Araç silinirken bir hata oluştu.', description: error.message, status: 'error', duration: 5000, isClosable: true });
        }
      });
    }
  };

  const handleFormSuccess = () => {
    refetchVehicles();
    refetchCustomer();
    refetchJobs();
    onVehicleFormClose();
    setSelectedVehicle(null);
  };

  const handleOpenPaymentModal = (job: JobSummary) => {
    setSelectedJobForPayment(job);
    onPaymentModalOpen();
  };

  const handlePaymentSuccess = () => {
    refetchJobs();
    refetchCustomer();
  };

  const getJobStatusColor = (status: JobSummary['status']) => {
    switch (status) {
      case 'Açık': return 'blue';
      case 'Tamamlandı - Ödeme Bekliyor': return 'orange';
      case 'Kısmi Ödendi': return 'yellow';
      case 'Tamamen Ödendi': return 'green';
      case 'İptal Edildi': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        <Card variant="outline" shadow="md">
          <CardHeader pb={2}>
            <Heading size="lg" color="blue.600">{customer.full_name}</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={InfoOutlineIcon} color="gray.500" />
                <Text fontSize="md" color="gray.700">
                  <Text as="span" fontWeight="semibold">Müşteri ID:</Text> {customer.id}
                </Text>
              </HStack>
              <HStack>
                <Icon as={EmailIcon} color="gray.500" />
                <Text fontSize="md" color="gray.700">
                  <Text as="span" fontWeight="semibold">E-posta:</Text> {customer.email || 'Belirtilmemiş'}
                </Text>
              </HStack>
              <HStack>
                <Icon as={PhoneIcon} color="gray.500" />
                <Text fontSize="md" color="gray.700">
                  <Text as="span" fontWeight="semibold">Telefon:</Text> {customer.phone || 'Belirtilmemiş'}
                </Text>
              </HStack>
              <Divider pt={2} />
              <HStack spacing={4} pt={2} justifyContent="space-around">
                <Stat size="sm">
                  <StatLabel display="flex" alignItems="center">
                    <Icon as={CalendarIcon} mr={2} color="blue.500" />
                    Son Randevu
                  </StatLabel>
                  <StatNumber fontSize="md">{customer.last_appointment_date ? new Date(customer.last_appointment_date).toLocaleDateString() : 'Yok'}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel display="flex" alignItems="center">
                    <Icon as={WarningTwoIcon} mr={2} color={calculatedTotalOutstandingBalance > 0 ? 'red.500' : 'green.500'} />
                    Toplam Bakiye
                  </StatLabel>
                  <StatNumber fontSize="md" color={calculatedTotalOutstandingBalance > 0 ? 'red.500' : 'green.500'}>
                    {formatCurrency(calculatedTotalOutstandingBalance ?? 0)}
                  </StatNumber>
                </Stat>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Divider my={2} />

        <Box bg="white" p={5} borderRadius="md" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" color="gray.700">Araçlar</Heading>
            <Button 
              leftIcon={<AddIcon />} 
              colorScheme="teal" 
              onClick={() => handleOpenVehicleForm()}
              size="md"
            >
              Yeni Araç Ekle
            </Button>
          </Flex>
          
          {isLoadingVehicles && <Flex justify="center" py={10}><Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" /></Flex>}
          {vehiclesError && <Text color="red.500" fontSize="md">Araçlar yüklenirken hata: {vehiclesError.message}</Text>}
          {vehicles && (
            <VehicleList 
              vehicles={vehicles} 
              customerId={customer.id}
              onEditVehicle={handleOpenVehicleForm}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
          {!isLoadingVehicles && vehicles?.length === 0 && <Text color="gray.600" textAlign="center" py={5}>Bu müşteriye ait kayıtlı araç bulunmamaktadır.</Text>}
        </Box>

        <Divider my={2} />

        <Box bg="white" p={5} borderRadius="md" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" color="gray.700">İşler</Heading>
          </Flex>

          {isLoadingJobs && <Flex justify="center" py={10}><Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="purple.500" size="xl" /></Flex>}
          {jobsError && <Text color="red.500" fontSize="md">İşler yüklenirken hata: {jobsError.message}</Text>}
          
          {!isLoadingJobs && filteredJobs && filteredJobs.length > 0 && (
            <Accordion allowMultiple defaultIndex={[0]}>
              {filteredJobs.map((job) => (
                <AccordionItem key={job.id}>
                  <h2>
                    <AccordionButton _expanded={{ bg: 'purple.50', color: 'purple.700' }}>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">{job.job_description} - <Text as="span" fontWeight="normal">{new Date(job.job_date).toLocaleDateString()}</Text></Text>
                      </Box>
                      <Badge colorScheme={getJobStatusColor(job.status)} mr={2}>{job.status}</Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} bg="white">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        <Text><Text as="span" fontWeight="semibold">İş ID:</Text> {job.id}</Text>
                        {(() => {
                          const vehicle = vehicles?.find(v => v.id === job.vehicle_id);
                          if (vehicle) {
                            return <Text><Text as="span" fontWeight="semibold">Araç:</Text> {`${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}</Text>;
                          } else if (job.vehicle_id) {
                            return <Text><Text as="span" fontWeight="semibold">Araç ID:</Text> {job.vehicle_id}</Text>;
                          }
                          return null;
                        })()}
                        <Text><Text as="span" fontWeight="semibold">Toplam Tutar:</Text> {formatCurrency(job.total_cost ?? 0)}</Text>
                        <Text color="green.600"><Text as="span" fontWeight="semibold">Toplam Ödenen:</Text> {formatCurrency(job.total_paid_for_job ?? 0)}</Text>
                        <Text color={job.remaining_balance_for_job && job.remaining_balance_for_job > 0 ? "red.600" : "green.600"}>
                            <Text as="span" fontWeight="semibold">Kalan Bakiye:</Text> {formatCurrency(job.remaining_balance_for_job ?? 0)}
                        </Text>
                    </SimpleGrid>
                    {job.notes && (
                        <Box mt={2} p={2} borderWidth="1px" borderRadius="md" bg="gray.50">
                            <Text fontWeight="semibold" fontSize="sm">İşe Özel Notlar:</Text>
                            <Text fontSize="sm">{job.notes}</Text>
                        </Box>
                    )}
                    <HStack mt={4} spacing={3}>
                       <Button 
                        colorScheme="blue" 
                        size="sm"
                        onClick={() => handleOpenPaymentModal(job)}
                        isDisabled={(job.remaining_balance_for_job ?? 0) <= 0}
                      >
                        Ödeme Yap
                      </Button>
                       <Button 
                        as={RouterLink} 
                        to={`/jobs/${job.id}`}
                        colorScheme="gray" 
                        size="sm"
                        leftIcon={<LinkIcon />}
                      >
                        İş Detayına Git 
                      </Button>
                    </HStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {!isLoadingJobs && (!filteredJobs || filteredJobs.length === 0) && (
            <Text color="gray.600" textAlign="center" py={5}>Bu müşteriye ait kayıtlı iş bulunmamaktadır.</Text>
          )}
        </Box>
      </VStack>

      {isVehicleFormOpen && (
        <VehicleForm 
          isOpen={isVehicleFormOpen} 
          onClose={() => {
            onVehicleFormClose();
            setSelectedVehicle(null);
          }}
          customerId={customer.id}
          vehicleToEdit={selectedVehicle}
          onSuccess={handleFormSuccess}
        />
      )}

      {isPaymentModalOpen && selectedJobForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={onPaymentModalClose}
          job={selectedJobForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
};

// Gerekli CustomerById hook'u (src/hooks/useCustomers.ts içine eklenebilir):
/*
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CustomerService } from '../services/customerService';
import { Customer } from '../types/customer';

const CUSTOMERS_QUERY_KEY_PREFIX = 'customers';

export const useCustomerById = (
  customerId: string | undefined,
  options?: Omit<UseQueryOptions<Customer, Error, Customer, (string | undefined)[]>, 'queryKey' | 'queryFn' | 'initialData'>
) => {
  return useQuery<Customer, Error, Customer, (string | undefined)[]>(
    {
      queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', customerId],
      queryFn: () => {
        if (!customerId) return Promise.reject(new Error('Müşteri ID gerekli'));
        return CustomerService.getCustomerById(customerId);
      },
      enabled: !!customerId,
      ...options,
    }
  );
};
*/ 