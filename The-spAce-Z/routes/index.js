const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // Load .env file

const NASA_API_KEY = process.env.NASA_API_KEY;

router.get('/', (req, res) => {
  res.render('homepage');
});

router.get('/astro', (req, res) => {
  res.render('astro/index');
});

router.get('/space-objects', (req, res) => {
  res.render('space-objects');
});

router.get('/missions', (req, res) => {
  res.render('missions/index');
});

router.get('/earth', (req, res) => {
  res.render('earth/index');
});

// earth/modis
router.get('/earth/modis', async (req, res) => {
  const { product, lat, lon, date } = req.query;

  // Render form if no parameters are provided
  if (!product && !lat && !lon && !date) {
    return res.render('earth/modis', {
      product: 'MOD09A1',
      lat: '',
      lon: '',
      date: new Date().toISOString().split('T')[0],
      data: null,
      error: null,
    });
  }

  try {
    // Convert date YYYY-MM-DD to MODIS date format AYyyyDdd
    const startDate = new Date(date);
    const startOfYear = new Date(startDate.getFullYear(), 0, 0);
    const diff = startDate.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const paddedDay = String(dayOfYear).padStart(3, '0');
    const modisDate = `A${startDate.getFullYear()}${paddedDay}`;
    
    const apiUrl = 'https://modis.ornl.gov/cgi-bin/MODIS/global/subset.pl';

    const response = await axios.get(apiUrl, {
      params: {
        product,
        latitude: lat,
        longitude: lon,
        startDate: modisDate,
        endDate: modisDate,
        kmAboveBelow: 1,
        kmLeftRight: 1,
      },
    });

    const responseData = response.data;
    const lines = responseData.split('\n');

    // Check for API-level errors in the response text
    const errorLine = lines.find(line => line.toLowerCase().includes('error'));
    if (errorLine) {
      throw new Error(errorLine);
    }

    // Find the start of the data section
    const dataStartIndex = lines.findIndex(line => line.includes('band,value'));
    if (dataStartIndex === -1) {
      // If no data header, assume no data found
      return res.render('earth/modis', {
        product,
        lat,
        lon,
        date,
        data: { subset: [] }, // To show "No data found" message
        error: null,
      });
    }

    const dataLines = lines.slice(dataStartIndex + 1);
    const subset = [];
    const bandData = {};

    dataLines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(',');
      if (parts.length >= 4) { // x,y,band,value,...
        const band = parts[2].replace(/"/g, '').trim();
        const value = parseFloat(parts[3]);
        if (!isNaN(value)) {
          if (!bandData[band]) {
            bandData[band] = [];
          }
          bandData[band].push(value);
        }
      }
    });

    for (const band in bandData) {
      subset.push({ band, data: bandData[band] });
    }

    res.render('earth/modis', {
      product,
      lat,
      lon,
      date,
      data: { subset },
      error: null,
    });

  } catch (err) {
    console.error('Failed to fetch MODIS data:', err.message);
    res.render('earth/modis', {
      product: product || 'MOD09A1',
      lat: lat || '',
      lon: lon || '',
      date: date || new Date().toISOString().split('T')[0],
      data: null,
      error: `Failed to fetch MODIS data. ${err.message}`,
    });
  }
});

router.get('/research', (req, res) => {
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

  // Initial render without form submitted
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
    const url = `https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations`;
    const params = {
      ids: objectId,
      startTime: `${startTime}`,
      endTime: `${endTime}`,
      stepSize: stepSize
    };

    const response = await axios.get(url, {
      params,
      headers: { Accept: 'application/json' }
    });

    const satData = response.data?.SatelliteData?.[0];

    if (!satData || !satData.SatelliteLocation || satData.SatelliteLocation.length === 0) {
      return res.render('space-objects/ssc', {
        objectId,
        startTime,
        endTime,
        stepSize,
        data: null,
        error: `No position data found for object "${objectId}" in that time range.`
      });
    }

    const data = satData.SatelliteLocation.map(loc => ({
      time: new Date(loc.Date).getTime() / 1000, // Convert to Unix timestamp
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
    console.error("SSC Fetch Error:", err.message);
    res.render('space-objects/ssc', {
      objectId,
      startTime,
      endTime,
      stepSize,
      data: null,
      error: "Failed to fetch object data. Please ensure the object ID and time range are valid."
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

// exo
router.get('/missions/exo', async (req, res) => {
  const year = parseInt(req.query.year) || 2020;

  const baseUrl = 'https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI';
  const params = new URLSearchParams({
    table: 'pscomppars',
    select: 'pl_name,hostname,disc_year,pl_rade,pl_bmasse,st_dist,st_teff',
    where: `disc_year>=${year}`,
    format: 'json'
  });

  try {
    const response = await axios.get(`${baseUrl}?${params.toString()}`);
    // Ensure we have an array of planets
    const planets = Array.isArray(response.data) ? response.data : [];

    res.render('missions/exo', { 
      planets, 
      year, 
      error: null 
    });
  } catch (err) {
    console.error('Exoplanet API Error:', err.message);
    res.render('missions/exo', { 
      planets: [], 
      year, 
      error: 'Failed to fetch Exoplanet data. Try again later.' 
    });
  }
});

// power
router.get('/earth/power', async (req, res) => {
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
    res.render('earth/power', { lat, lon, start: req.query.start, end: req.query.end, data: json, dates, error: null });
  } catch (err) {
    console.error('POWER API error:', err.message);
    res.render('earth/power', { lat, lon, start: req.query.start, end: req.query.end, data: null, dates: [], error: 'Failed to fetch POWER data' });
  }
});

// MODIS Subset Route
router.get('/earth/modis', async (req, res) => {
  const lat = parseFloat(req.query.lat) || 0;
  const lon = parseFloat(req.query.lon) || 0;
  const product = req.query.product || 'MOD13Q1';
  const date = req.query.date || new Date().toISOString().split('T')[0];

  // MODIS Julian format AYYYYDDD
  const d = new Date(date);
  const year = d.getFullYear();
  const start = new Date(year, 0, 0);
  const diff = d - start;
  const j = Math.floor(diff / (1000 * 60 * 60 * 24));
  const modisDate = `A${year}${j.toString().padStart(3, '0')}`;

  const url = `https://modis.ornl.gov/rst/api/v1/${product}/subset`;
  const params = {
    latitude: lat,
    longitude: lon,
    startDate: modisDate,
    endDate: modisDate,
    kmAboveBelow: 1,
    kmLeftRight: 1
  };

  try {
    const response = await axios.get(url, { params });
    res.render('earth/modis', {
      lat, lon, date, product,
      data: response.data,
      error: null
    });
  } catch (err) {
    console.error('MODIS API error:', err.response?.data || err.message);
    res.render('earth/modis', {
      lat, lon, date, product,
      data: null,
      error: 'Failed to fetch MODIS data'
    });
  }
});

// SkyView route
router.get('/earth/skyview', async (req, res) => {
  const target = req.query.target || 'M51';
  const survey = req.query.survey || 'DSS';
  const pixels = req.query.pixels || '600';

  const baseUrl = 'https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl';
  const query = `?Position=${encodeURIComponent(target)}&Survey=${encodeURIComponent(survey)}&Return=URL&Sampler=Clip&Pixels=${pixels},${pixels}&Deedger=Clip&Scaling=Log&Return=PNG`;

  let imageUrl = null;
  let error = null;

  try {
    const response = await axios.get(baseUrl + query);
    const lines = response.data.split('\n');
    const imageLine = lines.find(line => line.trim().endsWith('.png'));
    if (imageLine) {
      imageUrl = imageLine.trim();
    } else {
      error = '❌ No PNG image found. Try a different object/survey.';
    }
  } catch (err) {
    console.error('SkyView fetch error:', err.message);
    error = '🚨 Error fetching SkyView image. Please try again later.';
  }

  res.render('earth/skyview', { target, survey, pixels, imageUrl, error });
});

// /earth/pds route
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


module.exports = router;
