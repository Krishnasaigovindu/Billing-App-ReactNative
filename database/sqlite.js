import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('billing_app.db');

export const initDb = () => {
    try {
        db.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total REAL NOT NULL,
        date TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS bill_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        price REAL NOT NULL,
        qty INTEGER NOT NULL,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
      );
    `);
        console.log('SQLite Database Initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

export const runQuery = (sql, params = []) => {
    try {
        const result = db.getAllSync(sql, params);
        return result;
    }
    catch (error) {
        console.error('Error running query:', error);
        throw error;
    }
}


export const runRun = (sql, params = []) => {
    try {
        const result = db.runSync(sql, params);
        return result;
    } catch (error) {
        console.error('Error running runSync:', error);
        throw error;
    }
}


export default db;
