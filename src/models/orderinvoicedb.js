export function CreateOrderInvoiceDB(db) {
  db.exec(`
        CREATE TABLE IF NOT EXISTS Order(
            id INTEGER PRIMARY KEY AUTOINCREMENT         
        );

        CREATE TABLE IF NOT EXISTS Invoice(
            id INTEGER PRIMARY KEY AUTOINCREMENT   
        );
    `);
}
