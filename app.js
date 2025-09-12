// app.js
document.addEventListener('DOMContentLoaded', () => {
  /* Index login/register UI (index.html) */
  const roleButtons = document.querySelectorAll('.role-btn');
  const formContainer = document.getElementById('formContainer');
  const formTitle = document.getElementById('formTitle');
  const roleForm = document.getElementById('roleForm');
  const switchLink = document.getElementById('switchLink');
  const passwordInfo = document.getElementById('passwordInfo');

  let currentRole = '';
  let isLogin = true;

  const fields = {
    Customer: [{ name: 'email', type: 'email', placeholder: 'Email' }, { name: 'password', type: 'password', placeholder: 'Password' }],
    CustomerRegister: [{ name: 'name', type: 'text', placeholder: 'Full Name' }, { name: 'email', type: 'email', placeholder: 'Email' }, { name: 'phone', type: 'tel', placeholder: 'Phone Number' }, { name: 'password', type: 'password', placeholder: 'Password' }],
    Vendor: [{ name: 'email', type: 'email', placeholder: 'Email' }, { name: 'password', type: 'password', placeholder: 'Password' }],
    VendorRegister: [{ name: 'businessName', type: 'text', placeholder: 'Business Name' }, { name: 'ownerName', type: 'text', placeholder: 'Owner Name' }, { name: 'email', type: 'email', placeholder: 'Email' }, { name: 'phone', type: 'tel', placeholder: 'Phone Number' }, { name: 'businessType', type: 'text', placeholder: 'Business Type' }, { name: 'password', type: 'password', placeholder: 'Password' }],
    Driver: [{ name: 'email', type: 'email', placeholder: 'Email' }, { name: 'password', type: 'password', placeholder: 'Password' }],
    DriverRegister: [{ name: 'name', type: 'text', placeholder: 'Full Name' }, { name: 'email', type: 'email', placeholder: 'Email' }, { name: 'phone', type: 'tel', placeholder: 'Phone Number' }, { name: 'vehicleType', type: 'text', placeholder: 'Vehicle Type' }, { name: 'vehicleNumber', type: 'text', placeholder: 'Vehicle Number' }, { name: 'password', type: 'password', placeholder: 'Password' }]
  };

  function checkPasswordStrength(pw) {
    if (!pw || pw.length < 8) return { ok: false, msg: 'At least 8 characters' };
    if (!/[A-Z]/.test(pw)) return { ok: false, msg: 'Include at least 1 uppercase letter' };
    if (!/[a-z]/.test(pw)) return { ok: false, msg: 'Include at least 1 lowercase letter' };
    if (!/[0-9]/.test(pw)) return { ok: false, msg: 'Include at least 1 number' };
    if (!/[\W_]/.test(pw)) return { ok: false, msg: 'Include at least 1 special character' };
    return { ok: true, msg: 'Strong password ✅' };
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('napoUsers') || '[]'); } catch { return []; }
  }
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
    passwordInfo.textContent = isLogin ? '' : 'Password must be at least 8 characters, include uppercase, lowercase, number and special character.';
    // show live validation for password on register form
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
      if (!data.email || !data.password) {
        alert('Email and password required');
        return;
      }
      if (isLogin) {
        const users = getUsers();
        const u = users.find(x => x.email === data.email && x.password === data.password && x.role === currentRole);
        if (!u) {
          alert('Invalid credentials for ' + currentRole);
          return;
        }
        localStorage.setItem('napoLoggedIn', JSON.stringify(u));
        if (Notification.permission !== 'granted') Notification.requestPermission();
        if (currentRole === 'Customer') window.location.href = 'customer.html';
        else if (currentRole === 'Vendor') window.location.href = 'vendor.html';
        else window.location.href = 'driver.html';
      } else {
        const pwCheck = checkPasswordStrength(data.password);
        if (!pwCheck.ok) { alert(pwCheck.msg); return; }
        const users = getUsers();
        if (users.find(x => x.email === data.email && x.role === currentRole)) { alert('Email already registered for this role'); return; }
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

  /* Dashboards maps + interactions for customer.html, vendor.html, driver.html */
  const roleOnPage = document.body.getAttribute('data-role') || document.querySelector('[data-role]') && document.querySelector('[data-role]').getAttribute('data-role');

  if (roleOnPage) {
    if (Notification.permission !== 'granted') Notification.requestPermission();
  }

  // utility to create map using google.maps API (pages load Google Maps script with callbacks)
  function placeMarker(map, latLng, title, icon) {
    return new google.maps.Marker({ position: latLng, map: map, title: title, icon: icon || null });
  }

  // simulation helpers
  function simulateDriverMovement(marker, path, speed = 0.00005) {
    let i = 0;
    const id = setInterval(() => {
      if (i >= path.length) { clearInterval(id); return; }
      marker.setPosition(path[i]);
      i++;
    }, 500);
    return id;
  }

  // global small store for simulated drivers/orders
  if (!localStorage.getItem('napoSim')) {
    const sim = { drivers: [] };
    localStorage.setItem('napoSim', JSON.stringify(sim));
  }

  // expose callbacks for maps (customer/vendor/driver) - these names match the script callbacks in your HTML
  window.initCustomerMap = function initCustomerMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    const map = new google.maps.Map(mapEl, { center: { lat: -26.2041, lng: 28.0473 }, zoom: 13 });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setCenter({ lat, lng });
        const customerMarker = placeMarker(map, { lat, lng }, 'You are here');
        // show nearby drivers (simulated)
        const sim = JSON.parse(localStorage.getItem('napoSim') || '{}');
        sim.drivers = sim.drivers.length ? sim.drivers : [
          { id: 'd1', lat: lat + 0.006, lng: lng + 0.006 },
          { id: 'd2', lat: lat - 0.005, lng: lng - 0.007 }
        ];
        sim.drivers.forEach(d => {
          placeMarker(map, { lat: d.lat, lng: d.lng }, 'Driver', 'https://img.icons8.com/color/48/taxi.png');
        });
        localStorage.setItem('napoSim', JSON.stringify(sim));
      }, () => {
        // fallback
      });
    }
    // request button binding
    const reqBtn = document.getElementById('requestRideBtn');
    if (reqBtn) {
      reqBtn.addEventListener('click', () => {
        const pickup = prompt('Pickup address or current location? (leave blank for current)');
        const dropoff = prompt('Dropoff address (street / place)');
        if (!dropoff && !pickup) { alert('Please provide dropoff; using simulated request'); }
        alert('Request sent — searching for driver...');
        if (Notification.permission === 'granted') new Notification('Request Sent', { body: 'Finding drivers near you...' });
        // simulate driver assigned and moving
        setTimeout(() => {
          if (Notification.permission === 'granted') new Notification('Driver Assigned', { body: 'Thabo is 3 mins away' });
          alert('Driver Thabo assigned - arriving soon');
        }, 1800);
      });
    }
  };

  window.initVendorMap = function initVendorMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    const map = new google.maps.Map(mapEl, { center: { lat: -26.2041, lng: 28.0473 }, zoom: 13 });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setCenter({ lat, lng });
        placeMarker(map, { lat, lng }, 'Your Shop');
        // simulate active deliveries markers
        placeMarker(map, { lat: lat + 0.004, lng: lng + 0.004 }, 'Driver delivering', 'https://img.icons8.com/color/48/delivery-scooter.png');
      });
    }
    // Accept Order buttons: when clicked, notify driver simulation
    document.querySelectorAll('.order-card button').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        alert('Order accepted. Assigning driver...');
        if (Notification.permission === 'granted') new Notification('Order Accepted', { body: 'Driver is on the way to your shop.' });
      });
    });
  };

  window.initDriverMap = function initDriverMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    const map = new google.maps.Map(mapEl, { center: { lat: -26.2041, lng: 28.0473 }, zoom: 13 });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setCenter({ lat, lng });
        const driverMarker = placeMarker(map, { lat, lng }, 'You (Driver)', 'https://img.icons8.com/color/48/car.png');
        // Accept Ride/Delivery buttons on driver page
        document.querySelectorAll('.job-card button').forEach(btn => {
          btn.addEventListener('click', () => {
            const text = btn.textContent || '';
            const isRide = /Ride/i.test(text);
            const isDelivery = /Delivery|Deliver/i.test(text);
            if (isRide) {
              alert('Ride accepted. Navigate to pickup.');
              if (Notification.permission === 'granted') new Notification('Ride Accepted', { body: 'Navigate to pickup location.' });
              // simulate route: move marker a bit
              const path = [
                { lat: lat + 0.001, lng: lng + 0.001 },
                { lat: lat + 0.002, lng: lng + 0.002 },
                { lat: lat + 0.003, lng: lng + 0.002 }
              ];
              simulateDriverMovement(driverMarker, path);
            } else if (isDelivery) {
              alert('Delivery accepted. Navigate to vendor.');
              if (Notification.permission === 'granted') new Notification('Delivery Accepted', { body: 'Pickup at vendor.' });
              const path = [
                { lat: lat - 0.001, lng: lng - 0.001 },
                { lat: lat - 0.002, lng: lng - 0.002 }
              ];
              simulateDriverMovement(driverMarker, path);
            } else {
              alert('Job accepted');
            }
          });
        });
      }, () => {
        // fallback
      });
    }
  };

  // If maps script loads with a generic callback name, attempt to init based on page role
  window.initMap = function initMap() {
    const role = document.body.getAttribute('data-role') || '';
    if (role === 'Customer') initCustomerMap();
    else if (role === 'Vendor') initVendorMap();
    else if (role === 'Driver') initDriverMap();
  };

  if (Notification.permission !== 'granted') Notification.requestPermission();
});
