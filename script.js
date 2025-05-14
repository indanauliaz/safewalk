document.getElementById('startBtn').addEventListener('click', async function () {
  const apiKey = '5b3ce3597851110001cf6248947756bf8fdb49fba7ecaed05516ff31';
  const alamat = document.getElementById('alamatTujuan').value;

  if (!alamat) {
    alert('Masukkan alamat tujuan terlebih dahulu.');
    return;
  }

  try {
    // Geocoding untuk alamat tujuan
    const geoRes = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(alamat)}`);
    const geoData = await geoRes.json();

    if (!geoData.features.length) {
      alert('Alamat tujuan tidak ditemukan.');
      return;
    }

    const tujuan = geoData.features[0].geometry.coordinates; // [lon, lat]

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Tampilkan info lokasi
        const lokasiDiv = document.getElementById('info');
        lokasiDiv.innerHTML = `
          <h3>📍 Lokasi Kamu</h3>
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lon}</p>
        `;

        // Tampilkan peta
        const map = L.map('map').setView([lat, lon], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Marker
        L.marker([lat, lon]).addTo(map).bindPopup('Kamu di sini 😎').openPopup();
        L.marker([tujuan[1], tujuan[0]]).addTo(map).bindPopup('Tujuan 🎯').openPopup();

        // Hitung rute jalan kaki
        const ruteRes = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking', {
          method: 'POST',
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            coordinates: [
              [lon, lat],
              tujuan
            ]
          })
        });

        const ruteData = await ruteRes.json();
        const waktu = ruteData.routes[0].summary.duration / 60;

        const waktuDiv = document.createElement('div');
        waktuDiv.innerHTML = `<p>🕒 Estimasi waktu jalan kaki: ${waktu.toFixed(1)} menit</p>`;
        lokasiDiv.appendChild(waktuDiv);

        const routeCoords = ruteData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
        map.fitBounds(routeLine.getBounds());

      }, (err) => {
        alert("Gagal mendapatkan lokasi: " + err.message);
      });
    } else {
      alert("Geolocation tidak didukung.");
    }
  } catch (err) {
    alert("Terjadi kesalahan: " + err.message);
  }
});
