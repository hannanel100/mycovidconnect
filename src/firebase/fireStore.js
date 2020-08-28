/* jshint esversion: 9 */

import firebaseConfig from "./firebase-core";
import { GOOGLE_MAPS_API_KEY } from "../constants";
import CONSTANTS from "./constants";

class FireStore {
  static #FIREBASE_OBJ;
  static #DB;

  /** Initialize Firebase
   *
   * @param {Object.<T>} firebase - Firebase library.
   * @author codecakes
   */
  static firebaseInit(firebase) {
    if (!!window && !!window.firebase && !FireStore.#FIREBASE_OBJ) {
      // eslint-disable-next-line no-undef
      const firebase = window.firebase;
      firebase.initializeApp(firebaseConfig) && firebase.analytics();
      FireStore.#FIREBASE_OBJ = firebase;
      FireStore.#DB = firebase.firestore();
    }
  }

  /**
   * Requested Callback function passed
   *
   * @callback CallBack
   * @param {Object<string|number, Object>}
   */
  /**
   * Fetch all data points of by City.
   *
   * @param {string} cityName - Name of the city.
   * @param {CallBack} mapCallback - callback function to process results on a map.
   */
  static fetchCityData(cityName, mapCallback) {
    const cityNameCollectionPath = CONSTANTS.collectionCityPathFn(cityName);
    const results = [];
    FireStore.#DB
      .collection(cityNameCollectionPath)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((docRef, index) => {
          const docData = docRef.data();
          const hos = JSON.parse(docData.records);
          hos &&
            hos.length &&
            hos.forEach((item) => {
              const name = item.facility_type;
              fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${name}&sensor=true&key=${GOOGLE_MAPS_API_KEY}`
              )
                .then((response) => response.json())
                .then((data) => {
                  results.push(data.results[0]);
                  console.log(results);
                });
            });
        });
      })
      .then(mapCallback(result))
      .catch((error) => console.error(error));
  }
}

export default FireStore;
