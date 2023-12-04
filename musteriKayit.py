from tkinter import *
pencere = Tk()
pencere.title("Müşteri Kayıt Programı")
# Müşteri adı etiketi ve girdi kutusu
ad_etiket = Label(pencere, text="Müşteri Adı:")
ad_etiket.grid(row=0, column=0, padx=5, pady=5)
ad_girdi = Entry(pencere)
ad_girdi.grid(row=0, column=1, padx=5, pady=5)

# Müşteri soyadı etiketi ve girdi kutusu
soyad_etiket = Label(pencere, text="Müşteri Soyadı:")
soyad_etiket.grid(row=1, column=0, padx=5, pady=5)
soyad_girdi = Entry(pencere)
soyad_girdi.grid(row=1, column=1, padx=5, pady=5)

# E-posta adresi etiketi ve girdi kutusu
email_etiket = Label(pencere, text="E-posta Adresi:")
email_etiket.grid(row=2, column=0, padx=5, pady=5)
email_girdi = Entry(pencere)
email_girdi.grid(row=2, column=1, padx=5, pady=5)

# Kayıt butonu
kayit_butonu = Button(pencere, text="Kayıt")
kayit_butonu.grid(row=3, column=0, columnspan=2, padx=5, pady=5)

def musteri_kaydet():
    ad = ad_girdi.get()
    soyad = soyad_girdi.get()
    email = email_girdi.get()
    musteri = {"ad": ad, "soyad": soyad, "email": email}
    musteri_id = len(musteriler) + 1
    musteri_key = f"musteri{musteri_id}"
    musteriler[musteri_key] = musteri
    print("Müşteri başarıyla kaydedildi.")

kayit_butonu.config(command=musteri_kaydet)
