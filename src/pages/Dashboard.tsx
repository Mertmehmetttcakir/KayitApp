import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTotalRevenue } from '../hooks/useDashboard';
import { RevenueFilterParams } from '../types/dashboard';
import { formatCurrency } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentParams, setCurrentParams] = useState<RevenueFilterParams | undefined>(undefined);

  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError, refetch: refetchRevenue } = useTotalRevenue(currentParams);

  if (revenueError) {
    toast({
      title: 'Ciro Verisi Yüklenemedi',
      description: revenueError.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }

  const handleFilterChange = () => {
    if (filterDate) {
      setCurrentParams({ period: filterPeriod, date: filterDate });
    } else {
      toast({
        title: 'Tarih Gerekli',
        description: 'Lütfen ciro hesaplaması için bir tarih seçin.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShowAllTimeRevenue = () => {
    setCurrentParams(undefined);
  };

  const getFilterLabel = () => {
    if (!currentParams) return "Tüm Zamanlar";
    const date = new Date(currentParams.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    if (currentParams.period === 'daily') return `${date} (Günlük)`;
    if (currentParams.period === 'weekly') return `${date} Haftası (Haftalık)`;
    if (currentParams.period === 'monthly') return `${new Date(currentParams.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} (Aylık)`;
    if (currentParams.period === 'yearly') return `${new Date(currentParams.date).getFullYear()} Yılı (Yıllık)`;
    return "Filtrelenmiş";
  };
  
  // Burada gerçek veriler API'dan çekilecek
  const stats = {
    customers: 128,
    appointments: 35,
    vehicles: 156,
    revenue: 24650
  };

  return (
    <Box p={5}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Hoş Geldiniz, {user?.name || 'Kullanıcı'}</Heading>
        <Text color="gray.500">Bugün: {new Date().toLocaleDateString('tr-TR')}</Text>
      </Flex>

      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={8}>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="blue.700" textAlign="center">Ciro Analizi</Heading>
          <HStack spacing={4} w="full">
            <Select 
              value={filterPeriod} 
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              flex={1}
            >
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
              <option value="yearly">Yıllık</option>
            </Select>
            <Input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
              flex={2}
            />
          </HStack>
          <HStack w="full" justifyContent="space-between">
            <Button colorScheme="blue" onClick={handleFilterChange} isLoading={isLoadingRevenue && !!currentParams}>
              Filtreyi Uygula
            </Button>
            <Button variant="outline" onClick={handleShowAllTimeRevenue} isLoading={isLoadingRevenue && !currentParams}>
              Tüm Zamanlar Ciro
            </Button>
          </HStack>

          {isLoadingRevenue ? (
            <Flex justify="center" align="center" h="80px">
              <Spinner thickness="3px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="lg" />
            </Flex>
          ) : revenueData ? (
            <Stat textAlign="center" mt={4}>
              <StatLabel fontSize="lg" color="gray.600">{getFilterLabel()} Toplam Ciro</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                {formatCurrency(revenueData.total)}
              </StatNumber>
            </Stat>
          ) : (
            <Text textAlign="center" color="gray.500" mt={4}>Seçili filtre için ciro verisi bulunamadı veya yüklenemedi.</Text>
          )}
        </VStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="blue.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Toplam Müşteri</StatLabel>
              <StatNumber>{stats.customers}</StatNumber>
            </Box>
            <Box my="auto" color="blue.400" alignContent="center">
              <Icon as={FiUsers} w={6} h={6} />
            </Box>
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="green.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Bugünkü Randevu</StatLabel>
              <StatNumber>{stats.appointments}</StatNumber>
            </Box>
            <Box my="auto" color="green.400" alignContent="center">
              <Icon as={FiCalendar} w={6} h={6} />
            </Box>
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="purple.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Kayıtlı Araç</StatLabel>
              <StatNumber>{stats.vehicles}</StatNumber>
            </Box>
            <Box my="auto" color="purple.400" alignContent="center">
              <Icon as={FiTruck} w={6} h={6} />
            </Box>
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="orange.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Aylık Gelir</StatLabel>
              <StatNumber>{stats.revenue.toLocaleString('tr-TR')} ₺</StatNumber>
            </Box>
            <Box my="auto" color="orange.400" alignContent="center">
              <Icon as={FiDollarSign} w={6} h={6} />
            </Box>
          </Flex>
        </Stat>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={5}>
        <GridItem>
          <Card shadow="sm">
            <CardHeader pb={1}>
              <Heading size="md">Bugünkü Randevular</Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.500" mb={4}>
                Bugün için 5 randevu planlandı
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Box 
                    key={item} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    p={3}
                    bg="white"
                  >
                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                      <Text fontWeight="bold">
                        {`10:${item * 15}`} - Ahmet Yılmaz
                      </Text>
                      <Box
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="bold"
                        bg={item % 2 === 0 ? "green.100" : "yellow.100"}
                        color={item % 2 === 0 ? "green.700" : "yellow.700"}
                      >
                        {item % 2 === 0 ? "Tamamlandı" : "Bekliyor"}
                      </Box>
                    </Flex>
                    <Text color="gray.600" fontSize="sm">
                      {item % 3 === 0 ? "Yağ Değişimi" : item % 2 === 0 ? "Fren Bakımı" : "Genel Bakım"}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      {`3${item}ABC${item}${item}` } - Honda Civic
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card shadow="sm" h="100%">
            <CardHeader pb={1}>
              <Heading size="md">Servis Durumu</Heading>
            </CardHeader>
            <CardBody>
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Teknisyen Doluluk</Text>
                  <Text fontSize="sm" fontWeight="medium" color={80 > 80 ? "red.500" : "green.500"}>
                    %80
                  </Text>
                </Flex>
                <Progress value={80} size="sm" colorScheme={80 > 80 ? "red" : "green"} />
              </Box>
              
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Günlük İş Yükü</Text>
                  <Text fontSize="sm" fontWeight="medium" color={65 > 80 ? "red.500" : "green.500"}>
                    %65
                  </Text>
                </Flex>
                <Progress value={65} size="sm" colorScheme={65 > 80 ? "red" : "green"} />
              </Box>
              
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Müşteri Memnuniyeti</Text>
                  <Text fontSize="sm" fontWeight="medium" color={92 > 80 ? "green.500" : "red.500"}>
                    %92
                  </Text>
                </Flex>
                <Progress value={92} size="sm" colorScheme={92 > 80 ? "green" : "red"} />
              </Box>
              
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Parça Stok Durumu</Text>
                  <Text fontSize="sm" fontWeight="medium" color={45 > 80 ? "green.500" : "orange.500"}>
                    %45
                  </Text>
                </Flex>
                <Progress value={45} size="sm" colorScheme={45 > 30 ? "orange" : "red"} />
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}; 