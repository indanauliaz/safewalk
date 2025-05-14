document.getElementById('startBtn').addEventListener('click', function () {
  const apiKey = '5b3ce3597851110001cf6248947756bf8fdb49fba7ecaed05516ff31';
  const tujuan = [107.6108, -6.8915]; // Contoh: ITB Bandung

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log("Lokasi pengguna:", lat, lon);
        console.log("Lokasi tujuan:", tujuan[1], tujuan[0]);

        const lokasiDiv = document.createElement('div');
        lokasiDiv.innerHTML = `
          <h3>📍 Lokasi Kamu</h3>
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lon}</p>
        `;
        document.getElementById('info').innerHTML = '';
        document.getElementById('info').appendChild(lokasiDiv);

        // Tampilkan peta
        const map = L.map('map').setView([lat, lon], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Marker posisi pengguna
        L.marker([lat, lon]).addTo(map)
          .bindPopup('Kamu di sini 😎')
          .openPopup();

        // Marker tujuan
        L.marker([tujuan[1], tujuan[0]]).addTo(map)
          .bindPopup('Tujuan 🎯');

        try {
          const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking', {
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

          const data = await response.json();
          const waktu = data.routes[0].summary.duration / 60; // menit

          const waktuDiv = document.createElement('div');
          waktuDiv.innerHTML = `<p>🕒 Estimasi waktu jalan kaki: ${waktu.toFixed(1)} menit</p>`;
          document.getElementById('info').appendChild(waktuDiv);

          // Gambar rute
          const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
          map.fitBounds(routeLine.getBounds());

        } catch (error) {
          alert('Gagal menghitung rute: ' + error.message);
        }
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      }
    );
  } else {
    alert("Geolocation tidak didukung di browser ini.");
  }
});
