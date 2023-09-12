import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.util.ArrayList;

public class KayitSil extends JFrame {
    private JComboBox<String> customerComboBox;
    private ArrayList<String> customerList;

    public KayitSil() {
        setTitle("Müşteri Kayıt Silme");
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setSize(400, 150);
        setLocationRelativeTo(null);

        JPanel panel = new JPanel(new FlowLayout());

        customerComboBox = new JComboBox<>();
        panel.add(customerComboBox);

        JButton deleteButton = new JButton("Kaydı Sil");
        panel.add(deleteButton);

        customerList = new ArrayList<>();
        loadCustomers();

        JButton returnButton = new JButton("Müşteri Kayıt Uygulamasına Geri Dön");
        panel.add(returnButton);

        returnButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new Anasayfa().setVisible(true);
                dispose();
            }
        });

        deleteButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String selectedCustomer = (String) customerComboBox.getSelectedItem();
                if (selectedCustomer != null) {
                    for (String customerInfo : customerList) {
                        String[] infoParts = customerInfo.split(",");
                        if (infoParts[1].equals(selectedCustomer)) {
                            String info = "Tarih"+ infoParts[0]+
                                    "\nMüşteri Adı: " + infoParts[1] +
                                    "\nTelefon Numarası: " + infoParts[2] +
                                    "\nAraç Bilgisi: " + infoParts[3] +
                                    "\nYapılan İş: " + infoParts[4] +
                                    "\nÜcret Tutarı: " + infoParts[5];
                            int choice = JOptionPane.showConfirmDialog(null, info + "\n\nBu müşteriyi silmek istiyor musunuz?", "Müşteri Bilgileri", JOptionPane.YES_NO_OPTION);
                            if (choice == JOptionPane.YES_OPTION) {
                                customerList.remove(customerInfo);
                                updateComboBox();
                                updateFile();
                                JOptionPane.showMessageDialog(null, "Müşteri silindi.", "Bilgi", JOptionPane.INFORMATION_MESSAGE);
                            }
                            break;
                        }
                    }
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
                String[] customerInfo = line.split(",");
                customerComboBox.addItem(customerInfo[1]);
                customerList.add(line);
            }
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void updateComboBox() {
        customerComboBox.removeAllItems();
        for (String customerInfo : customerList) {
            String[] infoParts = customerInfo.split(",");
            customerComboBox.addItem(infoParts[0]);
        }
    }

    private void updateFile() {
        try {
            BufferedWriter writer = new BufferedWriter(new FileWriter("musteri_bilgileri.txt"));
            for (String customerInfo : customerList) {
                writer.write(customerInfo);
                writer.newLine();
            }
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
/*
    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new KayitSil().setVisible(true);
            }
        });
    }

 */
}
