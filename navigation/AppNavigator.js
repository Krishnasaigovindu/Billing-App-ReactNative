import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddProductScreen from '../screens/AddProductScreen';
import BillingScreen from '../screens/BillingScreen';
import BillSummaryScreen from '../screens/BillSummaryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: { backgroundColor: '#3f51b5' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    title: 'Billing App',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.headerBtn}>
                            <Text style={styles.headerBtnText}>History</Text>
                        </TouchableOpacity>
                    )
                })}
            />
            <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Manage Product' }} />
            <Stack.Screen name="Billing" component={BillingScreen} options={{ title: 'New Bill' }} />
            <Stack.Screen name="BillSummary" component={BillSummaryScreen} options={{ title: 'Review & Save' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Bill History' }} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    headerBtn: {
        marginRight: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    headerBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default AppNavigator;
