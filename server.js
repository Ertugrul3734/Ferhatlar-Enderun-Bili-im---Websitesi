const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// ═══ Statik dosya sunumu — public klasörü kök dizin olarak ═══
app.use(express.static(path.join(__dirname, 'public')));

// ═══ API: Kulüp fotoğraflarını döndür ═══
// Kulüp adı → gerçek klasör adı eşleştirmesi
const clubFolderMap = {
    'sanat': 'sanat',
    'sosyal': 'sosyal_faliyetler',
    'kitap': 'Kütüphane',
    'gelisim': 'kisisel_gelisim',
    'bilisim': 'bilişim'
};

// Desteklenen görsel uzantıları
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];

app.get('/api/images/:clubName', (req, res) => {
    const clubName = req.params.clubName.toLowerCase();
    const folderName = clubFolderMap[clubName];

    // Bilinmeyen kulüp adı kontrolü
    if (!folderName) {
        return res.status(404).json({
            success: false,
            message: `"${clubName}" adında bir kulüp bulunamadı.`,
            images: []
        });
    }

    const folderPath = path.join(__dirname, 'public', 'assets', 'images', folderName);

    // Klasör var mı kontrol et
    if (!fs.existsSync(folderPath)) {
        return res.json({
            success: true,
            clubName: clubName,
            folderName: folderName,
            images: []
        });
    }

    try {
        // Klasördeki tüm dosyaları oku ve sadece görselleri filtrele
        const allFiles = fs.readdirSync(folderPath);
        const imageFiles = allFiles.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });

        // Görsellerin tam URL yollarını oluştur
        const images = imageFiles.map(file => ({
            filename: file,
            path: `/assets/images/${encodeURIComponent(folderName)}/${encodeURIComponent(file)}`
        }));

        res.json({
            success: true,
            clubName: clubName,
            folderName: folderName,
            count: images.length,
            images: images
        });

    } catch (err) {
        console.error(`Klasör okuma hatası (${folderName}):`, err.message);
        res.status(500).json({
            success: false,
            message: 'Sunucu tarafında bir hata oluştu.',
            images: []
        });
    }
});

// ═══ Sunucuyu Başlat ═══
function startServer(port) {
    app.listen(port, () => {
        console.log(`\n🚀 Ferhatlar Enderun Bilişim Sunucusu Aktif!`);
        console.log(`📡 http://localhost:${port}`);
        console.log(`📂 Statik dosyalar: ./public/\n`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} kullanımda, ${port + 1} portu deneniyor...`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
}

startServer(PORT);
