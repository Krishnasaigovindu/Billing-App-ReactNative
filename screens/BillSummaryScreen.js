import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Modal, Platform, Animated
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { addBill } from '../database/api';

// expo-print and expo-sharing are native-only
let Print, shareAsync;
if (Platform.OS !== 'web') {
    Print = require('expo-print');
    shareAsync = require('expo-sharing').shareAsync;
}

const BillSummaryScreen = ({ navigation }) => {
    const { cart, clearCart } = useContext(AppContext);
    const [date, setDate] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedBillItems, setSavedBillItems] = useState([]);
    const [savedTotal, setSavedTotal] = useState(0);
    const scaleAnim = useState(new Animated.Value(0.7))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];

    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

    useEffect(() => {
        const now = new Date();
        setDate(now.toLocaleString());
    }, []);

    // Animate the success modal in
    const animateModalIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const buildHtml = (items, total, billDate) => `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 20px; color: #222; }
              h1 { font-size: 36px; font-weight: 300; margin-bottom: 4px; }
              .subtitle { color: #888; margin-bottom: 24px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th { background: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; }
              td { padding: 10px; border: 1px solid #ddd; }
              .total-row { font-size: 22px; font-weight: bold; margin-top: 24px; }
              .total-amount { color: #2a9d8f; }
            </style>
          </head>
          <body>
            <h1>🧾 Invoice</h1>
            <p class="subtitle">Date: ${billDate}</p>
            <table>
              <tr>
                <th>Item</th><th>Qty</th><th>Price (₹)</th><th>Total (₹)</th>
              </tr>
              ${items.map(item => `
                <tr>
                  <td>${item.product_name || item.name}</td>
                  <td style="text-align:center">${item.qty}</td>
                  <td style="text-align:right">${Number(item.price).toFixed(2)}</td>
                  <td style="text-align:right">${(Number(item.price) * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <p class="total-row">Grand Total: <span class="total-amount">₹${Number(total).toFixed(2)}</span></p>
          </body>
        </html>
    `;

    const handlePrint = async (items, total, billDate) => {
        try {
            const html = buildHtml(items, total, billDate);
            if (Platform.OS === 'web') {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            } else {
                const { uri } = await Print.printToFileAsync({ html });
                await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }
        } catch (error) {
            console.error('Print error:', error);
        }
    };

    const handleConfirmBill = async () => {
        try {
            const billItems = cart.map(item => ({
                product_name: item.name,
                price: item.price,
                qty: item.qty,
            }));

            await addBill(totalAmount, date, billItems);

            // Snapshot cart before clearing
            setSavedBillItems(billItems);
            setSavedTotal(totalAmount);

            // Show custom success modal
            scaleAnim.setValue(0.7);
            opacityAnim.setValue(0);
            setShowSuccess(true);
            setTimeout(animateModalIn, 50);

        } catch (error) {
            console.error('Save bill error:', error);
        }
    };

    const handlePrintAndClose = async () => {
        setShowSuccess(false);
        await handlePrint(savedBillItems, savedTotal, date);
        clearCart();
        navigation.popToTop();
    };

    const handleOkAndClose = () => {
        setShowSuccess(false);
        clearCart();
        navigation.popToTop();
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Invoice Summary</Text>
                <Text style={styles.date}>Date: {date}</Text>

                <View style={styles.divider} />

                <View style={styles.tableHeader}>
                    <Text style={styles.colName}>Item</Text>
                    <Text style={styles.colQty}>Qty</Text>
                    <Text style={styles.colPrice}>Price</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>

                {cart.map((item, index) => (
                    <View key={index} style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
                        <Text style={styles.colName}>{item.name}</Text>
                        <Text style={styles.colQty}>{item.qty}</Text>
                        <Text style={styles.colPrice}>₹{Number(item.price).toFixed(2)}</Text>
                        <Text style={styles.colTotal}>₹{(Number(item.price) * item.qty).toFixed(2)}</Text>
                    </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.totalContainer}>
                    <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                    <Text style={styles.grandTotalValue}>₹{Number(totalAmount).toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBill}>
                    <Text style={styles.confirmText}>✔  Confirm & Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.confirmBtn, styles.printPreviewBtn]}
                    onPress={() => handlePrint(
                        cart.map(i => ({ product_name: i.name, price: i.price, qty: i.qty })),
                        totalAmount,
                        date
                    )}
                >
                    <Text style={styles.confirmText}>🖨  Print Preview</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ── Success Modal ── */}
            <Modal visible={showSuccess} transparent animationType="none">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[
                        styles.successCard,
                        { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
                    ]}>
                        {/* Checkmark circle */}
                        <View style={styles.checkCircle}>
                            <Text style={styles.checkMark}>✓</Text>
                        </View>

                        <Text style={styles.successTitle}>Bill Saved!</Text>
                        <Text style={styles.successSubtitle}>
                            Your invoice of{' '}
                            <Text style={styles.successAmount}>₹{Number(savedTotal).toFixed(2)}</Text>
                            {' '}has been saved successfully.
                        </Text>

                        <View style={styles.successDivider} />

                        {/* Action buttons */}
                        <TouchableOpacity style={styles.printBtn} onPress={handlePrintAndClose}>
                            <Text style={styles.printBtnIcon}>🖨</Text>
                            <Text style={styles.printBtnText}>Print Invoice</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.okBtn} onPress={handleOkAndClose}>
                            <Text style={styles.okBtnText}>Done</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
        color: '#1a1a2e',
    },
    date: {
        textAlign: 'center',
        color: '#888',
        marginBottom: 20,
        fontSize: 13,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: '#f8f8f8',
        borderRadius: 6,
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    rowAlt: {
        backgroundColor: '#fafafa',
    },
    colName: { flex: 2, fontSize: 14, color: '#333' },
    colQty: { flex: 0.5, textAlign: 'center', fontSize: 14, color: '#333' },
    colPrice: { flex: 1.1, textAlign: 'right', fontSize: 14, color: '#555' },
    colTotal: { flex: 1.1, textAlign: 'right', fontWeight: 'bold', fontSize: 14, color: '#2a9d8f' },

    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        alignItems: 'center',
    },
    grandTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#333',
    },
    grandTotalValue: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2a9d8f',
    },
    confirmBtn: {
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 12,
        marginTop: 28,
        alignItems: 'center',
        shadowColor: '#28a745',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    printPreviewBtn: {
        backgroundColor: '#007bff',
        marginTop: 12,
        shadowColor: '#007bff',
    },
    confirmText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    // ── Success Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 15,
    },
    checkCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#e6f9f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        borderWidth: 3,
        borderColor: '#28a745',
    },
    checkMark: {
        fontSize: 36,
        color: '#28a745',
        fontWeight: 'bold',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    successAmount: {
        fontWeight: 'bold',
        color: '#2a9d8f',
    },
    successDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        width: '100%',
        marginVertical: 22,
    },
    printBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    printBtnIcon: {
        fontSize: 18,
    },
    printBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    okBtn: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ddd',
    },
    okBtnText: {
        color: '#555',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BillSummaryScreen;
