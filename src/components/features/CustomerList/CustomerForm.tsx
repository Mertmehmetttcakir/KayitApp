import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Customer, CustomerFormData } from '../../../types/customer';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  initialData?: Customer;
  isSubmitting?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(() => {
    if (initialData) {
      const { full_name, email, phone, address } = initialData;
      return {
        full_name: full_name || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
      };
    }
    return {
      full_name: '',
    email: '',
    phone: '',
    address: '',
    };
  });

  useEffect(() => {
    if (initialData) {
      const { full_name, email, phone, address } = initialData;
      setFormData({
        full_name: full_name || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ad Soyad</FormLabel>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Ad Soyad giriniz"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>E-posta</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-posta giriniz"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Telefon</FormLabel>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Telefon numarası giriniz"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Adres</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adres giriniz"
                />
              </FormControl>
              {/* TODO: Araç ekleme bölümü eklenecek */}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
            >
              {initialData ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 