import {
  Alert,
  AlertIcon,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('RegisterPage: Component mounted');
    return () => {
      console.log('RegisterPage: Component will unmount');
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Kayıt işlemi başlatılıyor...', formData);

      // 1. Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'customer',
          }
        }
      });

      console.log('Auth sonucu:', { authData, authError });

      if (authError) {
        console.error('Auth hatası:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('Kullanıcı oluşturuldu, profil kontrol ediliyor...');

        // 2. Kısa bir bekleme süresi (trigger'ın çalışması için)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Profil oluşturulmuş mu kontrol et
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!existingProfile) {
          console.log('Profil bulunamadı, manuel olarak oluşturuluyor...');
          
          // 4. Manuel profil oluştur
          const profileData = {
            id: authData.user.id,
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'customer'
          };

          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert(profileData);

          if (profileError) {
            console.error('Profil oluşturma hatası:', profileError);
            throw new Error(`Profil oluşturulamadı: ${profileError.message}`);
          }
        } else {
          console.log('Profil başarıyla oluşturuldu:', existingProfile);
        }

        // 5. Başarılı kayıt sonrası bilgilendirme ve yönlendirme
        toast({
          title: 'Kayıt Başarılı',
          description: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kayıt olurken bir hata oluştu';
      setError(errorMessage);
      toast({
        title: 'Kayıt Hatası',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent height="100vh" justifyContent="center">
      <VStack 
        as="form" 
        onSubmit={handleRegister} 
        spacing={6} 
        width="full" 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg" 
        bg="white"
      >
        <Heading textAlign="center" size="xl" color="gray.700">
          Yeni Hesap Oluştur
        </Heading>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel>Ad Soyad</FormLabel>
          <Input
            name="fullName"
            type="text"
            placeholder="Ad Soyad"
            value={formData.fullName}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>E-posta Adresi</FormLabel>
          <Input
            name="email"
            type="email"
            placeholder="E-posta adresi"
            value={formData.email}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Telefon</FormLabel>
          <Input
            name="phone"
            type="tel"
            placeholder="Telefon"
            value={formData.phone}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Şifre</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="Şifre"
            value={formData.password}
            onChange={handleChange}
          />
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue" 
          width="full" 
          size="lg"
          isLoading={loading}
        >
          Kayıt Ol
        </Button>

        <Text textAlign="center">
          Zaten hesabınız var mı?{' '}
          <Button 
            variant="link" 
            colorScheme="blue"
            onClick={() => navigate('/auth/login')}
          >
            Giriş yapın
          </Button>
        </Text>
      </VStack>
    </Container>
  );
}; 