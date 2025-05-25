import { Box, Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Flex h="100vh" flexDirection="column">
      <Header />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box
          as="main"
          flex="1"
          p="4"
          overflow="auto"
          ml="64" // Sidebar genişliği
          pt="16" // Header yüksekliği
        >
          {children || <Outlet />}
        </Box>
      </Flex>
    </Flex>
  );
}; 