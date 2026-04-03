import React, { useContext, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { deleteProduct } from '../database/api';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const { products, refreshProducts } = useContext(AppContext);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            refreshProducts();
        }
    }, [isFocused]);

    const handleDelete = async (id) => {
        await deleteProduct(id);
        refreshProducts();
    };

    const handleEdit = (product) => {
        navigation.navigate('AddProduct', { product });
    };

    return (
        <View style={styles.container}>
            {products.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No products found.</Text>
                    <Text style={styles.subText}>Add products to start billing.</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    contentContainerStyle={styles.list}
                />
            )}

            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.billingFab}
                    onPress={() => navigation.navigate('Billing')}
                >
                    <Text style={styles.fabText}>Billing 🛒</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddProduct')}
                >
                    <Text style={styles.fabText}>+ Add Product</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        paddingBottom: 80,
        paddingTop: 10,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    subText: {
        color: '#777',
        marginTop: 5,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        alignItems: 'flex-end',
        gap: 10
    },
    fab: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    billingFab: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
        marginBottom: 10,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default HomeScreen;
