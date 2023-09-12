import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import javax.swing.table.TableRowSorter;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.RowFilter;
import java.util.HashSet;
import java.io.PrintWriter;

public class MusteriListesi extends JFrame {
    private JTable table;
    private TableRowSorter<DefaultTableModel> sorter;
    private JTextField searchField;
    private JComboBox<String> musteriComboBox;
    private DefaultTableModel model;
    private JLabel totalAmountLabel;

    public MusteriListesi() {
        setTitle("Müşteri Listesi");
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setSize(800, 600);
        setLocationRelativeTo(null);

        JPanel searchPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        searchField = new JTextField(15);
        searchPanel.add(new JLabel("Ara:"));
        searchPanel.add(searchField);

        model = new DefaultTableModel(
                new String[]{"Yapılan işin Tarihi", "Müşteri Adı", "Telefon Numarası", "Araç Bilgisi", "Yapılan İş", "Ücret Tutarı", "Ödenen tutar", "Kalan ücret"},
                0
        );

        table = new JTable(model);
        table.setFont(new Font("Monospaced", Font.PLAIN, 12));

        sorter = new TableRowSorter<>(model);
        table.setRowSorter(sorter);

        JScrollPane scrollPane = new JScrollPane(table);

        musteriComboBox = new JComboBox<>();
        searchPanel.add(musteriComboBox);

        add(searchPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);

        searchField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                search(searchField.getText());
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                search(searchField.getText());
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                search(searchField.getText());
            }
        });

        totalAmountLabel = new JLabel("Toplam Ücret: ");
        searchPanel.add(totalAmountLabel);

        loadCustomers();
        updateCustomerComboBox();

        musteriComboBox.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String selectedCustomer = (String) musteriComboBox.getSelectedItem();
                if (selectedCustomer != null) {
                    for (int i = 0; i < model.getRowCount(); i++) {
                        String customerName = (String) model.getValueAt(i, 1);
                        if (customerName.equals(selectedCustomer)) {
                            table.setRowSelectionInterval(i, i);
                            break;
                        }
                    }
                }
            }
        });

        JButton showDetailsButton = new JButton("Detayları Göster");
        searchPanel.add(showDetailsButton);
        showDetailsButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String selectedCustomer = (String) musteriComboBox.getSelectedItem();
                if (selectedCustomer != null) {
                    showCustomerDetails(selectedCustomer);
                }
            }
        });
        

        JButton deleteRecordButton = new JButton("Kayıt Sil");
        searchPanel.add(deleteRecordButton);
        deleteRecordButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int selectedRow = table.getSelectedRow();
                if (selectedRow != -1) {
                    int response = JOptionPane.showConfirmDialog(null, "Seçilen müşteri kaydını silmek istediğinizden emin misiniz?", "Onay", JOptionPane.YES_NO_OPTION);
                    if (response == JOptionPane.YES_OPTION) {
                        model.removeRow(selectedRow);
                        updateCustomerComboBox();
                        saveUpdatedCustomerList();
                    }
                } else {
                    JOptionPane.showMessageDialog(null, "Lütfen bir müşteri seçin.", "Hata", JOptionPane.ERROR_MESSAGE);
                }
            }
        });

        JButton calculateTotalButton = new JButton("Toplam Ücreti Hesapla");
        searchPanel.add(calculateTotalButton);
        calculateTotalButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                calculateTotalAmount();
            }
        });
    }



    private void search(String query) {
        if (query.trim().isEmpty()) {
            sorter.setRowFilter(null);
        } else {
            sorter.setRowFilter(RowFilter.regexFilter("(?i)" + query));
        }
    }

    private void loadCustomers() {
        try {
            BufferedReader reader = new BufferedReader(new FileReader("musteri_bilgileri.txt"));
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                model.addRow(parts);
            }
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void updateCustomerComboBox() {
        musteriComboBox.removeAllItems();
        HashSet<String> uniqueCustomerNames = new HashSet<>();
        for (int i = 0; i < model.getRowCount(); i++) {
            String customerName = (String) model.getValueAt(i, 1);
            uniqueCustomerNames.add(customerName);
        }
        for (String customerName : uniqueCustomerNames) {
            musteriComboBox.addItem(customerName);
        }
    }
    private void updateModelFromDetails(DefaultTableModel detailsModel) {
        for (int row = 0; row < detailsModel.getRowCount(); row++) {
            Object[] rowData = new Object[model.getColumnCount()];
            for (int column = 0; column < detailsModel.getColumnCount(); column++) {
                rowData[column] = detailsModel.getValueAt(row, column);
            }
            model.addRow(rowData);
        }
        updateCustomerComboBox();
    }
    private void showCustomerDetails(String customerName) {
        new CustomerDetailsFrame(customerName, model);
    }

    private void saveUpdatedCustomerList() {
        try {
            PrintWriter writer = new PrintWriter("musteri_bilgileri.txt");
            for (int i = 0; i < model.getRowCount(); i++) {
                StringBuilder line = new StringBuilder();
                for (int j = 0; j < model.getColumnCount(); j++) {
                    line.append(model.getValueAt(i, j));
                    if (j < model.getColumnCount() - 1) {
                        line.append(",");
                    }
                }
                writer.println(line);
            }
            writer.close();
            JOptionPane.showMessageDialog(null, "Müşteri bilgileri güncellendi.", "Bilgi", JOptionPane.INFORMATION_MESSAGE);
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(null, "Müşteri bilgileri güncellenirken bir hata oluştu.", "Hata", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void calculateTotalAmount() {
        int totalAmount = 0;
        for (int i = 0; i < model.getRowCount(); i++) {
            String amountStr = (String) model.getValueAt(i, 5);
            int amount = Integer.parseInt(amountStr);
            totalAmount += amount;
        }
        totalAmountLabel.setText("Toplam Ücret: " + totalAmount);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                MusteriListesi musteriListesi = new MusteriListesi();
                musteriListesi.setVisible(true);
                musteriListesi.setLocationRelativeTo(null);
            }
        });
    }
}