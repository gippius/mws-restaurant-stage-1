let restaurants;
let neighborhoods;
let cuisines;

var newMap;
var markers = [];

const IDB_NAME = "restaurants-review";
const IDB_STORE_NAME = "restaurants";

/* Thanks, Jake!
 * https://github.com/jakearchibald/idb/
 */
let idb = self.idb;

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();
  registerIDB();

  initMap(); // added 

  // Retrieving data from cache
  fetchNeighborhoodsAndCuisinesFromCache();

  // Fetching data from cache
  fetchNeighborhoods();
  fetchCuisines();
});

function fetchNeighborhoodsAndCuisinesFromCache() {
  dbPromise.then((db) => {
    var tx = db.transaction(IDB_STORE_NAME);
    var store = tx.objectStore(IDB_STORE_NAME);

    return store.getAll();
  })
    .then(res => {
      const neighborhoods = res.map((v, i) => res[i].neighborhood);
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

      self.neighborhoods = uniqueNeighborhoods;
      console.log('Cusines list pulled from cache!');
      console.log(self.neighborhoods);

      const cuisines = res.map((v, i) => res[i].cuisine_type);
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

      self.cuisines = uniqueCuisines;
      console.log('Cuisines list pulled from cache!');
      console.log(self.cuisines);

      fillNeighborhoodsHTML();
      fillCuisinesHTML();
    })
}

function registerIDB() {
  console.log('registering IDB');

  self.dbPromise = idb.open(IDB_NAME, 1, upgradeDb => {
    var store = upgradeDb.createObjectStore(IDB_STORE_NAME);
  });

  /*
  dbPromise.then((db) => {
    var tx = db.transaction(IDB_STORE_NAME);
    var store = tx.objectStore(IDB_STORE_NAME);

    return store.openCursor();
  }).then(function loopResults(cursor) {
    if (!cursor) {
      return;
    }
    //console.log('cursored at: ', cursor.key);
    return cursor.continue().then(loopResults);
  }).then(() => {
    //console.log('Done')
  })
  */
}

const registerServiceWorker = function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {})
      .then(function (reg) {
        console.log('Registration succeeded. Scope is ' + reg.scope);
      })
      .catch(function (error) {
        console.log('Registration failed with ' + error);
      });
  }
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods()
    .then((res, error) => {
      if (error) {
        console.error('Cannot fetch data!')
        console.error(error);
      } else {
        self.neighborhoods = res;
        fillNeighborhoodsHTML();
      }
    })
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  // resetting current dropdown
  select.innerHTML = '';

  // creating initial option
  const initialOption = document.createElement('option');
  initialOption.innerText = 'All Neighbourhoods'
  initialOption.value = 'all';
  select.append(initialOption);

  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  // resetting current dropdown
  select.innerHTML = '';

  // creating initial option
  const initialOption = document.createElement('option');
  initialOption.innerText = 'All Cuisines'
  initialOption.value = 'all';
  select.append(initialOption);

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines()
    .then((res, error) => {
      if (error) {
        console.error('Cannot fetch data!')
        console.error(error);
      } else {
        self.cuisines = res;
        fillCuisinesHTML();
      }
    })
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibWFyd3luMTIiLCJhIjoiY2ppeXoybXdlMDFtNzN2cWV6dXp6bG1tdiJ9._CtokLoKmoypqq2JefcixQ',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  fetchRestaurantByCuisineAndNeighborhoodFromCache(cuisine, neighborhood);

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(res => {
      resetRestaurants(res);
      fillRestaurantsHTML();
    })
    .catch(err => {
      console.error('Error on fetching data!');
      console.error(err);
    })
}

// Fetching restaurants data from IDB
function fetchRestaurantByCuisineAndNeighborhoodFromCache(cuisine, neighborhood) {
  console.log('Updating view using idb cache..');
  dbPromise.then((db) => {
    var tx = db.transaction(IDB_STORE_NAME);
    var store = tx.objectStore(IDB_STORE_NAME);

    return store.getAll();
  })
    .then(res => {
      let result = res;

      if (cuisine !== 'all') {
        result = result.filter(r => r.cuisine_type === cuisine);
      }

      if (neighborhood !== 'all') {
        result = result.filter(r => r.neighborhood === neighborhood);
      }

      resetRestaurants(result);
      fillRestaurantsHTML();
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  console.trace(restaurants)
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute('aria-label', 'restaurant info');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `picture of ${restaurant.name}`;
  image.setAttribute('tabindex', '0');
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('role', 'button');

  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

