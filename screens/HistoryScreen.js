import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { getBills, getBillItems } from '../database/api';
import { useIsFocused } from '@react-navigation/native';

// expo-print and expo-sharing are native-only
let Print, shareAsync;
if (Platform.OS !== 'web') {
    Print = require('expo-print');
    shareAsync = require('expo-sharing').shareAsync;
}

const HistoryScreen = () => {
    const [bills, setBills] = useState([]);
    const [expandedBillId, setExpandedBillId] = useState(null);
    const [billItems, setBillItems] = useState({});
    const isFocused = useIsFocused();

    const loadBills = async () => {
        const data = await getBills();
        setBills(data);
    };

    useEffect(() => {
        if (isFocused) {
            loadBills();
        }
    }, [isFocused]);

    const handleExpand = async (id) => {
        if (expandedBillId === id) {
            setExpandedBillId(null);
        } else {
            setExpandedBillId(id);
            if (!billItems[id]) {
                const items = await getBillItems(id);
                setBillItems(prev => ({ ...prev, [id]: items }));
            }
        }
    };

    const buildBillHtml = (bill, items) => `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          </head>
          <body style="text-align: center;">
            <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
              Bill Receipt #${bill.id}
            </h1>
            <p>Date: ${bill.date}</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="border: 1px solid black; padding: 5px;">Item</th>
                <th style="border: 1px solid black; padding: 5px;">Qty</th>
                <th style="border: 1px solid black; padding: 5px;">Price</th>
                <th style="border: 1px solid black; padding: 5px;">Total</th>
              </tr>
              ${items.map(item => `
                <tr>
                  <td style="border: 1px solid black; padding: 5px;">${item.product_name}</td>
                  <td style="border: 1px solid black; padding: 5px;">${item.qty}</td>
                  <td style="border: 1px solid black; padding: 5px;">${item.price}</td>
                  <td style="border: 1px solid black; padding: 5px;">${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <h2>Total: ₹${Number(bill.total).toFixed(2)}</h2>
          </body>
        </html>
    `;

    const handlePrint = async (bill) => {
        try {
            const items = billItems[bill.id] || await getBillItems(bill.id);
            const html = buildBillHtml(bill, items);

            if (Platform.OS === 'web') {
                // Web: open a new window and trigger browser print dialog
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
            Alert.alert('Error', 'Failed to print bill');
        }
    };

    const renderBill = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity style={styles.header} onPress={() => handleExpand(item.id)}>
                <View>
                    <Text style={styles.date}>{item.date}</Text>
                    <Text style={styles.billId}>Bill #{item.id}</Text>
                </View>
                <Text style={styles.amount}>₹{Number(item.total).toFixed(2)}</Text>
            </TouchableOpacity>

            {expandedBillId === item.id && (
                <View style={styles.details}>
                    <View style={styles.divider} />
                    {billItems[item.id] ? (
                        billItems[item.id].map((curr, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <Text style={styles.itemName}>{curr.product_name} x {curr.qty}</Text>
                                <Text style={styles.itemPrice}>{(Number(curr.price) * curr.qty).toFixed(2)}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>Loading items...</Text>
                    )}
                    <TouchableOpacity style={styles.printButton} onPress={() => handlePrint(item)}>
                        <Text style={styles.printButtonText}>Print Bill</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View >
    );

    return (
        <View style={styles.container}>
            {bills.length === 0 ? (
                <View style={styles.center}>
                    <Text>No history yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={bills}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBill}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    billId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2a9d8f'
    },
    details: {
        marginTop: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    itemName: {
        color: '#555',
    },
    itemPrice: {
        color: '#555',
        fontWeight: 'bold',
    },
    printButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',
    },
    printButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default HistoryScreen;
