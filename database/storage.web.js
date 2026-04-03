/**
 * Web fallback storage using localStorage.
 * Mirrors the same function signatures as sqlite.js so api.js works unchanged on web.
 */

const KEYS = {
    products: 'billing_products',
    bills: 'billing_bills',
    bill_items: 'billing_bill_items',
    meta: 'billing_meta', // stores auto-increment counters
};

const load = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
};

const save = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const loadMeta = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.meta) || '{}');
    } catch {
        return {};
    }
};

const nextId = (table) => {
    const meta = loadMeta();
    meta[table] = (meta[table] || 0) + 1;
    localStorage.setItem(KEYS.meta, JSON.stringify(meta));
    return meta[table];
};

// ─── Products ────────────────────────────────────────────────────────────────

export const addProduct = (name, price) => {
    const products = load(KEYS.products);
    const id = nextId('products');
    products.push({ id, name, price });
    save(KEYS.products, products);
    return id;
};

export const updateProduct = (id, name, price) => {
    const products = load(KEYS.products).map(p =>
        p.id === id ? { ...p, name, price } : p
    );
    save(KEYS.products, products);
};

export const deleteProduct = (id) => {
    const products = load(KEYS.products).filter(p => p.id !== id);
    save(KEYS.products, products);
};

export const getProducts = () => load(KEYS.products);

// ─── Bills ───────────────────────────────────────────────────────────────────

export const addBill = (total, date, items) => {
    const bills = load(KEYS.bills);
    const billItems = load(KEYS.bill_items);

    const billId = nextId('bills');
    bills.push({ id: billId, total, date });
    save(KEYS.bills, bills);

    for (const item of items) {
        const itemId = nextId('bill_items');
        billItems.push({
            id: itemId,
            bill_id: billId,
            product_name: item.product_name,
            price: item.price,
            qty: item.qty,
        });
    }
    save(KEYS.bill_items, billItems);

    return billId;
};

export const getBills = () => {
    return load(KEYS.bills).slice().reverse(); // newest first
};

export const getBillItems = (billId) => {
    return load(KEYS.bill_items).filter(item => item.bill_id === billId);
};

export const initDb = () => {
    console.log('Web storage initialized (localStorage)');
};
