let map, userMarker, tujuanMarker, routeLine;

async function initMap() {
  if (!('geolocation' in navigator)) {
    alert("Geolocation tidak didukung di browser ini.");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Buat map dan set view ke lokasi user
    map = L.map('map').setView([lat, lon], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Marker lokasi user
    userMarker = L.marker([lat, lon]).addTo(map).bindPopup('Kamu di sini 😎').openPopup();

    // Info lokasi awal
    const lokasiDiv = document.getElementById('info');
    lokasiDiv.innerHTML = `
      <h3>📍 Lokasi Kamu</h3>
      <p>Latitude: ${lat}</p>
      <p>Longitude: ${lon}</p>
      <p>Silakan klik di peta untuk memilih titik tujuan.</p>
    `;

    // Event klik di peta untuk set tujuan
    map.on('click', async function(e) {
      const tujuanLatLng = e.latlng;

      // Hapus marker tujuan lama kalau ada
      if (tujuanMarker) {
        map.removeLayer(tujuanMarker);
      }

      tujuanMarker = L.marker(tujuanLatLng).addTo(map).bindPopup('Tujuan 🎯').openPopup();

      // Hitung rute dari user ke tujuan
      await hitungRute([lon, lat], [tujuanLatLng.lng, tujuanLatLng.lat]);
    });

  }, err => {
    alert("Gagal mendapatkan lokasi: " + err.message);
  });
}

async function hitungRute(startCoords, endCoords) {
  const apiKey = '5b3ce3597851110001cf6248947756bf8fdb49fba7ecaed05516ff31';
  const lokasiDiv = document.getElementById('info');

  try {
    const ruteRes = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [
          startCoords,
          endCoords
        ]
      })
    });

    const ruteData = await ruteRes.json();

    if (!ruteData.routes || !ruteData.routes[0]) {
      alert('Gagal mendapatkan rute.');
      return;
    }

    const waktu = ruteData.routes[0].summary.duration / 60;

    // Hapus route line lama kalau ada
    if (routeLine) {
      map.removeLayer(routeLine);
    }

    // Gambar rute baru
    const routeCoords = ruteData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);

    // Zoom peta ke rute
    map.fitBounds(routeLine.getBounds());

    // Update info estimasi waktu
    let waktuDiv = document.getElementById('waktu');
    if (!waktuDiv) {
      waktuDiv = document.createElement('div');
      waktuDiv.id = 'waktu';
      lokasiDiv.appendChild(waktuDiv);
    }
    waktuDiv.innerHTML = `<p>🕒 Estimasi waktu jalan kaki: ${waktu.toFixed(1)} menit</p>`;

  } catch (err) {
    alert("Terjadi kesalahan saat menghitung rute: " + err.message);
    console.error(err);
  }
}

// Init map saat halaman load
window.onload = initMap;
