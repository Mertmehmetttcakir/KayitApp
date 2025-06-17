import {
  ArrowBackIcon,
  AttachmentIcon,
  CalendarIcon,
  ChatIcon,
  CheckCircleIcon,
  EditIcon,
  EmailIcon,
  InfoIcon,
  PhoneIcon,
  TimeIcon
} from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  List,
  ListIcon,
  ListItem,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { PaymentModal } from '../../components/features/Payments/PaymentModal';
import { useGetJobById } from '../../hooks/useJobs';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const JobDetailsPage: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { data: job, isLoading, error, refetch } = useGetJobById(jobId);
  const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (job?.notes) {
      setNotes(job.notes);
    }
  }, [job?.notes]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Hata!</AlertTitle>
          <AlertDescription>İş detayları yüklenirken bir hata oluştu: {error.message}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>İş Bulunamadı</AlertTitle>
          <AlertDescription>Bu ID'ye sahip bir iş kaydı bulunamadı.</AlertDescription>
        </Alert>
        <Button mt={4} leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Açık': return 'blue';
      case 'Tamamlandı - Ödeme Bekliyor': return 'orange';
      case 'Kısmi Ödendi': return 'yellow';
      case 'Tamamen Ödendi': return 'green';
      case 'İptal Edildi': return 'red';
      default: return 'gray';
    }
  };

  const handleOpenPaymentModal = () => {
    onPaymentModalOpen();
  };

  const handlePaymentSuccess = () => {
    refetch();
    onPaymentModalClose();
  };

  const handleSaveNotes = async () => {
    try {
      // TODO: API call to save notes
      // await JobService.updateJobNotes(jobId, notes);
      setIsEditingNotes(false);
      toast({
        title: 'Notlar güncellendi',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Notlar güncellenirken bir hata oluştu',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Geri Dön
            </Button>
            <Heading size="lg" color="blue.600">
              İş Detayı #{job.id}
            </Heading>
            <Badge colorScheme={getStatusColor(job.status)} fontSize="md" p={2}>
              {job.status}
            </Badge>
          </HStack>
          <HStack>
            <Button
              leftIcon={<EditIcon />}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Düzenle
            </Button>
            <Button
              colorScheme="green"
              onClick={handleOpenPaymentModal}
              isDisabled={(job.remaining_balance_for_job ?? 0) <= 0}
              size="sm"
            >
              Ödeme Al
            </Button>
          </HStack>
        </Flex>

        {/* İş Özeti */}
        <Card>
          <CardHeader>
            <Heading size="md">İş Özeti</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
              <GridItem>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={InfoIcon} color="blue.500" />
                    <Text fontWeight="semibold">Açıklama:</Text>
                    <Text>{job.job_description}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={CalendarIcon} color="blue.500" />
                    <Text fontWeight="semibold">İş Tarihi:</Text>
                    <Text>{formatDate(job.job_date)}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={TimeIcon} color="blue.500" />
                    <Text fontWeight="semibold">Oluşturulma:</Text>
                    <Text>{formatDate(job.created_at)}</Text>
                  </HStack>
                </VStack>
              </GridItem>
              
              <GridItem>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="semibold" fontSize="lg">Müşteri Bilgileri</Text>
                  <HStack>
                    <Text fontWeight="semibold">Müşteri:</Text>
                    <Button
                      as={RouterLink}
                      to={`/customers/${job.customer_id}`}
                      variant="link"
                      colorScheme="blue"
                      size="sm"
                    >
                      {job.customer?.full_name || 'Bilinmiyor'}
                    </Button>
                  </HStack>
                  {job.customer?.phone && (
                    <HStack>
                      <Icon as={PhoneIcon} color="green.500" />
                      <Text>{job.customer.phone}</Text>
                    </HStack>
                  )}
                  {job.customer?.email && (
                    <HStack>
                      <Icon as={EmailIcon} color="blue.500" />
                      <Text>{job.customer.email}</Text>
                    </HStack>
                  )}
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="semibold" fontSize="lg">Araç Bilgileri</Text>
                  {job.vehicle ? (
                    <>
                      <Text>
                        <Text as="span" fontWeight="semibold">Araç:</Text>{' '}
                        {job.vehicle.brand} {job.vehicle.model}
                      </Text>
                      <Text>
                        <Text as="span" fontWeight="semibold">Plaka:</Text>{' '}
                        {job.vehicle.plate}
                      </Text>
                      <Text>
                        <Text as="span" fontWeight="semibold">Yıl:</Text>{' '}
                        {job.vehicle.year}
                      </Text>
                    </>
                  ) : (
                    <Text color="gray.500">Araç bilgisi mevcut değil</Text>
                  )}
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Finansal Özet */}
        <Card>
          <CardHeader>
            <Heading size="md">Finansal Özet</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
              <Stat>
                <StatLabel>Toplam Tutar</StatLabel>
                <StatNumber>{formatCurrency(job.total_cost ?? 0)}</StatNumber>
                <StatHelpText>Ana iş tutarı</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Toplam Ödenen</StatLabel>
                <StatNumber color="green.500">
                  {formatCurrency(job.total_paid_for_job ?? 0)}
                </StatNumber>
                <StatHelpText>Alınan ödemeler</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Kalan Bakiye</StatLabel>
                <StatNumber color={(job.remaining_balance_for_job ?? 0) > 0 ? "red.500" : "green.500"}>
                  {formatCurrency(job.remaining_balance_for_job ?? 0)}
                </StatNumber>
                <StatHelpText>
                  {(job.remaining_balance_for_job ?? 0) > 0 ? 'Ödeme bekliyor' : 'Ödeme tamamlandı'}
                </StatHelpText>
              </Stat>
            </Grid>
          </CardBody>
        </Card>

        {/* Detaylı Bilgiler */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <Icon as={ChatIcon} mr={2} />
              Notlar ve Açıklamalar
            </Tab>
            <Tab>
              <Icon as={AttachmentIcon} mr={2} />
              Ödeme Geçmişi
            </Tab>
            <Tab>
              <Icon as={CheckCircleIcon} mr={2} />
              İş Geçmişi
            </Tab>
          </TabList>

          <TabPanels>
            {/* Notlar */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm">İş Notları</Heading>
                    <Button
                      size="sm"
                      leftIcon={<EditIcon />}
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                    >
                      {isEditingNotes ? 'İptal' : 'Düzenle'}
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {isEditingNotes ? (
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Notlar</FormLabel>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={6}
                          placeholder="İş ile ilgili notlarınızı buraya yazın..."
                        />
                      </FormControl>
                      <HStack>
                        <Button colorScheme="blue" onClick={handleSaveNotes}>
                          Kaydet
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditingNotes(false);
                            setNotes(job.notes || '');
                          }}
                        >
                          İptal
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <Box>
                      {job.notes ? (
                        <Text whiteSpace="pre-wrap">{job.notes}</Text>
                      ) : (
                        <Text color="gray.500" fontStyle="italic">
                          Henüz not eklenmemiş.
                        </Text>
                      )}
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Ödeme Geçmişi */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="sm">Ödeme Geçmişi</Heading>
                </CardHeader>
                <CardBody>
                  {/* TODO: Ödeme geçmişi verilerini buraya ekle */}
                  <Text color="gray.500">Ödeme geçmişi henüz entegre edilmedi.</Text>
                </CardBody>
              </Card>
            </TabPanel>

            {/* İş Geçmişi */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="sm">İş Aktiviteleri</Heading>
                </CardHeader>
                <CardBody>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      İş oluşturuldu - {formatDate(job.created_at)}
                    </ListItem>
                    {job.total_paid_for_job && job.total_paid_for_job > 0 && (
                      <ListItem>
                        <ListIcon as={CheckCircleIcon} color="blue.500" />
                        Ödeme alındı - {formatCurrency(job.total_paid_for_job)}
                      </ListItem>
                    )}
                    {job.status === 'Tamamen Ödendi' && (
                      <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        İş tamamlandı ve ödeme alındı
                      </ListItem>
                    )}
                  </List>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={onPaymentModalClose}
          job={job}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
}; 