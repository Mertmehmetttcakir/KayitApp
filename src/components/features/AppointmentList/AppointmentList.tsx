import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import { Appointment } from '../../../types/appointment';
import { AppointmentForm } from './AppointmentForm';

const getStatusColor = (status: Appointment['status']): string => {
  const colors: Record<Appointment['status'], string> = {
    pending: 'yellow',
    confirmed: 'blue',
    'in-progress': 'orange',
    completed: 'green',
    cancelled: 'red',
  };
  return colors[status];
};

const getStatusText = (status: Appointment['status']): string => {
  const texts: Record<Appointment['status'], string> = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    'in-progress': 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
  };
  return texts[status];
};

const getServiceTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    periodic: 'Periyodik Bakım',
    repair: 'Onarım',
    inspection: 'Kontrol',
    other: 'Diğer',
  };
  
  return typeMap[type] || type;
};

export const AppointmentList: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{
    id: string;
  } | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();
  
  const cancelRef = useRef<HTMLButtonElement>(null);

  const {
    appointments,
    isLoading,
    deleteAppointment,
    isDeleting,
  } = useAppointments();

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete({
      id: appointment.id,
    });
    onDeleteDialogOpen();
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointment(appointmentToDelete.id);
    } finally {
      onDeleteDialogClose();
      setAppointmentToDelete(null);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const handleAdd = () => {
    setSelectedAppointment(null);
    onOpen();
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
        <Text fontSize="xl" fontWeight="bold">Randevular</Text>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAdd}
        >
          Yeni Randevu
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Tarih</Th>
              <Th>Saat</Th>
              <Th>Müşteri</Th>
              <Th>Araç</Th>
              <Th>Servis Tipi</Th>
              <Th>Durum</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {appointments?.map((appointment: Appointment) => (
              <Tr key={appointment.id}>
                <Td>{new Date(appointment.appointment_date).toLocaleDateString('tr-TR')}</Td>
                <Td>{new Date(appointment.appointment_date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}</Td>
                <Td>{appointment.customer?.name || '-'}</Td>
                <Td>{appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} (${appointment.vehicle.plate})` : '-'}</Td>
                <Td>{getServiceTypeText(appointment.service_type)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </Td>
                <Td>
                  <IconButton
                    aria-label="Düzenle"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleEdit(appointment)}
                  />
                  <IconButton
                    aria-label="Sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(appointment)}
                    isLoading={isDeleting}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {isOpen && (
        <AppointmentForm
          isOpen={isOpen}
          onClose={onClose}
          initialData={selectedAppointment ? 
            {
              customerId: selectedAppointment.customer_id,
              vehicleId: selectedAppointment.vehicle_id,
              date: new Date(selectedAppointment.appointment_date).toISOString().split('T')[0],
              timeSlot: {
                start: new Date(selectedAppointment.appointment_date).toTimeString().slice(0, 5),
                end: new Date(new Date(selectedAppointment.appointment_date).getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)
              },
              serviceType: selectedAppointment.service_type as any,
              services: [],
              notes: selectedAppointment.notes
            } : 
            undefined
          }
          onSubmit={onClose}
          isSubmitting={false}
        />
      )}

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Randevu Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                İptal
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete} 
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