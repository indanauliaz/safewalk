let map;
let markerUser;
let markerTujuan;
let markerEksplorasi;
let routeLine;

const ITB_COORDS = [107.6108, -6.8915]; // [lon, lat]

document.getElementById('startBtn').addEventListener('click', () => {
  const jamInput = document.getElementById('jamJalan').value;
  if (!jamInput) {
    alert('Silakan pilih jam jalan terlebih dahulu.');
    return;
  }

  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('jamJalan').style.display = 'none';
  document.getElementById('map').style.display = 'block';

  if (!('geolocation' in navigator)) {
    alert('Geolocation tidak didukung browser ini.');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    map = L.map('map').setView([lat, lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markerUser = L.marker([lat, lon]).addTo(map).bindPopup('Kamu di sini 😎').openPopup();

    // Marker ITB (fixed)
    markerTujuan = L.marker([ITB_COORDS[1], ITB_COORDS[0]])
      .addTo(map)
      .bindPopup('Tujuan')
      .openPopup();

    const infoDiv = document.getElementById('info');
    infoDiv.innerHTML = `
      <h3>📍 Lokasi Kamu</h3>
      <p>Latitude: ${lat.toFixed(5)}</p>
      <p>Longitude: ${lon.toFixed(5)}</p>
      <p>Jam jalan: <b>${jamInput}</b></p>
      <p>Klik di peta untuk menentukan tujuan</p>
    `;

    // Klik di peta → marker eksplorasi (tidak mengubah rute)
    map.on('click', (e) => {
      const eksplorLat = e.latlng.lat;
      const eksplorLon = e.latlng.lng;

      if (markerEksplorasi) {
        map.removeLayer(markerEksplorasi);
      }

      markerEksplorasi = L.marker([eksplorLat, eksplorLon])
        .addTo(map)
        .bindPopup(`Titik eksplorasi 🧭<br>Lat: ${eksplorLat.toFixed(5)}<br>Lon: ${eksplorLon.toFixed(5)}`)
        .openPopup();
    });

    await hitungRute([lon, lat], ITB_COORDS, jamInput);

  }, (err) => {
    alert('Gagal mendapatkan lokasi: ' + err.message);
  });
});

async function hitungRute(startCoords, endCoords, jam) {
  const apiKey = '5b3ce3597851110001cf6248947756bf8fdb49fba7ecaed05516ff31';
  const infoDiv = document.getElementById('info');

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
    console.log('Response ORS:', ruteData);

    if (
      !ruteData.routes ||
      !ruteData.routes[0] ||
      !ruteData.routes[0].geometry ||
      !ruteData.routes[0].geometry.coordinates
    ) {
      alert('Gagal mendapatkan rute. Response error: ' + (ruteData.error || 'Tidak diketahui'));
      return;
    }

    const waktu = ruteData.routes[0].summary.duration / 60;

    if (routeLine) {
      map.removeLayer(routeLine);
    }

    const routeCoords = ruteData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
    map.fitBounds(routeLine.getBounds());

    let waktuDiv = document.getElementById('waktu');
    if (!waktuDiv) {
      waktuDiv = document.createElement('div');
      waktuDiv.id = 'waktu';
      infoDiv.appendChild(waktuDiv);
    }
    waktuDiv.innerHTML = `<p>🕒 Estimasi waktu jalan kaki: ${waktu.toFixed(1)} menit</p>`;

    let jamDiv = document.getElementById('jam-info');
    if (!jamDiv) {
      jamDiv = document.createElement('div');
      jamDiv.id = 'jam-info';
      infoDiv.appendChild(jamDiv);
    }
    jamDiv.innerHTML = `<p>🕰️ Jam jalan yang dipilih: <b>${jam}</b></p>`;

  } catch (err) {
    alert("Terjadi kesalahan saat menghitung rute: " + err.message);
    console.error(err);
  }
}
