import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class YeniMusteriKaydi extends JFrame {
    public YeniMusteriKaydi() {
        setTitle("Yeni Müşteri Kaydı");
        setSize(400, 300);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);

        JPanel panel = new JPanel(new BorderLayout());

        JButton existingCustomerButton = new JButton("Kayıtlı Müşteri Bilgileri");
        JButton newCustomerButton = new JButton("Yeni Müşteri Kaydı Yap");

        panel.add(existingCustomerButton, BorderLayout.NORTH);
        panel.add(newCustomerButton, BorderLayout.SOUTH);

        existingCustomerButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Kayıtlı müşteri bilgilerini listeleme işlemi burada yapılabilir
                // Örnek olarak bir JTable veya JTextArea kullanabilirsiniz.
            }
        });

        newCustomerButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Yeni müşteri kaydı yapma işlemi için form alanları burada oluşturulabilir
                // Örnek olarak JTextField, JComboBox vb. öğeler kullanabilirsiniz.
            }
        });

        add(panel);
    }
/*
    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new YeniMusteriKaydi().setVisible(true);
            }
        });
    }

 */
}
