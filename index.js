const express = require("express");
const path = require("path");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "goodreads.db");
let db = null;

app.use(cors());
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Database connection successful!");
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3005/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

 


 app.get("/transactions", async (req, res) => {
   
  const { page = 1, perPage = 10, search = '' } = req.query;
  const offset = (page - 1) * perPage;

   //console.log(`Page: ${page}, Per Page: ${perPage}, Search: ${search}`);

  const query = `
    SELECT * FROM data
    WHERE title LIKE ? OR description LIKE ? OR price LIKE ?
    LIMIT ? OFFSET ?
  `;
  const params = [`%${search}%`, `%${search}%`, `%${search}%`, perPage, offset];

  try {
    const rows = await db.all(query, params);  
   // console.log("Data fetched successfully:", rows);  
    res.json(rows); // Send rows as JSON response
  } catch (err) {
   // console.error("Error querying transactions:", err.message);  
    res.status(500).json({ error: err.message });  
  }
});


app.get("/statistics", async (req, res) => {
  const { month } = req.query;

   
  if (!month) {
    return res.status(400).json({ error: "Month is required." });
  }

   
  const monthMap = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
  };

  const monthNumber = monthMap[month];
  
  if (!monthNumber) {
    return res.status(400).json({ error: "Invalid month name." });
  }

  const query = `
    SELECT 
      SUM(price) AS totalSaleAmount,
      COUNT(CASE WHEN sold = 1 THEN 1 END) AS totalSoldItems,
      COUNT(CASE WHEN sold = 0 THEN 1 END) AS totalNotSoldItems
    FROM data
    WHERE strftime('%m', date_of_sale) = ?;
  `;
  
  const params = [monthNumber];

  try {
    const statistics = await db.get(query, params); // Use db.get to fetch a single row
    res.json(statistics);
  } catch (err) {
    console.error("Error fetching statistics:", err.message);
    res.status(500).json({ error: err.message });
  }
});


app.get("/bar-chart-data", async (req, res) => {
  const { month } = req.query;

   
  if (!month) {
    return res.status(400).json({ error: "Month is required." });
  }

   
  const monthMap = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
  };

  const monthNumber = monthMap[month];
  
  if (!monthNumber) {
    return res.status(400).json({ error: "Invalid month name." });
  }

   
  const query = `
    SELECT 
      COUNT(CASE WHEN price BETWEEN 0 AND 100 THEN 1 END) AS '0-100',
      COUNT(CASE WHEN price BETWEEN 101 AND 200 THEN 1 END) AS '101-200',
      COUNT(CASE WHEN price BETWEEN 201 AND 300 THEN 1 END) AS '201-300',
      COUNT(CASE WHEN price BETWEEN 301 AND 400 THEN 1 END) AS '301-400',
      COUNT(CASE WHEN price BETWEEN 401 AND 500 THEN 1 END) AS '401-500',
      COUNT(CASE WHEN price BETWEEN 501 AND 600 THEN 1 END) AS '501-600',
      COUNT(CASE WHEN price BETWEEN 601 AND 700 THEN 1 END) AS '601-700',
      COUNT(CASE WHEN price BETWEEN 701 AND 800 THEN 1 END) AS '701-800',
      COUNT(CASE WHEN price BETWEEN 801 AND 900 THEN 1 END) AS '801-900',
      COUNT(CASE WHEN price > 900 THEN 1 END) AS '901-above'
    FROM data
    WHERE strftime('%m', date_of_sale) = ?;
  `;
  
  const params = [monthNumber];

  try {
    const barChartData = await db.get(query, params);
    res.json(barChartData);
  } catch (err) {
    console.error("Error fetching bar chart data:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// Create API for Pie Chart Data
app.get("/pie-chart-data", async (req, res) => {
  const { month } = req.query;
   
  
   
  if (!month) {
    return res.status(400).json({ error: "Month is required." });
  }

   
  const monthMap = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12',
  };

  const monthNumber = monthMap[month];
 

  if (!monthNumber) {
    return res.status(400).json({ error: "Invalid month name." });
  }

   const query = `
    SELECT category, COUNT(*) AS itemCount
    FROM data
    WHERE strftime('%m', date_of_sale) = ?
    GROUP BY category;
  `;

  const params = [monthNumber];

  try {
    const pieChartData = await db.all(query, params);  
    res.json(pieChartData);
  } catch (err) {
    console.error("Error fetching pie chart data:", err.message);
    res.status(500).json({ error: err.message });
  }
});


 
app.get("/combined-data", async (req, res) => {
  const { month } = req.query;

   
  if (!month) {
    return res.status(400).json({ error: "Month is required." });
  }

   
  const monthMap = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12',
  };

  const monthNumber = monthMap[month];
  
  if (!monthNumber) {
    return res.status(400).json({ error: "Invalid month name." });
  }

  try {
     
    const statisticsPromise = db.get(
      `
      SELECT 
        SUM(price) AS totalSaleAmount,
        COUNT(CASE WHEN sold = 1 THEN 1 END) AS totalSoldItems,
        COUNT(CASE WHEN sold = 0 THEN 1 END) AS totalNotSoldItems
      FROM data
      WHERE strftime('%m', date_of_sale) = ?;
    `,
      [monthNumber]
    );

     
    const barChartPromise = db.get(
      `
      SELECT 
        COUNT(CASE WHEN price BETWEEN 0 AND 100 THEN 1 END) AS '0-100',
        COUNT(CASE WHEN price BETWEEN 101 AND 200 THEN 1 END) AS '101-200',
        COUNT(CASE WHEN price BETWEEN 201 AND 300 THEN 1 END) AS '201-300',
        COUNT(CASE WHEN price BETWEEN 301 AND 400 THEN 1 END) AS '301-400',
        COUNT(CASE WHEN price BETWEEN 401 AND 500 THEN 1 END) AS '401-500',
        COUNT(CASE WHEN price BETWEEN 501 AND 600 THEN 1 END) AS '501-600',
        COUNT(CASE WHEN price BETWEEN 601 AND 700 THEN 1 END) AS '601-700',
        COUNT(CASE WHEN price BETWEEN 701 AND 800 THEN 1 END) AS '701-800',
        COUNT(CASE WHEN price BETWEEN 801 AND 900 THEN 1 END) AS '801-900',
        COUNT(CASE WHEN price > 900 THEN 1 END) AS '901-above'
      FROM data
      WHERE strftime('%m', date_of_sale) = ?;
    `,
      [monthNumber]
    );

     
    const pieChartPromise = db.all(
      `
      SELECT category, COUNT(*) AS itemCount
      FROM data
      WHERE strftime('%m', date_of_sale) = ?
      GROUP BY category;
    `,
      [monthNumber]
    );

     const [statistics, barChartData, pieChartData] = await Promise.all([
      statisticsPromise,
      barChartPromise,
      pieChartPromise,
    ]);

     const combinedData = {
      statistics,
      barChartData,
      pieChartData,
    };

     res.json(combinedData);
  } catch (err) {
    console.error("Error fetching combined data:", err.message);
    res.status(500).json({ error: err.message });
  }
});
























































