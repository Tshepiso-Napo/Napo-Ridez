document.addEventListener('DOMContentLoaded', () => {

  // LOGIN / REGISTRATION UI
  const roleButtons = document.querySelectorAll('.role-btn');
  const formContainer = document.getElementById('formContainer');
  const formTitle = document.getElementById('formTitle');
  const roleForm = document.getElementById('roleForm');
  const switchLink = document.getElementById('switchLink');
  const passwordInfo = document.getElementById('passwordInfo');

  let currentRole = '';
  let isLogin = true;

  const fields = {
    Customer: [
      { name: 'email', type: 'email', placeholder: 'Email' },
      { name: 'password', type: 'password', placeholder: 'Password' }
    ],
    CustomerRegister: [
      { name: 'name', type: 'text', placeholder: 'Full Name' },
      { name: 'email', type: 'email', placeholder: 'Email' },
      { name: 'phone', type: 'tel', placeholder: 'Phone Number' },
      { name: 'password', type: 'password', placeholder: 'Password' }
    ],
    Vendor: [
      { name: 'email', type: 'email', placeholder: 'Email' },
      { name: 'password', type: 'password', placeholder: 'Password' }
    ],
    VendorRegister: [
      { name: 'businessName', type: 'text', placeholder: 'Business Name' },
      { name: 'ownerName', type: 'text', placeholder: 'Owner Name' },
      { name: 'email', type: 'email', placeholder: 'Email' },
      { name: 'phone', type: 'tel', placeholder: 'Phone Number' },
      { name: 'businessType', type: 'text', placeholder: 'Business Type' },
      { name: 'password', type: 'password', placeholder: 'Password' }
    ],
    Driver: [
      { name: 'email', type: 'email', placeholder: 'Email' },
      { name: 'password', type: 'password', placeholder: 'Password' }
    ],
    DriverRegister: [
      { name: 'name', type: 'text', placeholder: 'Full Name' },
      { name: 'email', type: 'email', placeholder: 'Email' },
      { name: 'phone', type: 'tel', placeholder: 'Phone Number' },
      { name: 'vehicleType', type: 'text', placeholder: 'Vehicle Type' },
      { name: 'vehicleNumber', type: 'text', placeholder: 'Vehicle Number' },
      { name: 'password', type: 'password', placeholder: 'Password' }
    ]
  };

  function checkPasswordStrength(pw) {
    if (!pw || pw.length < 8) return { ok: false, msg: 'At least 8 characters' };
    if (!/[A-Z]/.test(pw)) return { ok: false, msg: 'Include uppercase letter' };
    if (!/[a-z]/.test(pw)) return { ok: false, msg: 'Include lowercase letter' };
    if (!/[0-9]/.test(pw)) return { ok: false, msg: 'Include number' };
    if (!/[\W_]/.test(pw)) return { ok: false, msg: 'Include special character' };
    return { ok: true, msg: 'Strong password ✅' };
  }

  function getUsers() { try { return JSON.parse(localStorage.getItem('napoUsers') || '[]'); } catch { return []; } }
  function saveUsers(users) { localStorage.setItem('napoUsers', JSON.stringify(users)); }

  function renderForm() {
    roleForm.innerHTML = '';
    const key = currentRole + (isLogin ? '' : 'Register');
    (fields[key] || []).forEach(field => {
      const input = document.createElement('input');
      input.name = field.name;
      input.type = field.type;
      input.placeholder = field.placeholder;
      input.required = true;
      roleForm.appendChild(input);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = isLogin ? 'Login' : 'Register';
    roleForm.appendChild(submitBtn);

    formTitle.textContent = isLogin ? `${currentRole} Login` : `${currentRole} Registration`;
    switchLink.textContent = isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login";
    passwordInfo.textContent = isLogin ? '' : 'Password must be 8+ chars, uppercase, lowercase, number & special char';

    const pwd = roleForm.querySelector('input[name="password"]');
    if (pwd && !isLogin) {
      const feedback = document.createElement('div');
      feedback.style.fontSize = '0.9rem';
      feedback.style.color = '#555';
      roleForm.insertBefore(feedback, submitBtn);
      pwd.addEventListener('input', () => {
        const res = checkPasswordStrength(pwd.value);
        feedback.textContent = res.msg;
        feedback.style.color = res.ok ? 'green' : '#b00';
      });
    }
  }

  if (roleButtons.length && formContainer && roleForm && switchLink) {
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        currentRole = btn.getAttribute('data-role');
        isLogin = true;
        renderForm();
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({ behavior: 'smooth' });
      });
    });

    switchLink.addEventListener('click', () => {
      isLogin = !isLogin;
      renderForm();
    });

    roleForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = {};
      new FormData(roleForm).forEach((v, k) => data[k] = v.trim());
      if (!data.email || !data.password) { alert('Email & password required'); return; }

      if (isLogin) {
        const users = getUsers();
        const u = users.find(x => x.email === data.email && x.password === data.password && x.role === currentRole);
        if (!u) { alert('Invalid credentials'); return; }
        localStorage.setItem('napoLoggedIn', JSON.stringify(u));
        if (currentRole === 'Customer') window.location.href = 'customer.html';
        else if (currentRole === 'Vendor') window.location.href = 'vendor.html';
        else window.location.href = 'driver.html';
      } else {
        const pwCheck = checkPasswordStrength(data.password);
        if (!pwCheck.ok) { alert(pwCheck.msg); return; }
        const users = getUsers();
        if (users.find(x => x.email === data.email && x.role === currentRole)) { alert('Email already exists'); return; }
        const user = Object.assign({ role: currentRole, createdAt: Date.now() }, data);
        users.push(user);
        saveUsers(users);
        localStorage.setItem('napoLoggedIn', JSON.stringify(user));
        alert('Registration successful');
        if (currentRole === 'Customer') window.location.href = 'customer.html';
        else if (currentRole === 'Vendor') window.location.href = 'vendor.html';
        else window.location.href = 'driver.html';
      }
    });
  }

  const roleOnPage = document.body.getAttribute('data-role') || '';
  if (Notification.permission !== 'granted') Notification.requestPermission();

  // Google Maps Utility
  function placeMarker(map, latLng, title, icon) {
    return new google.maps.Marker({ position: latLng, map: map, title, icon: icon || null });
  }

  function simulateDriver(marker, path) {
    let i = 0;
    const id = setInterval(() => {
      if (i >= path.length) { clearInterval(id); return; }
      marker.setPosition(path[i]);
      i++;
    }, 1000);
  }

  // Customer map
  window.initCustomerMap = function () {
    const mapEl = document.getElementById('map'); if (!mapEl) return;
    const map = new google.maps.Map(mapEl, { center: { lat: -26.2041, lng: 28.0473 }, zoom: 13 });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setCenter({ lat, lng });
        placeMarker(map, { lat, lng }, 'You are here');

        fetch('http://localhost:3000/get-rides')
          .then(res => res.json())
          .then(rides => {
            rides.filter(r => r.status === 'accepted').forEach((r, idx) => {
              const marker = placeMarker(map, { lat: lat + 0.005 + idx*0.001, lng: lng + 0.005 + idx*0.001 }, `Driver: ${r.driver}`, 'https://img.icons8.com/color/48/taxi.png');
              const path = [
                { lat: lat + 0.005 + idx*0.001, lng: lng + 0.005 + idx*0.001 },
                { lat, lng }
              ];
              simulateDriver(marker, path);
            });
          });
      });
    }

    const reqBtn = document.getElementById('requestRideBtn');
    if (reqBtn) reqBtn.addEventListener('click', () => {
      const pickup = prompt('Pickup address? (leave blank for current)');
      const dropoff = prompt('Dropoff address');
      alert('Ride request sent — finding driver...');
    });
  };

  // Vendor map
  window.initVendorMap = function () {
    const mapEl = document.getElementById('map'); if (!mapEl) return;
    const map = new google.maps.Map(mapEl, { center: { lat: -26.2041, lng: 28.0473 }, zoom: 13 });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setCenter({ lat, lng });
        placeMarker(map, { lat, lng }, 'Your Shop');

        fetch('http://localhost:3000/get-rides')
          .then(res => res.json())
          .then(rides => {
            rides.filter(r => r.status === 'accepted').forEach((r, idx) => {
              const marker = placeMarker(map, { lat: lat + 0.004 + idx*0.001, lng: lng + 0.004 + idx*0.001 }, `Driver: ${r.driver}`, 'https://img.icons8.com/color/48/delivery-scooter.png');
              const path = [
                { lat: lat + 0.004 + idx*0.001, lng: lng + 0.004 + idx*0.001 },
                { lat, lng }
              ];
              simulateDriver(marker, path);
            });
          });
      });
    }

    document.querySelectorAll('.order-card button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderCard = btn.closest('.order-card');
        const rideId = parseInt(orderCard.dataset.orderId || 0, 10);
        const res = await fetch('http://localhost:3000/accept-ride', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverName: 'Thabo', rideId })
        });
        const data = await res.json();
        if (res.ok) alert(`Order #${rideId} accepted. Driver is on the way!`);
        else alert(`Error: ${data.error}`);
      });
    });
  };

  // Driver map
  window.initDriverMap = function () {
    const mapEl = document.getElementById('map'); if (!mapEl) return;
    const map = new google.maps.Map(mapEl, { center: { lat: -26.2041, lng: 28.0473 }, zoom: 13 });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setCenter({ lat, lng });
        const driverMarker = placeMarker(map, { lat, lng }, 'You (Driver)', 'https://img.icons8.com/color/48/car.png');

        document.querySelectorAll('.job-card button').forEach(btn => {
          btn.addEventListener('click', () => {
            const text = btn.textContent || '';
            const isRide = /Ride/i.test(text);
            const isDelivery = /Delivery|Deliver/i.test(text);

            if (isRide || isDelivery) {
              alert(`${isRide ? 'Ride' : 'Delivery'} accepted`);
              const path = isRide ? [
                { lat: lat + 0.001, lng: lng + 0.001 },
                { lat: lat + 0.002, lng: lng + 0.002 }
              ] : [
                { lat: lat - 0.001, lng: lng - 0.001 },
                { lat: lat - 0.002, lng: lng - 0.002 }
              ];
              simulateDriver(driverMarker, path);
            }
          });
        });
      });
    }
  };

  window.initMap = function () {
    const role = document.body.getAttribute('data-role') || '';
    if (role === 'Customer') initCustomerMap();
    else if (role === 'Vendor') initVendorMap();
    else if (role === 'Driver') initDriverMap();
  };
});
