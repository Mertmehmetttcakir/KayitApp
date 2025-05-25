import { DownloadIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Grid,
    Heading,
    Select,
    Stat,
    StatArrow,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    useColorModeValue,
} from '@chakra-ui/react';
import React, { useState } from 'react';

interface ReportMetrics {
  totalRevenue: number;
  totalAppointments: number;
  averageRating: number;
  completionRate: number;
  revenueGrowth: number;
  appointmentGrowth: number;
}

interface ReportsDashboardProps {
  metrics: ReportMetrics;
  onExport?: (period: string) => void;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  metrics,
  onExport,
}) => {
  const [period, setPeriod] = useState('month');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Raporlar ve Analitik</Heading>
        <Flex gap={4}>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            size="sm"
            w="200px"
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </Select>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            size="sm"
            onClick={() => onExport?.(period)}
          >
            Raporu İndir
          </Button>
        </Flex>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {/* Gelir Kartı */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Gelir Analizi</Heading>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Toplam Gelir</StatLabel>
                <StatNumber>{formatCurrency(metrics.totalRevenue)}</StatNumber>
                <StatHelpText>
                  <StatArrow type={metrics.revenueGrowth > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metrics.revenueGrowth)}%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        {/* Randevu Kartı */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Randevu Analizi</Heading>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Toplam Randevu</StatLabel>
                <StatNumber>{metrics.totalAppointments}</StatNumber>
                <StatHelpText>
                  <StatArrow type={metrics.appointmentGrowth > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metrics.appointmentGrowth)}%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        {/* Performans Kartı */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Performans Analizi</Heading>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Ortalama Değerlendirme</StatLabel>
                <StatNumber>{metrics.averageRating.toFixed(1)}/5.0</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Tamamlanma Oranı</StatLabel>
                <StatNumber>{metrics.completionRate}%</StatNumber>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
}; 