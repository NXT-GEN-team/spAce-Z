const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // Load .env file

const NASA_API_KEY = process.env.NASA_API_KEY;

const admin = require('../firebaseConfig');

function checkAuth(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(decoded => {
      req.user = decoded;
      next();
    })
    .catch(() => res.redirect('/login'));
}


router.get('/', (req, res) => {
  const sessionCookie = req.cookies?.session;
  if (!sessionCookie) return res.render('homepage', { user: null });

  const admin = require('../firebaseConfig');
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then((decoded) => {
      res.render('homepage', { user: decoded });
    })
    .catch(() => {
      res.render('homepage', { user: null });
    });
});


router.get('/astro', checkAuth, (req, res) => {
  res.render('astro/index');
});

router.get('/space-objects', checkAuth, (req, res) => {
  res.render('space-objects');
});

router.get('/missions', checkAuth, (req, res) => {
  res.render('missions/index');
});

router.get('/research', checkAuth, (req, res) => {
  res.render('research/index');
});



// apod
router.get('/astro/apod', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`);
    
    if (!response.data) {
      throw new Error('No data received from NASA API');
    }
    
    res.render('astro/apod', { 
      apod: response.data,
      error: null
    });
  } catch (err) {
    console.error("Failed to fetch APOD:", err.message);
    res.render('astro/apod', { 
      apod: null,
      error: "Failed to fetch Astronomy Picture of the Day. Please try again later."
    });
  }
});

// epic
router.get('/astro/epic', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0]; // today's date by default

    // Get image metadata for that date
    const response = await axios.get(`https://api.nasa.gov/EPIC/api/natural/date/${date}?api_key=${NASA_API_KEY}`);
    const imageData = response.data;

    if (!imageData || imageData.length === 0) {
      return res.render('astro/epic', {
        images: [],
        message: "No EPIC images available for today.",
        error: null
      });
    }

    // Build full image URLs
    const formattedImages = imageData.slice(0, 5).map(img => {
      const dateParts = img.date.split(" ")[0].split("-");
      const [year, month, day] = dateParts;
      const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${img.image}.jpg`;
      return {
        caption: img.caption,
        date: img.date,
        url: imageUrl
      };
    });

    res.render('astro/epic', {
      images: formattedImages,
      message: null,
      error: null
    });

  } catch (err) {
    console.error("Failed to fetch EPIC images:", err.message);
    res.render('astro/epic', {
      images: [],
      message: null,
      error: "Failed to fetch EPIC images. Please try again later."
    });
  }
});

// nasa image and video library
router.get('/astro/imgvid', async (req, res) => {
  const searchQuery = req.query.q || 'galaxy'; // Default search term if none provided
  try {
    console.log('Searching NASA API with query:', searchQuery);
    
    const apiUrl = new URL('https://images-api.nasa.gov/search');
    apiUrl.searchParams.append('q', searchQuery);
    
    console.log('API URL:', apiUrl.toString());
    
    const response = await axios.get(apiUrl.toString());
    console.log('API Response status:', response.status);
    
    if (!response.data || !response.data.collection || !response.data.collection.items) {
      throw new Error('Invalid response format from NASA API');
    }

    const items = response.data.collection.items;
    console.log('Number of items found:', items.length);

    if (items.length === 0) {
      return res.render('astro/imgvid', {
        query: searchQuery,
        items: [],
        error: null,
        message: `No results found for "${searchQuery}". Try a different search term.`
      });
    }

    const results = items.slice(0, 12).map(item => {
      if (!item.data || !item.data[0]) {
        console.log('Invalid item format:', item);
        return null;
      }
      return {
        data: item.data,
        links: item.links
      };
    }).filter(item => item !== null);

    console.log('Number of processed results:', results.length);

    res.render('astro/imgvid', {
      query: searchQuery,
      items: results,
      error: null,
      message: null
    });

  } catch (err) {
    console.error('NASA Library API error:', err.message);
    console.error('Error details:', err);
    
    let errorMessage = 'Failed to fetch results. Please try again.';
    if (err.response) {
      console.error('API Response error:', err.response.status, err.response.data);
      errorMessage = `API Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`;
    }
    
    res.render('astro/imgvid', {
      query: searchQuery,
      items: [],
      error: errorMessage,
      message: null
    });
  }
});

// neow
router.get('/space-objects/neow', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  try {
    const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed`, {
      params: {
        start_date: date,
        end_date: date,
        api_key: NASA_API_KEY
      }
    });

    const data = response.data.near_earth_objects[date];
    if (!data || data.length === 0) {
      return res.render('space-objects/neow', {
        date,
        asteroids: [],
        error: null
      });
    }

    const asteroids = data.map(asteroid => {
      const approach = asteroid.close_approach_data[0];
      return {
        name: asteroid.name,
        distance: parseFloat(approach.miss_distance.kilometers).toLocaleString(),
        velocity: parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(2),
        problem: asteroid.is_potentially_hazardous_asteroid
          ? "you might be worry about it"
          : "not that big, don't worry"
      };
    });

    res.render('space-objects/neow', {
      date,
      asteroids,
      error: null
    });

  } catch (err) {
    console.error("NeoWs fetch failed:", err.message);
    res.render('space-objects/neow', {
      date,
      asteroids: [],
      error: 'Unable to fetch NEO data. Please try again later.'
    });
  }
});

// donki
router.get('/space-objects/donki', async (req, res) => {
  const start = req.query.start || new Date().toISOString().split('T')[0];
  const end = req.query.end || new Date().toISOString().split('T')[0];

  try {
    const response = await axios.get(`https://api.nasa.gov/DONKI/CME`, {
      params: {
        startDate: start,
        endDate: end,
        api_key: NASA_API_KEY
      }
    });

    const events = response.data;

    res.render('space-objects/donki', {
      start,
      end,
      events,
      error: null
    });

  } catch (err) {
    console.error("Failed to fetch DONKI CME data:", err.message);
    res.render('space-objects/donki', {
      start,
      end,
      events: [],
      error: "Failed to fetch solar event data. Please try again later."
    });
  }
});

// ssc
router.get('/space-objects/ssc', async (req, res) => {
  const { objectId, startTime, endTime, stepSize = '60' } = req.query;

  if (!objectId || !startTime || !endTime) {
    return res.render('space-objects/ssc', {
      objectId: '',
      startTime: '',
      endTime: '',
      stepSize: '60',
      data: null,
      error: null
    });
  }

  try {
    const payload = [{
      "sc.id": [objectId.toLowerCase()],
      startTime: new Date(parseInt(startTime) * 1000).toISOString(),
      endTime: new Date(parseInt(endTime) * 1000).toISOString(),
      resolutionFactor: 1
    }];

    console.log("🔍 Payload being sent to SSCWeb:");
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const satData = response.data?.[0]?.SatelliteData?.[0];

    if (!satData || !satData.SatelliteLocation || satData.SatelliteLocation.length === 0) {
      return res.render('space-objects/ssc', {
        objectId,
        startTime,
        endTime,
        stepSize,
        data: null,
        error: `No position data found for "${objectId}" in that time range.`
      });
    }

    const data = satData.SatelliteLocation.map(loc => ({
      time: new Date(loc.Date).getTime() / 1000,
      position: {
        x: parseFloat(loc.X),
        y: parseFloat(loc.Y),
        z: parseFloat(loc.Z)
      },
      velocity: {
        x: parseFloat(loc.VX || 0),
        y: parseFloat(loc.VY || 0),
        z: parseFloat(loc.VZ || 0)
      }
    }));

    res.render('space-objects/ssc', {
      objectId,
      startTime,
      endTime,
      stepSize,
      data,
      error: null
    });

  } catch (err) {
    console.error("🚨 SSC Fetch Error:");
    console.error(err.response?.data || err.message);
    res.render('space-objects/ssc', {
      objectId,
      startTime,
      endTime,
      stepSize,
      data: null,
      error: "Failed to fetch object data. Check the console for details."
    });
  }
});

// mars
router.get('/missions/mars', async (req, res) => {
  const rover = req.query.rover || 'curiosity';
  const sol = req.query.sol || 1000;

  try {
    const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`, {
      params: {
        sol,
        api_key: process.env.NASA_API_KEY
      }
    });

    const photos = response.data.photos;

    res.render('missions/mars', {
      photos,
      rover,
      sol,
      error: null
    });
  } catch (err) {
    console.error("Mars Rover API Error:", err.message);
    res.render('missions/mars', {
      photos: null,
      rover,
      sol,
      error: "Failed to fetch Mars Rover images. Try again later."
    });
  }
});

// techport
router.get('/missions/techport', async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.render('missions/techport', { project: null, error: null });
  }

  try {
    const response = await axios.get(`https://techport.nasa.gov/api/projects/${id}?api_key=${process.env.NASA_API_KEY}`);
    const project = response.data.project;

    res.render('missions/techport', {
      project,
      error: null
    });
  } catch (err) {
    console.error("TechPort Error:", err.message);
    res.render('missions/techport', {
      project: null,
      error: "Could not fetch TechPort data. Please try again later."
    });
  }
});

// power
router.get('/missions/power', async (req, res) => {
  const lat = parseFloat(req.query.lat) || 0;
  const lon = parseFloat(req.query.lon) || 0;
  const start = req.query.start?.replace(/-/g, '') || '20250101';
  const end = req.query.end?.replace(/-/g, '') || '20250107';

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point`;
  const params = {
    latitude: lat,
    longitude: lon,
    start: start,
    end: end,
    parameters: 'ALLSKY_SFC_SW_DWN,T2M',
    community: 'RE',
    format: 'JSON'
  };

  try {
    const resp = await axios.get(url, { params });
    const json = resp.data.properties.parameter;
    const dates = Object.keys(json.ALLSKY_SFC_SW_DWN);
    res.render('missions/power', { lat, lon, start: req.query.start, end: req.query.end, data: json, dates, error: null });
  } catch (err) {
    console.error('POWER API error:', err.message);
    res.render('missions/power', { lat, lon, start: req.query.start, end: req.query.end, data: null, dates: [], error: 'Failed to fetch POWER data' });
  }
});


// /research/pds route
router.get('/research/pds', async (req, res) => {
  const { query } = req.query;
  let results = [], error = null;

  if (query) {
    const params = {
      q: query,
      wt: 'json',
      rows: 10,
      fl: 'title,target,instrument,investigation_name'
    };

    try {
      const response = await axios.get('https://pds.nasa.gov/services/search/search', { params });
      results = response.data.response.docs;
    } catch (err) {
      console.error('PDS API Error:', err.message);
      error = 'Failed to fetch PDS data. Please try again later.';
    }
  }

  res.render('research/pds', { query, results, error });
});


//exoplanets
router.get('/research/exoplanets', async (req, res) => {
  const { pl_name, hostname, disc_year, disc_method } = req.query;

  const conditions = [];

  if (pl_name) conditions.push(`pl_name LIKE '%${pl_name}%'`);
  if (hostname) conditions.push(`hostname LIKE '%${hostname}%'`);
  if (disc_year) conditions.push(`disc_year = ${disc_year}`);
  if (disc_method) conditions.push(`discoverymethod LIKE '%${disc_method}%'`);

  // Oracle SQL: LIMIT is not allowed, use ROWNUM instead
  conditions.push('ROWNUM <= 20');

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `SELECT pl_name, hostname, disc_year, discoverymethod FROM ps ${whereClause} ORDER BY disc_year DESC`;

  const apiUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`;

  try {
    const response = await axios.get(apiUrl);
    const planets = response.data;
    res.render('research/exoplanets', { planets });
  } catch (err) {
    console.error('Exoplanet API error:', err.message);
    res.render('research/exoplanets', { planets: [], error: 'Failed to fetch exoplanet data.' });
  }
});

const cheerio = require('cheerio');

// HEASARC HTML scraping route
router.get('/research/heasarc', async (req, res) => {
  const { table = 'rosmaster', ra, dec, radius = '0.1' } = req.query;

  console.log("🛰️ HEASARC Route hit with query:", req.query);

  if (!ra || !dec) {
    return res.render('research/heasarc', { results: undefined });
  }

  const queryParams = new URLSearchParams({
    tablehead: `name=${table}`,
    Coordinates: 'Equatorial',
    Entry: `${ra} ${dec}`,
    Radius: radius,
    RadiusUnits: 'deg',
    Fields: 'All',
    format: 'HTML'
  });

  const apiUrl = `https://heasarc.gsfc.nasa.gov/db-perl/W3Browse/w3query.pl?${queryParams.toString()}`;
  console.log("🔗 Requesting:", apiUrl);

  try {
    const response = await axios.get(apiUrl, { timeout: 15000 });
    const $ = cheerio.load(response.data);

    // Extract the first row of data from the HTML response
    const dataCells = $("td#tddata").toArray().map(td => $(td).text().trim().replace(/\s+/g, ' '));

    // Safely extract expected fields by position (manually mapped from postman-output.txt)
    const result = {
      name: dataCells[0] || "Unknown",
      obsid: dataCells[1] || "N/A",
      ra: dataCells[2] || "N/A",
      dec: dataCells[3] || "N/A",
      start: dataCells[4] || "N/A",
      stop: dataCells[5] || "N/A"
    };

    console.log("✅ Extracted result:", result);
    res.render('research/heasarc', { results: [result] });

  } catch (err) {
    console.error("❌ HEASARC HTML parse error:", err.message);
    res.render('research/heasarc', { results: [], error: 'Failed to fetch or parse HEASARC HTML data.' });
  }
});

module.exports = router;
