import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useCreateMultipleFinancialTransactions } from '../../../hooks/useFinancialTransactions';
import { useCreateJob } from '../../../hooks/useJobs';
import { useCreateVehicle, useUpdateVehicle } from '../../../hooks/useVehicles';
import { FinancialTransactionCreate } from '../../../types/financial';
import { JobCreate, Job as JobType } from '../../../types/job';
import { Vehicle, VehicleCreate, VehicleFormData } from '../../../types/vehicle';

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  vehicleToEdit?: Vehicle | null;
  onSuccess?: () => void;
}

// VehicleFormData'dan customer_id'yi çıkardık çünkü o props'tan geliyor.
// Finansal alanları da buraya ekleyebiliriz veya ayrı bir state olarak tutabiliriz.
// Şimdilik ayrı state'lerde tutalım daha net olması için.
const initialVehicleFormData: Omit<VehicleFormData, 'customer_id'> = {
  plate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  notes: '',
};

export const VehicleForm: React.FC<VehicleFormProps> = ({
  isOpen,
  onClose,
  customerId,
  vehicleToEdit,
  onSuccess
}) => {
  const toast = useToast();
  const [vehicleData, setVehicleData] = useState<Omit<VehicleFormData, 'customer_id'>>(initialVehicleFormData);

  // Finansal Alanlar için State'ler
  const [initialServiceFee, setInitialServiceFee] = useState<number | undefined>();
  const [initialServiceDescription, setInitialServiceDescription] = useState('');
  const [paymentReceived, setPaymentReceived] = useState<number | undefined>();
  const [paymentDescription, setPaymentDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);


  const { mutateAsync: createVehicle, isPending: isCreatingVehicle } = useCreateVehicle();
  const { mutateAsync: updateVehicle, isPending: isUpdatingVehicle } = useUpdateVehicle();
  const { mutateAsync: createJob, isPending: isCreatingJob } = useCreateJob();
  const { mutateAsync: createFinancialTransactions, isPending: isCreatingTransactions } = useCreateMultipleFinancialTransactions();

  useEffect(() => {
    if (isOpen) { // Modal her açıldığında formu sıfırla/doldur
      if (vehicleToEdit) {
        setVehicleData({
          plate: vehicleToEdit.plate,
          brand: vehicleToEdit.brand,
          model: vehicleToEdit.model,
          year: vehicleToEdit.year,
          vin: vehicleToEdit.vin || '',
          notes: vehicleToEdit.notes || '',
        });
        // Düzenleme modunda finansal alanları sıfırla (ya da mevcut işlemleri yükle - şimdilik sıfır)
        setInitialServiceFee(undefined);
        setInitialServiceDescription('');
        setPaymentReceived(undefined);
        setPaymentDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
      } else {
        setVehicleData(initialVehicleFormData);
        setInitialServiceFee(undefined);
        setInitialServiceDescription('');
        setPaymentReceived(undefined);
        setPaymentDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [vehicleToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value }));
  };

  const handleSubmit = async () => {
    if (!vehicleData.plate || !vehicleData.brand || !vehicleData.model || !vehicleData.year) {
      toast({ title: "Zorunlu araç alanları eksik", description: "Plaka, Marka, Model ve Yıl alanları doldurulmalıdır.", status: "error", duration: 4000, isClosable: true });
      return;
    }
    // Servis ücreti varsa, açıklaması da olmalı
    if (initialServiceFee && initialServiceFee > 0 && !initialServiceDescription.trim()) {
        toast({ title: "Eksik Bilgi", description: "Servis ücreti girildiğinde, servis açıklaması da zorunludur.", status: "warning", duration: 4000, isClosable: true });
        return;
    }

    const vehicleSubmissionData: VehicleCreate = {
      ...vehicleData,
      customer_id: customerId,
      year: Number(vehicleData.year),
    };

    try {
      let savedVehicle: Vehicle;
      let savedJob: JobType | null = null;

      if (vehicleToEdit && vehicleToEdit.id) {
        const { customer_id, ...restData } = vehicleSubmissionData; // customer_id update'de olmamalı
        savedVehicle = await updateVehicle({ id: vehicleToEdit.id, data: restData });
      } else {
        savedVehicle = await createVehicle(vehicleSubmissionData);
      }

      if (initialServiceFee && initialServiceFee > 0 && initialServiceDescription.trim()) {
        const jobData: JobCreate = {
          customer_id: customerId,
          vehicle_id: savedVehicle.id,
          job_description: initialServiceDescription.trim(),
          job_date: transactionDate || new Date().toISOString(),
          total_cost: initialServiceFee,
          status: 'Açık', // Veya ödeme durumuna göre 'Kısmi Ödendi' / 'Tamamen Ödendi'
          // notes: // İşe özel notlar buraya eklenebilir
        };
        savedJob = await createJob(jobData);
      }

      const transactionsToCreate: FinancialTransactionCreate[] = [];
      const currentTransactionDate = transactionDate || new Date().toISOString();

      if (savedJob && initialServiceFee && initialServiceFee > 0) {
        transactionsToCreate.push({
          customer_id: customerId,
          vehicle_id: savedVehicle.id,
          job_id: savedJob.id,
          transaction_type: 'SERVICE_FEE',
          amount: initialServiceFee,
          description: `${savedJob.job_description} (İş ID: ${savedJob.id})`,
          transaction_date: currentTransactionDate,
        });
      }

      if (paymentReceived && paymentReceived > 0) {
        transactionsToCreate.push({
          customer_id: customerId,
          vehicle_id: savedVehicle.id,
          job_id: savedJob ? savedJob.id : null,
          transaction_type: 'PAYMENT',
          amount: paymentReceived,
          description: paymentDescription || `Ödeme (Araç: ${savedVehicle.plate}${savedJob ? ', İş ID: ' + savedJob.id : ''})`,
          transaction_date: currentTransactionDate,
        });
      }

      if (transactionsToCreate.length > 0) {
        await createFinancialTransactions({
          transactions: transactionsToCreate,
          customerIdToInvalidate: customerId
        });
      }

      // İşin durumunu ödemeye göre güncelle (opsiyonel, daha gelişmiş bir adım olabilir)
      if (savedJob && paymentReceived) {
          if (paymentReceived >= savedJob.total_cost) {
              // await updateJobStatus(savedJob.id, 'Tamamen Ödendi'); // updateJobStatus hook/servisi gerekir
          } else if (paymentReceived > 0) {
              // await updateJobStatus(savedJob.id, 'Kısmi Ödendi');
          }
      }

      toast({
        title: vehicleToEdit ? 'Araç Güncellendi' : 'Araç Eklendi',
        description: 'Araç, iş ve ilgili finansal işlemler başarıyla kaydedildi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
      onClose();

    } catch (error) {
      console.error('Araç, iş veya finansal işlem kaydedilirken hata:', error);
      toast({
        title: 'Kayıt Hatası',
        description: `Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen bir hata.'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{vehicleToEdit ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2} color="gray.600">Araç Bilgileri</Heading>
            <FormControl isRequired>
              <FormLabel>Plaka</FormLabel>
              <Input name="plate" value={vehicleData.plate} onChange={handleChange} placeholder="34 ABC 123" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Marka</FormLabel>
              <Input name="brand" value={vehicleData.brand} onChange={handleChange} placeholder="örn: Ford" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Model</FormLabel>
              <Input name="model" value={vehicleData.model} onChange={handleChange} placeholder="örn: Focus" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Yıl</FormLabel>
              <NumberInput 
                name="year" 
                value={vehicleData.year} 
                onChange={(valueString) => handleChange({ target: { name: 'year', value: valueString } } as React.ChangeEvent<HTMLInputElement>)}
                min={1900}
                max={new Date().getFullYear() + 1}
              >
                <NumberInputField placeholder="örn: 2023" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Şasi Numarası (VIN)</FormLabel>
              <Input name="vin" value={vehicleData.vin} onChange={handleChange} placeholder="İsteğe bağlı" />
            </FormControl>
            <FormControl>
              <FormLabel>Notlar</FormLabel>
              <Textarea name="notes" value={vehicleData.notes} onChange={handleChange} placeholder="Araçla ilgili ek notlar (isteğe bağlı)" />
            </FormControl>

            <Divider my={4} />
            <Heading size="md" mb={2} color="gray.600">Finansal İşlemler (Opsiyonel)</Heading>

            <FormControl>
              <FormLabel htmlFor="initialServiceFee">İlk Servis/İşlem Ücreti</FormLabel>
              <NumberInput
                id="initialServiceFee"
                value={initialServiceFee || ''}
                onChange={(valueString) => setInitialServiceFee(parseFloat(valueString) || undefined)}
                min={0}
              >
                <NumberInputField placeholder="Örn: 250.00" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="initialServiceDescription">Servis/İşlem Açıklaması</FormLabel>
              <Input
                id="initialServiceDescription"
                placeholder="Örn: Periyodik bakım, Yedek parça bedeli"
                value={initialServiceDescription}
                onChange={(e) => setInitialServiceDescription(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="paymentReceived">Alınan Ödeme</FormLabel>
              <NumberInput
                id="paymentReceived"
                value={paymentReceived || ''}
                onChange={(valueString) => setPaymentReceived(parseFloat(valueString) || undefined)}
                min={0}
              >
                <NumberInputField placeholder="Örn: 100.00" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="paymentDescription">Ödeme Açıklaması</FormLabel>
              <Input
                id="paymentDescription"
                placeholder="Örn: Nakit ödeme, Kredi kartı peşinat"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="transactionDate">İşlem Tarihi</FormLabel>
              <Input
                id="transactionDate"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </FormControl>

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSubmit} 
            isLoading={isCreatingVehicle || isUpdatingVehicle || isCreatingJob || isCreatingTransactions}
          >
            {vehicleToEdit ? 'Güncelle' : 'Kaydet'}
          </Button>
          <Button variant="ghost" onClick={onClose}>İptal</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 