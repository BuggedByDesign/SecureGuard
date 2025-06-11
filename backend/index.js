// ✅ Основен backend файл
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 📁 Импортиране на маршрути
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewsRoute = require('./routes/reviews');
const productFeaturesRoute = require('./routes/productFeatures');
const expertRoutes = require('./routes/expertRoutes');

// 🔧 Конфигурация
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🔐 Аутентикация (регистрация, вход)
app.use('/api', authRoutes);

// 🛒 Админ/Продукти
app.use('/api/admin', adminRoutes);

// 📝 Ревюта от потребители
app.use('/api/reviews', reviewsRoute);

app.use('/uploads', express.static('uploads'));

// ⭐ Допълнителни Key Features (ако използваш отделно)
app.use('/api/products', productFeaturesRoute);

// 🧠 Expert Reviews
app.use('/api/expert', expertRoutes);

// 🟢 Test Route
app.get('/', (req, res) => {
  res.send('Сървърът работи успешно!');
});

// 🚀 Стартиране
app.listen(PORT, () => {
  console.log(`✅ Сървърът работи на порт ${PORT}`);
});
