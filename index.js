const fsSync = require("fs");
const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { v4: uuid } = require("uuid");
const { result, compact } = require("lodash");
const { json } = require("express");

const app = express();
const sqlite3 = require("sqlite3").verbose();

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;



// To get a single recipe if the ID is known

 // Pass the recipe data from the request body
 // uses Update, so edits existing meals, use Insert for new ones
app.post("/writeMeals/:id", (req, res) => {
 
  const content = req.body.content;
  const title = req.body.title;
  const subTitle = req.body.subTitle;
  const image = req.body.image;
  const id = req.params.id;

  // validate the input data
  if (!content || !title || !subTitle || !image || !id) {
    return res.status(400).send("Invalid input data");
  }

  // create a connection to the database
  const db = new sqlite3.Database("./sqlite DB/mealsDB.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the mealsDB database.");

    // insert the recipe data into the database
    db.run(
      `UPDATE mealsDB SET title = ?, subtitle = ?, content = ?, image = ? WHERE id = ?`,
      [title, subTitle, content, image, id],
      function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Error inserting data into database");
        }
        console.log(`A new row has been inserted with rowid ${this.id}`);
        return res.status(201).json({
          id: id,
          title: title,
          subTitle: subTitle,
          content: content,
          image: image,
        });
      }
    );

    // close the database connection
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the mealsDB database connection.");
    });
  });
});


//to get one meal from database using id
app.get("/meals/:id", (req, res) => {
  const mealId = req.params.id;

  // create a connection to the database
  const db = new sqlite3.Database("./sqlite DB/mealsDB.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the mealsDB database.");
  });

  // execute the SQL query to retrieve the meal with the specified id
  db.get("SELECT * FROM mealsDB WHERE id = ?", [mealId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error retrieving meal data");
    }

    // check if the query returned a row
    if (!row) {
      return res.status(404).send("Meal not found");
    }

    // send the retrieved meal data as the response
    res.send(row);
  });

  // close the database connection when done
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
  });
});
//to get all meal from database 
app.get("/allMeals", (req, res) => {
  // create a connection to the database
  const db = new sqlite3.Database("./sqlite DB/mealsDB.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the mealsDB database.");
  });

  // execute the SQL query to retrieve all rows from the mealsDB table
  db.all("SELECT * FROM mealsDB", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error retrieving meal data");
    }

    // send the retrieved meal data as a JSON response
    res.json(rows);

    // close the database connection when done
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the database connection.");
    });
  });
});

//make a seperate table for generated meals
app.get("/allOwnMeals", async (req, res) => {
  const db = new sqlite3.Database("./sqlite DB/ownMealsDB.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the ownMealsDB database.");
  });

  db.all("SELECT * FROM ownMealsDB", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.sendStatus(500);
    }
    // send the retrieved meal data as a JSON response
    res.json(rows);

    // close the database connection when done
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the database connection.");
    });
  });
});


//To write own meals providing title, content and subTitle
app.post("/writeOwnMeals", (req, res) => {
  // extract the recipe data from the request body
  const content = req.body.content;
  const title = req.body.title;
  const subTitle = req.body.subTitle;

  // validate the input data
  if (!content || !title || !subTitle) {
    return res.status(400).send("Invalid input data");
  }

  // create a connection to the database
  const db = new sqlite3.Database("./sqlite DB/ownMealsDB.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the ownMealsDB database.");

    // insert the recipe data into the database
    db.run(
      `INSERT INTO ownMealsDB ( title, subtitle, content) VALUES ( ?, ?, ?)`,
      [ title, subTitle, content],
      function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Error inserting data into database");
        }
        console.log(`A new row has been inserted with rowid`);
        return res.status(201).json({
          
          title: title,
          subTitle: subTitle,
          content: content,
       
        });
      }
    );

    // close the database connection
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the mealsDB database connection.");
    });
  });
});

//to get all comments
app.get("/allcomments", async ( res) => {
  const db = new sqlite3.Database("./sqlite DB/comments.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the comments database.");
  });

  db.all("SELECT * FROM comments", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.sendStatus(500);
    }
    // send the retrieved meal data as a JSON response
    res.json(rows);

    // close the database connection when done
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the database connection.");
    });
  });
});

//make a seperate table for comments
app.post("/writeComments", ( res) => {

  const User = req.body.User;
  const comment = req.body.comment;
  const date = req.body.date;
 

  // validate the input data
  if (!User || !comment || !date ) {
    return res.status(400).send("Invalid input data");
  }

  // create a connection to the database
  const db = new sqlite3.Database("./sqlite DB/comments.db", (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error connecting to database");
    }
    console.log("Connected to the comments database.");

    // insert the comment data into the database
    db.run(`INSERT INTO comments ( User, comment, date) VALUES ( ?, ?, ?)`,
      [ User, comment, date],
      function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Error inserting data into database");
        }
        console.log(`A new row has been inserted with rowid `);
        return res.status(201).json({
   
          User: User,
          comment: comment,
          date: date,
        });
      }
    );

    // close the database connection
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the comments database connection.");
    });
  });
});
app.get("/GeneratedRecipe", async (req, res) => {
  const carb = ["Rice", "Boiled potato", "Pasta", "Bread", "oats", "Mashed Potatoes", "Fried Rice", "Spagetti"];
  const protein = ["Chicken", "Eggs", "Beef", "Pork", "Beans", "Linsel", "Peas", "Fish"];
  const fat = ["Avocado", "Butter", "Olive oil" ];

  generatedContent = {
    title: "Generated Meals",
    subTitle: "Lets make a nice combination",
    carbs: _.sample(carb),
    proteins: _.sample(protein),
    fats: _.sample(fat)
  };
  res.json(generatedContent); 
        
      }
    );


app.listen(PORT, () => {
  console.log("Server is running on localhost 3000");
});
