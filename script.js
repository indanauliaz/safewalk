document.getElementById('startBtn').addEventListener('click', function () {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Buat elemen lokasi muncul di halaman
        const lokasiDiv = document.createElement('div');
        lokasiDiv.innerHTML = `
          <h3>📍 Lokasi Kamu</h3>
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lon}</p>
        `;
        document.body.appendChild(lokasiDiv);
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      }
    );
  } else {
    alert("Geolocation tidak didukung di browser ini.");
  }
});
