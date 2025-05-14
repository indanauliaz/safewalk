let map, marker;
let lastLat = null, lastLon = null;

document.getElementById('startBtn').addEventListener('click', function () {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Cek apakah lokasi berubah cukup jauh dari lokasi sebelumnya
        if (lastLat && lastLon && (Math.abs(lat - lastLat) > 0.0001 || Math.abs(lon - lastLon) > 0.0001)) {
          // Jika peta belum ada, buat peta baru
          if (!map) {
            map = L.map('map').setView([lat, lon], 16);

            // Tambahkan tile layer dari OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Tambahkan marker posisi awal
            marker = L.marker([lat, lon]).addTo(map)
              .bindPopup('Kamu di sini 😎')
              .openPopup();
          } else {
            // Jika peta sudah ada, update posisi marker
            marker.setLatLng([lat, lon]);
            map.setView([lat, lon], 16);
          }

          // Update lokasi terakhir
          lastLat = lat;
          lastLon = lon;

          // Tampilkan lokasi di bawah peta
          const lokasiDiv = document.createElement('div');
          lokasiDiv.innerHTML = `
            <h3>📍 Lokasi Kamu</h3>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lon}</p>
          `;
          document.body.appendChild(lokasiDiv);
        }
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      },
      {
        enableHighAccuracy: true, // Memastikan akurasi tinggi
        maximumAge: 0, // Tidak menggunakan lokasi yang sudah kadaluarsa
        timeout: 5000, // Timeout jika tidak mendapatkan lokasi dalam 5 detik
      }
    );
  } else {
    alert("Geolocation tidak didukung di browser ini.");
  }
});
