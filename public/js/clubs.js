/**
 * ═══════════════════════════════════════════════════════
 *  Ferhatlar Enderun Bilişim — Dinamik Kulüp Carousel'leri
 * ═══════════════════════════════════════════════════════
 *  Her kulüp için backend API'den fotoğrafları çeker ve
 *  Bootstrap 5 Carousel bileşenini dinamik olarak oluşturur.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Kulüp adı → HTML'deki data-club attribute eşleştirmesi
    const clubs = ['sanat', 'sosyal', 'kitap', 'gelisim', 'bilisim'];

    clubs.forEach(clubName => {
        const container = document.querySelector(`[data-club="${clubName}"]`);
        if (!container) return;

        buildCarousel(clubName, container);
    });

});

/**
 * Belirli bir kulüp için API'den fotoğrafları çeker ve carousel oluşturur
 */
async function buildCarousel(clubName, container) {
    try {
        const response = await fetch(`/api/images/${clubName}`);
        const data = await response.json();

        if (!data.success || !data.images || data.images.length === 0) {
            // Fotoğraf yoksa varsayılan görsel kalsın, hiçbir şey yapma
            console.warn(`⚠️ "${clubName}" kulübü için fotoğraf bulunamadı.`);
            return;
        }

        // Benzersiz carousel ID oluştur
        const carouselId = `carousel-${clubName}`;

        // Carousel HTML yapısını oluştur
        const carouselHTML = `
            <div id="${carouselId}" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000">
                
                <!-- Göstergeler (Alt noktalar) -->
                <div class="carousel-indicators">
                    ${data.images.map((_, i) => `
                        <button type="button" 
                            data-bs-target="#${carouselId}" 
                            data-bs-slide-to="${i}" 
                            ${i === 0 ? 'class="active" aria-current="true"' : ''}
                            aria-label="Slayt ${i + 1}">
                        </button>
                    `).join('')}
                </div>

                <!-- Slaytlar -->
                <div class="carousel-inner">
                    ${data.images.map((img, i) => `
                        <div class="carousel-item ${i === 0 ? 'active' : ''}">
                            <img src="${img.path}" 
                                 class="d-block w-100" 
                                 alt="${clubName} etkinlik ${i + 1}"
                                 loading="lazy">
                        </div>
                    `).join('')}
                </div>

                <!-- Navigasyon Okları -->
                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Önceki</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Sonraki</span>
                </button>
            </div>

            <!-- Hover Overlay -->
            <div class="club-overlay">
                <span class="club-overlay-text">ETKİNLİKLERİMİZDEN KARELER</span>
            </div>
        `;

        // Container'ın içindeki statik img'yi carousel ile değiştir
        container.innerHTML = carouselHTML;

        // Bootstrap Carousel instance'ını başlat
        const carouselElement = document.getElementById(carouselId);
        new bootstrap.Carousel(carouselElement, {
            interval: 3000,
            ride: 'carousel',
            wrap: true,
            pause: 'hover'
        });

        console.log(`✅ "${clubName}" carousel'i ${data.images.length} fotoğraf ile oluşturuldu.`);

    } catch (error) {
        console.error(`❌ "${clubName}" carousel oluşturulurken hata:`, error);
    }
}
