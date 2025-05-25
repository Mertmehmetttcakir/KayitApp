import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
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
import { useVehicles } from 'hooks/useVehicles';
import React from 'react';
import { Vehicle } from 'types/vehicle';
import { VehicleForm } from './VehicleForm';

interface CustomerVehiclesProps {
  customerId: string;
}

export const CustomerVehicles: React.FC<CustomerVehiclesProps> = ({ customerId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle } = useVehicles(customerId);
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);

  const handleAdd = () => {
    setSelectedVehicle(null);
    onOpen();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    onOpen();
  };

  const handleSubmit = async (data: Partial<Vehicle>) => {
    if (selectedVehicle) {
      await updateVehicle({ id: selectedVehicle.id, data });
    } else {
      await addVehicle({ ...data, customerId } as Omit<Vehicle, 'id'>);
    }
    onClose();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        leftIcon={<AddIcon />}
        colorScheme="blue"
        mb={4}
        onClick={handleAdd}
      >
        Yeni Araç Ekle
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Plaka</Th>
            <Th>Marka</Th>
            <Th>Model</Th>
            <Th>Yıl</Th>
            <Th>İşlemler</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vehicles?.map((vehicle: Vehicle) => (
            <Tr key={vehicle.id}>
              <Td>{vehicle.plate}</Td>
              <Td>{vehicle.brand}</Td>
              <Td>{vehicle.model}</Td>
              <Td>{vehicle.year}</Td>
              <Td>
                <IconButton
                  aria-label="Düzenle"
                  icon={<EditIcon />}
                  size="sm"
                  mr={2}
                  onClick={() => handleEdit(vehicle)}
                />
                <IconButton
                  aria-label="Sil"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => deleteVehicle(vehicle.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <VehicleForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={selectedVehicle}
      />
    </Box>
  );
}; 