const express = require('express');
const app = express();
const port = 3000; // You can choose any available port you like
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',     // Replace with your MySQL host (e.g., 'localhost')
  user: 'user',     // Replace with your MySQL user
  password: 'pass', // Replace with your MySQL password
  database: 'words',   // Replace with your MySQL database name
  connectionLimit: 10,         // Set the maximum number of connections in the pool
});

// Optional: You can test the connection to the database
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database!');
    connection.release(); // Release the connection back to the pool
  }
});


// Define a route for the root path
app.get('/', (req, res) => {
  res.send('Hello, this is your Express server!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


app.get('/get_word', (req, res) => {
    res.send('Hello, this is your Express server!');
});


app.get('/get_word/:wordLength', (req, res) => {
    const wordLength = parseInt(req.params.wordLength, 10); // Get the word length from the request URL and convert to integer
  
    if (isNaN(wordLength) || wordLength <= 0) {
      // If the provided word length is not a positive integer, send an error response
      return res.status(400).json({ error: 'Invalid word length' });
    }
  
    // Prepare the SQL query to fetch a random word with the specified length
    const query = `SELECT WORD FROM NOUNS WHERE CHAR_LENGTH(WORD) = ? AND USED = 0 ORDER BY RAND() LIMIT 1`;
  
    // Execute the query using the connection pool
    pool.query(query, [wordLength], (err, results) => {
      if (err) {
        console.error('Error executing query:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (results.length === 0) {
        // If no word with the specified length is found, send an empty response
        return res.status(404).json({ error: 'No word found with the specified length' });
      }
  
      const randomWord = results[0].WORD;
      // Update the USED flag for the selected word to indicate that it has been used
      const updateQuery = 'UPDATE NOUNS SET USED = 1 WHERE WORD = ?';
      pool.query(updateQuery, [randomWord], (updateErr) => {
        if (updateErr) {
          console.error('Error updating USED flag:', updateErr.message);
        }
        // Send the selected word as the response
        res.json({ word: randomWord });
      });
    });
  });
  