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

export const Header: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
                    name={user?.name}
                  />
                  <Text>{user?.name}</Text>
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