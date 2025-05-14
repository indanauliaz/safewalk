document.getElementById('startBtn').addEventListener('click', function () {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Tampilkan lokasi
        const lokasiDiv = document.createElement('div');
        lokasiDiv.innerHTML = `
          <h3>📍 Lokasi Kamu</h3>
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lon}</p>
        `;
        document.body.appendChild(lokasiDiv);

        // Tampilkan peta
        const map = L.map('map').setView([lat, lon], 16);

        // Tambahkan tile layer dari OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Tambahkan marker posisi
        L.marker([lat, lon]).addTo(map)
          .bindPopup('Kamu di sini 😎')
          .openPopup();
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      }
    );
  } else {
    alert("Geolocation tidak didukung di browser ini.");
  }
});
