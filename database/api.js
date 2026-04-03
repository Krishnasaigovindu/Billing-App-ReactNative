/**
 * api.js  –  Platform-aware database layer
 *
 * On native (Android / iOS)  →  expo-sqlite  (via sqlite.js)
 * On web                     →  localStorage (via storage.web.js)
 */

import { Platform } from 'react-native';

export const API_URL = 'LOCAL_SQLITE'; // kept for compatibility

// ─── Dynamic imports ─────────────────────────────────────────────────────────

let _initDb, _addProduct, _updateProduct, _deleteProduct, _getProducts;
let _addBill, _getBills, _getBillItems;
let _db; // native-only raw db reference

if (Platform.OS === 'web') {
    // Web: use localStorage shim
    const web = require('./storage.web');
    _initDb        = web.initDb;
    _addProduct    = web.addProduct;
    _updateProduct = web.updateProduct;
    _deleteProduct = web.deleteProduct;
    _getProducts   = web.getProducts;
    _addBill       = web.addBill;
    _getBills      = web.getBills;
    _getBillItems  = web.getBillItems;
} else {
    // Native: use expo-sqlite
    const sqlite = require('./sqlite');
    _initDb        = sqlite.initDb;
    _db            = sqlite.default;

    _addProduct = (name, price) => {
        const result = sqlite.runRun(
            'INSERT INTO products (name, price) VALUES (?, ?)',
            [name, price]
        );
        return result.lastInsertRowId;
    };

    _updateProduct = (id, name, price) => {
        sqlite.runRun(
            'UPDATE products SET name = ?, price = ? WHERE id = ?',
            [name, price, id]
        );
    };

    _deleteProduct = (id) => {
        sqlite.runRun('DELETE FROM products WHERE id = ?', [id]);
    };

    _getProducts = () => sqlite.runQuery('SELECT * FROM products');

    _addBill = (total, date, items) => {
        let billId;
        _db.withTransactionSync(() => {
            const billResult = _db.runSync(
                'INSERT INTO bills (total, date) VALUES (?, ?)',
                [total, date]
            );
            billId = billResult.lastInsertRowId;
            for (const item of items) {
                _db.runSync(
                    'INSERT INTO bill_items (bill_id, product_name, price, qty) VALUES (?, ?, ?, ?)',
                    [billId, item.product_name, item.price, item.qty]
                );
            }
        });
        return billId;
    };

    _getBills    = () => sqlite.runQuery('SELECT * FROM bills ORDER BY id DESC');
    _getBillItems = (billId) =>
        sqlite.runQuery('SELECT * FROM bill_items WHERE bill_id = ?', [billId]);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const init = async () => {
    console.log(`Initializing DB on platform: ${Platform.OS}`);
    _initDb();
};

export const addProduct = async (name, price) => {
    try {
        return _addProduct(name, price);
    } catch (error) {
        console.error('addProduct error', error);
        throw error;
    }
};

export const updateProduct = async (id, name, price) => {
    try {
        _updateProduct(id, name, price);
    } catch (error) {
        console.error('updateProduct error', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        _deleteProduct(id);
    } catch (error) {
        console.error('deleteProduct error', error);
        throw error;
    }
};

export const getProducts = async () => {
    try {
        return _getProducts();
    } catch (error) {
        console.error('getProducts error', error);
        return [];
    }
};

export const addBill = async (total, date, items) => {
    try {
        return _addBill(total, date, items);
    } catch (error) {
        console.error('addBill error', error);
        throw error;
    }
};

export const getBills = async () => {
    try {
        return _getBills();
    } catch (error) {
        console.error('getBills error', error);
        return [];
    }
};

export const getBillItems = async (billId) => {
    try {
        return _getBillItems(billId);
    } catch (error) {
        console.error('getBillItems error', error);
        return [];
    }
};
