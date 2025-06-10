import {
    Avatar,
    Box,
    Flex,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { FiBell, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';

export const Header: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const { userProfile, role } = useUserRole();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'technician': return 'Teknisyen';
      case 'customer': return 'Müşteri';
      default: return 'Kullanıcı';
    }
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px="4"
      py="2"
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">
          ServiceTracker Plus
        </Text>

        <HStack spacing="4">
          <IconButton
            aria-label="Bildirimler"
            icon={<FiBell />}
            variant="ghost"
            size="md"
          />
          <IconButton
            aria-label="Ayarlar"
            icon={<FiSettings />}
            variant="ghost"
            size="md"
          />
          
          {user && (
            <Menu>
              <MenuButton>
                <HStack>
                  <Avatar
                    size="sm"
                    name={userProfile?.full_name || user?.name}
                  />
                  <Box textAlign="left">
                    <Text fontSize="sm" fontWeight="medium">
                      {userProfile?.full_name || user?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {getRoleDisplayName(role)}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Profil</MenuItem>
                <MenuItem>Ayarlar</MenuItem>
                <MenuItem onClick={() => logout && logout()}>Çıkış Yap</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}; 