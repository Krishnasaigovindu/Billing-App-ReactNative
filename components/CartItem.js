import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{Number(item.price).toFixed(2)} x {item.qty}</Text>
            </View>
            <View style={styles.totalContainer}>
                <Text style={styles.total}>₹{(Number(item.price) * item.qty).toFixed(2)}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => onDecrease(item)}>
                    <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.qty}</Text>
                <TouchableOpacity style={styles.circleBtn} onPress={() => onIncrease(item)}>
                    <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    info: {
        flex: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 14,
        color: '#555',
    },
    totalContainer: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 10,
    },
    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1.5,
        justifyContent: 'flex-end'
    },
    circleBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    qty: {
        marginHorizontal: 10,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default CartItem;
