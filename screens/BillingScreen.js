import React, { useContext, useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Modal, Animated, Easing
} from 'react-native';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import CartItem from '../components/CartItem';

const BillingScreen = ({ navigation }) => {
    const { products, cart, addToCart, removeFromCart, updateCartQty } = useContext(AppContext);
    const [showProductList, setShowProductList] = useState(false);

    // ── Toast state ──────────────────────────────────────────────────
    const [toastProduct, setToastProduct] = useState('');
    const toastOpacity = useRef(new Animated.Value(0)).current;
    const toastTranslateY = useRef(new Animated.Value(20)).current;
    const toastTimer = useRef(null);

    const showToast = (productName) => {
        setToastProduct(productName);

        // Reset & animate in
        toastOpacity.setValue(0);
        toastTranslateY.setValue(20);
        Animated.parallel([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(toastTranslateY, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
        ]).start();

        // Clear previous timer
        if (toastTimer.current) clearTimeout(toastTimer.current);

        // Animate out after 1.8s
        toastTimer.current = setTimeout(() => {
            Animated.parallel([
                Animated.timing(toastOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(toastTranslateY, {
                    toValue: -10,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1800);
    };

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    // ─────────────────────────────────────────────────────────────────

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleIncrease = (item) => updateCartQty(item.id, item.qty + 1);
    const handleDecrease = (item) => updateCartQty(item.id, item.qty - 1);

    const handleAddToCart = (product) => {
        addToCart(product);
        showToast(product.name);
    };

    const handleGenerateBill = () => {
        if (cart.length === 0) return;
        navigation.navigate('BillSummary');
    };

    return (
        <View style={styles.container}>
            {/* Cart List */}
            <View style={styles.cartContainer}>
                <Text style={styles.header}>Current Bill</Text>
                {cart.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Text style={styles.emptyText}>Cart is empty. Add items.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={cart}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <CartItem
                                item={item}
                                onIncrease={handleIncrease}
                                onDecrease={handleDecrease}
                                onRemove={removeFromCart}
                            />
                        )}
                    />
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.addItemBtn} onPress={() => setShowProductList(true)}>
                        <Text style={styles.btnText}>+ Add Items</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.generateBtn, cart.length === 0 && styles.disabledBtn]}
                        onPress={handleGenerateBill}
                        disabled={cart.length === 0}
                    >
                        <Text style={styles.btnText}>Generate Bill</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Product Selection Modal */}
            <Modal visible={showProductList} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Items</Text>
                        <TouchableOpacity onPress={() => setShowProductList(false)}>
                            <Text style={styles.closeText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ProductCard
                                product={item}
                                isBillingMode={true}
                                onAddToCart={handleAddToCart}
                            />
                        )}
                    />
                </View>
            </Modal>

            {/* ── Animated "Added" Toast ── */}
            <Animated.View
                style={[
                    styles.toast,
                    { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }
                ]}
                pointerEvents="none"
            >
                <Text style={styles.toastIcon}>✓</Text>
                <Text style={styles.toastText}>
                    <Text style={styles.toastBold}>{toastProduct}</Text> added to cart!
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    cartContainer: {
        flex: 1,
        padding: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 15,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        elevation: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2a9d8f',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    addItemBtn: {
        flex: 1,
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    generateBtn: {
        flex: 1,
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledBtn: {
        backgroundColor: '#aaa',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        paddingTop: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeText: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: 'bold',
    },

    // ── Toast ──
    toast: {
        position: 'absolute',
        bottom: 110,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        gap: 8,
    },
    toastIcon: {
        color: '#2ecc71',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
    },
    toastBold: {
        fontWeight: 'bold',
        color: '#74b9ff',
    },
});

export default BillingScreen;
