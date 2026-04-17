require("@babel/polyfill");
var $dkp8r$axios = require("axios");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

const $1ffd0b75626d4ce1$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const $1ffd0b75626d4ce1$export$de026b00723010c1 = (type, message)=>{
    $1ffd0b75626d4ce1$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${message}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout($1ffd0b75626d4ce1$export$516836c6a9dfc573, 5000);
};


const $b42f84c6bf2b262c$var$mapBox = document.getElementById('map');
if ($b42f84c6bf2b262c$var$mapBox) {
    const locations = JSON.parse($b42f84c6bf2b262c$var$mapBox.dataset.locations);
    const accessToken = window.MAPBOX_ACCESS_TOKEN;
    if (!accessToken) throw new Error('Missing Mapbox access token');
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((location)=>{
        const el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(location.coordinates).addTo(map);
        new mapboxgl.Popup({
            offset: 30,
            closeOnClick: false
        }).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`).addTo(map);
        bounds.extend(location.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 50,
            right: 50
        }
    });
}



const $e01bdb29534f73e4$var$login = async (email, password)=>{
    try {
        const res = await (0, ($parcel$interopDefault($dkp8r$axios)))({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === 'success') {
            window.alert('Logged in successfully!');
            window.setTimeout(()=>{
                window.location.assign('/');
            }, 1000);
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
        window.alert(message);
    }
};
const $e01bdb29534f73e4$var$loginForm = document.querySelector('.form--login');
if ($e01bdb29534f73e4$var$loginForm) $e01bdb29534f73e4$var$loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    $e01bdb29534f73e4$var$login(email, password);
});




const $026a55a7caf13cae$var$logout = async ()=>{
    try {
        const res = await (0, ($parcel$interopDefault($dkp8r$axios)))({
            method: 'GET',
            url: '/api/v1/users/logout',
            withCredentials: true
        });
        if (res.data.status === 'success') {
            (0, $1ffd0b75626d4ce1$export$de026b00723010c1)('success', 'Logged out successfully!');
            window.setTimeout(()=>{
                window.location.reload();
            }, 1000);
        }
    } catch (err) {
        (0, $1ffd0b75626d4ce1$export$de026b00723010c1)('error', 'Error logging out. Try again.');
    }
};
document.addEventListener('click', (e)=>{
    const logoutBtn = e.target.closest('.nav__el--logout');
    if (!logoutBtn) return;
    e.preventDefault();
    $026a55a7caf13cae$var$logout();
});




