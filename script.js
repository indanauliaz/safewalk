document.addEventListener('DOMContentLoaded', () => {
  const apiKey = '5b3ce3597851110001cf6248947756bf8fdb49fba7ecaed05516ff31';

  document.getElementById('startBtn').addEventListener('click', function () {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const infoDiv = document.getElementById('info');
          infoDiv.innerHTML = `
            <h3>📍 Lokasi Kamu</h3>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lon}</p>
            <p><i>Klik lokasi tujuan di peta</i></p>
          `;

          if (window.map) {
            window.map.remove();
          }

          // Delay untuk memastikan DOM map siap
          setTimeout(() => {
            const map = L.map('map').setView([lat, lon], 16);
            window.map = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
              .bindPopup('Kamu di sini 😎')
              .openPopup();

            let tujuanMarker;
            let routeLine;

            map.on('click', async function (e) {
              const tujuanLat = e.latlng.lat;
              const tujuanLon = e.latlng.lng;

              if (tujuanMarker) map.removeLayer(tujuanMarker);
              if (routeLine) map.removeLayer(routeLine);

              tujuanMarker = L.marker([tujuanLat, tujuanLon]).addTo(map)
                .bindPopup('Tujuan 🎯')
                .openPopup();

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
                      [tujuanLon, tujuanLat]
                    ]
                  })
                });

                const data = await response.json();

                if (!data.routes || !data.routes[0]) {
                  throw new Error('Route tidak ditemukan');
                }

                const waktu = data.routes[0].summary.duration / 60;
                const waktuDiv = document.createElement('div');
                waktuDiv.innerHTML = `<p>🕒 Estimasi waktu jalan kaki: ${waktu.toFixed(1)} menit</p>`;
                infoDiv.appendChild(waktuDiv);

                const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
                map.fitBounds(routeLine.getBounds());
              } catch (error) {
                alert('Gagal menghitung rute: ' + error.message);
              }
            });
          }, 500);
        },
        (error) => {
          alert("Gagal mendapatkan lokasi: " + error.message);
        }
      );
    } else {
      alert("Geolocation tidak didukung di browser ini.");
    }
  });
});
