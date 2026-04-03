import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { addProduct, updateProduct } from '../database/api';
import { AppContext } from '../context/AppContext';

const AddProductScreen = ({ navigation, route }) => {
    const { refreshProducts } = useContext(AppContext);
    const editingProduct = route.params?.product;

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setPrice(editingProduct.price.toString());
            navigation.setOptions({ title: 'Edit Product' });
        }
    }, [editingProduct]);

    const handleSave = async () => {
        if (!name || !price) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            Alert.alert('Error', 'Price must be a number');
            return;
        }

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, name, priceNum);
            } else {
                await addProduct(name, priceNum);
            }
            await refreshProducts();
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save product');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Milk"
            />

            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0.00"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>{editingProduct ? 'Update Product' : 'Add Product'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    categoryContainer: {
        flexDirection: 'row',
        marginVertical: 10,
        gap: 15
    },
    catButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#eee',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    catButtonSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff'
    },
    catText: {
        fontSize: 14,
        color: '#333'
    },
    catTextSelected: {
        color: '#fff',
        fontWeight: 'bold'
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddProductScreen;
