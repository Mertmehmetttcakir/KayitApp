import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.util.ArrayList;

public class Anasayfa extends JFrame {
    private ArrayList<String> customerList;

    public Anasayfa() {
        setTitle("Müşteri Kayıt Uygulaması");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(400, 200);
        setLocationRelativeTo(null);

        JPanel panel = new JPanel(new FlowLayout());

        JButton showCustomerListButton = new JButton("Kayıtlı Müşteriler");
        panel.add(showCustomerListButton);

        customerList = new ArrayList<>();
        loadCustomers();

        JButton addCustomerButton = new JButton("Yeni Müşteri Kaydı Yap");
        panel.add(addCustomerButton);

        showCustomerListButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new MusteriListesi().setVisible(true);
            }
        });

        addCustomerButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String customerName = JOptionPane.showInputDialog(null, "Müşteri Adı:");
                if (customerName != null && !customerName.isEmpty()) {
                    String phoneNumber = JOptionPane.showInputDialog(null, "Telefon Numarası:");
                    if (phoneNumber != null && !phoneNumber.isEmpty()) {
                        String carInfo = JOptionPane.showInputDialog(null, "Araç Bilgisi:");
                        String jobDone = JOptionPane.showInputDialog(null, "Yapılan İş:");
                        String amountStr = JOptionPane.showInputDialog(null, "Ücret Tutarı:");
                        String date = JOptionPane.showInputDialog(null, "Tarih (GG/AA/YYYY):");
                        if (carInfo != null && jobDone != null && amountStr != null && date != null &&
                                !carInfo.isEmpty() && !jobDone.isEmpty() && !amountStr.isEmpty() && !date.isEmpty()) {
                            try {
                                int amount = Integer.parseInt(amountStr);
                                String newCustomer = date + "," + customerName + "," + phoneNumber + "," + carInfo + ","
                                        + jobDone + "," + amount;

                                String fileName = "musteri_bilgileri.txt";
                                BufferedWriter writer = new BufferedWriter(new FileWriter(fileName, true));
                                writer.write(newCustomer);
                                writer.newLine();
                                writer.close();

                                customerList.add(newCustomer);
                            } catch (NumberFormatException ex) {
                                JOptionPane.showMessageDialog(null, "Geçerli bir ücret tutarı girin.", "Hata", JOptionPane.ERROR_MESSAGE);
                            } catch (IOException ex) {
                                ex.printStackTrace();
                            }
                        } else {
                            JOptionPane.showMessageDialog(null, "Tüm alanları doldurmalısınız.", "Hata", JOptionPane.ERROR_MESSAGE);
                        }
                    } else {
                        JOptionPane.showMessageDialog(null, "Telefon numarası girmelisiniz.", "Hata", JOptionPane.ERROR_MESSAGE);
                    }
                } else {
                    JOptionPane.showMessageDialog(null, "Müşteri adı girmelisiniz.", "Hata", JOptionPane.ERROR_MESSAGE);
                }
            }
        });

        add(panel);
    }

    private void loadCustomers() {
        try {
            BufferedReader reader = new BufferedReader(new FileReader("musteri_bilgileri.txt"));
            String line;
            while ((line = reader.readLine()) != null) {
                customerList.add(line);
            }
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new Anasayfa().setVisible(true);
            }
        });
    }
}
