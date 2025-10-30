const mongoose = require('mongoose');

class Database {
    static instance;
    connection = null;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        Database.instance = this;
    }

    async connect() {
        if (this.connection) {
            console.log('Veritabanı bağlantısı zaten mevcut, tekrar bağlanılmıyor.');
            return;
        }

        try {
            if (!process.env.MONGO_URI) {
                throw new Error("HATA: MONGO_URI ortam değişkeni .env dosyasında tanımlanmamış.");
            }

            console.log('Veritabanına bağlanılıyor...');
            const connection = await mongoose.connect(process.env.MONGO_URI);
            this.connection = connection;
            console.log(`Veritabanına başarıyla bağlanıldı: ${connection.connection.host}`);

        } catch (error) {
            console.error('Veritabanı bağlantısı kurulamadı. Hata server.js\'e fırlatılıyor...');
            throw error;
        }
    }

    static getInstance() {
        if (!Database.instance) {
            new Database();
        }
        return Database.instance;
    }
}

module.exports = Database.getInstance();
