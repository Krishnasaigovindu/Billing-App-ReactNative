import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ProductCard = ({ product, onEdit, onDelete, onAddToCart, isBillingMode }) => {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>₹{Number(product.price).toFixed(2)}</Text>
            </View>

            <View style={styles.actions}>
                {isBillingMode ? (
                    <TouchableOpacity style={styles.addButton} onPress={() => onAddToCart(product)}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(product)}>
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(product.id)}>
                            <Text style={styles.buttonText}>Del</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 8,
        elevation: 2, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    category: {
        fontSize: 12,
        color: '#666',
    },
    price: {
        fontSize: 14,
        color: '#2a9d8f',
        fontWeight: 'bold',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 10
    },
    addButton: {
        backgroundColor: '#2a9d8f',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    editButton: {
        backgroundColor: '#f4a261',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#e76f51',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    }

});

export default ProductCard;
