import fetch from 'node-fetch'
import logger from './logger.js'

const queryParams = {
  username: "voteremote",
  maxRows: 10,
  country: "US",
  // featureclasses: "A,P" // TODO: make this more specific feature codes
  featureCode: ['ADM1', 'ADM2', 'ADM3', 'PPLA2']
};
const urlBase = "http://api.geonames.org/searchJSON";
async function getGeonames(q) {
    try {
      var params = {
        q,
        ...queryParams
      }
      var esc = encodeURIComponent;
      var query = Object.keys(params)
          .map(k => {
            if (Array.isArray(params[k])) {
              return params[k].map(v => esc(k) + '=' + esc(v)).join('&');
            } else {
              return esc(k) + '=' + esc(params[k]);
            }
          })
          .join('&');
      let url = urlBase + '?' + query;
      logger.info("Getting GeoName URL: %s", url);
      let response = await fetch(url);
      let responseJson = await response.json();
      let data = responseJson.geonames.map(result => {
        let data = {
          name: result.name,
          geonameId: result.geonameId,
          lng: result.lng,
          lat: result.lat,
          state: result.adminName1,
          stateCode: result.adminCode1
        };
        if (data.state == 'District of Columbia') {
          data.state = 'Washington DC';
          data.county = 'Washington DC';
        }
        return data;
      });
      return {status: "success", data};
    }
    catch (err) {
      logger.error("Error getting CSV data: %s", err);
      return {status: "error", message: err};
    }
}

async function queryLatLng(db, lat, lng) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  // let postalcode = 53208;

  let result = await db.collection('postalcodes').findOne({
    center: {$near: {
      $geometry: {type: "Point", coordinates: [lng, lat]}, 
      $maxDistance: 10000
    }}
  });
  if (result) {
    let data = {
      name: result["place name"],
      lng: result.longitude,
      lat: result.latitude,
      state: result["admin name1"],
      stateCode: result["admin code1"],
      county: result["admin name2"]
    };
    if (data.state == 'District of Columbia') {
      data.state = 'Washington DC';
      data.county = 'Washington DC';
    }
    return {
      status: "success",
      data: [ data ]
    };
  } else {
    return {
      status: "error", message: "no result"
    };
  }
}

async function getPostalcode(db, postalcode) {
  postalcode = parseInt(postalcode);
    let result = await db.collection('postalcodes').findOne({"postal code": postalcode});
    if (result) {
      let data = {
        name: result["place name"],
        lng: result.longitude,
        lat: result.latitude,
        state: result["admin name1"],
        stateCode: result["admin code1"],
        county: result["admin name2"]
      };
      if (data.state == 'District of Columbia') {
        data.state = 'Washington DC';
        data.county = 'Washington DC';
      }
      return {
        status: "success",
        data: [ data ]
      };
    } else {
      return {
        status: "error", message: "no result"
      };
    }
}

function isPostalcode(q) {
  // Determine if the q is a 5 digit number
  return (!isNaN(parseInt(q)) && q.length == 5);
}

async function get(db, q) {
  if (isPostalcode(q)) {
    return getPostalcode(db, q);
  } else {
    return getGeonames(q);
  }
}

export { getGeonames, queryLatLng, getPostalcode, isPostalcode, get };
export default get
