import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { useUsers } from '../../hooks/useUsers';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'technician' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export const UserManagementPage: React.FC = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { users, isLoading, updateUserRole, deleteUser } = useUsers();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const toast = useToast();

  if (roleLoading || isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!isAdmin) {
    return (
      <Box p={4}>
        <Heading size="lg" color="red.500">Erişim Reddedildi</Heading>
        <Text mt={2}>Bu sayfayı görüntülemek için admin yetkisi gereklidir.</Text>
      </Box>
    );
  }

  const handleRoleChange = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    onOpen();
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.id, newRole as any);
      toast({
        title: 'Rol Güncellendi',
        description: `${selectedUser.full_name} kullanıcısının rolü ${getRoleDisplayName(newRole)} olarak güncellendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Rol güncellenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteUser(userId);
        toast({
          title: 'Kullanıcı Silindi',
          description: `${userName} kullanıcısı başarıyla silindi.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Kullanıcı silinirken bir hata oluştu.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'technician': return 'Teknisyen';
      case 'customer': return 'Müşteri';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'technician': return 'blue';
      case 'customer': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Kullanıcı Yönetimi</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => window.open('/auth/register', '_blank')}
        >
          Yeni Kullanıcı
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Ad Soyad</Th>
              <Th>E-posta</Th>
              <Th>Telefon</Th>
              <Th>Rol</Th>
              <Th>Durum</Th>
              <Th>Kayıt Tarihi</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users?.map((user: User) => (
              <Tr key={user.id}>
                <Td>{user.full_name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.phone || '-'}</Td>
                <Td>
                  <Badge colorScheme={getRoleColor(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </Td>
                <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                <Td>
                  <IconButton
                    aria-label="Rol Değiştir"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleRoleChange(user)}
                  />
                  <IconButton
                    aria-label="Kullanıcı Sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteUser(user.id, user.full_name)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Rol Değiştirme Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Kullanıcı Rolü Güncelle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                <strong>{selectedUser?.full_name}</strong> kullanıcısının rolünü değiştirin:
              </Text>
              <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="customer">Müşteri</option>
                <option value="technician">Teknisyen</option>
                <option value="admin">Yönetici</option>
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateRole}>
              Güncelle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 