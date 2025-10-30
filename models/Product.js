// Mongoose kütüphanesini içeri aktar. Veritabanı işlemleri için bu gerekli.
const mongoose = require('mongoose');

// Bir "Ürün" için şablonumuzu (Schema) oluşturuyoruz.
const productSchema = new mongoose.Schema(
    {
        // Ürünün adı.
        name: {
            type: String,       // Veri tipi metin olmalı.
            required: true,     // Bu alan zorunludur. Boş bırakılamaz.
            trim: true          // Başındaki ve sonundaki boşlukları otomatik olarak temizler.
        },
        // Ürünün açıklaması.
        description: {
            type: String,
            required: true,
            trim: true
        },
        // Ürünün fiyatı.
        price: {
            type: Number,       // Veri tipi sayı olmalı.
            required: true,
            default: 0          // Eğer fiyat belirtilmezse, varsayılan olarak 0 olsun.
        },
        // Stok adedi.
        stock: {
            type: Number,
            required: true,
            default: 0
        }
    }, 
    {
        // Ayarlar objesi: Bu şemaya ait her dokümana otomatik olarak iki alan ekler:
        // createdAt: Dokümanın oluşturulma tarihi.
        // updatedAt: Dokümanın son güncellenme tarihi.
        // Bu, son derece yaygın ve kullanışlı bir özelliktir.
        timestamps: true //ekleme ve güncelleme tarihi ekler
    }
);

// Şemamızı kullanarak bir "Model" oluşturuyoruz.
// mongoose.model('ModelAdı', şema);
// 'Product' adını (PascalCase) veriyoruz. Mongoose, bunu veritabanında otomatik olarak çoğul ve küçük harfli hale getirip
// 'products' adında bir koleksiyon (collection) olarak arayacaktır.
const Product = mongoose.model('Product', productSchema);

// Oluşturduğumuz bu Product modelini, projenin başka yerlerinde kullanabilmek için export ediyoruz.
module.exports = Product;