/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 5555;
    return `http://127.0.0.1:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    return fetch(DBHelper.DATABASE_URL)
      .then(res => {
        if (!res) {
          throw `Error: ${res.status}, ${res.statusText}`
        } else {
          return res.json();
        }
      })
      .then(res => {
        /*
         * Saving fresh data into IDb
         */
        res.forEach(restaurant => {
          dbPromise.then((db) => {
            var tx = db.transaction(IDB_STORE_NAME, 'readwrite');
            var store = tx.objectStore(IDB_STORE_NAME);
            
            store.put(restaurant, restaurant.id);
            return tx.complete;
          })
            .then(() => { console.log('Restaurant data saved!') })
        })

        return res;
      })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    return fetch(`${DBHelper.DATABASE_URL}/${id}`)
      .then(res => {
        if (!res) {
          throw `Error: ${r.status}, ${r.statusText}`
        } else {
          return res.json();
        }
      })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    return DBHelper.fetchRestaurants()
      .then(res => res.filter(r => r.cuisine_type === cuisine))
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    return DBHelper.fetchRestaurants()
      .then(res => res.filter(r => r.neighborhood === neighborhood))
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    return DBHelper.fetchRestaurants()
      .then(res => {
        let result = res;

        if (cuisine !== 'all') {
          result = result.filter(r => r.cuisine_type === cuisine);
        }

        if (neighborhood !== 'all') {
          result = result.filter(r => r.neighborhood === neighborhood);
        }

        return result;
      })
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    return DBHelper.fetchRestaurants()
      .then(res => {
        const neighborhoods = res.map((v, i) => res[i].neighborhood);
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

        return uniqueNeighborhoods;
      })
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    return DBHelper.fetchRestaurants()
      .then(res => {
        const cuisines = res.map((v, i) => res[i].cuisine_type);
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        return uniqueCuisines;
      })
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      })
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

