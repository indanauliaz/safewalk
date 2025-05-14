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

// Menambahkan event listener untuk menghitung waktu perjalanan
document.getElementById('calculateBtn').addEventListener('click', function () {
  const destination = document.getElementById('destination').value;

  if (!destination) {
    alert('Silakan masukkan tujuan!');
    return;
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Ambil API Key kamu dari OpenRouteService
        const apiKey = 'YOUR_API_KEY'; // Ganti dengan API key kamu

        // Membuat URL untuk OpenRouteService API
        const apiUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${lon},${lat}&end=${destination}`;

        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            const time = data.features[0].properties.segments[0].duration / 60; // waktu dalam menit
            const distance = data.features[0].properties.segments[0].distance / 1000; // jarak dalam km

            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
              <h3>Rute Perjalanan</h3>
              <p>Jarak: ${distance.toFixed(2)} km</p>
              <p>Waktu Perjalanan: ${time.toFixed(2)} menit</p>
            `;
          })
          .catch(error => {
            alert("Gagal menghitung waktu perjalanan: " + error.message);
          });
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      }
    );
  } else {
    alert("Geolocation tidak didukung di browser ini.");
  }
});
