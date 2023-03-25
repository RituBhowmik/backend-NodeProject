const fsSync = require("fs");
const fs= require("fs/promises")
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { v4: uuid } = require("uuid");
const { result } = require("lodash");
const { json } = require("express");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/writerecipe/:id", async (req, res) => {
  const carbs = ["Rice", "Boiled potato", "Mashed potato", "Bread"];
  const protein = ["Chicken", "Eggs", "Beef", "Pork", "Beans", "Linsel"];
  let content;
  const id = req.params.id;
 
  content = {
    carbs: _.sample(carbs),
    protein: _.sample(protein),
  };

  if (!content) {
    return res.sendStatus(400);
  }
  await fs.mkdir("data/recipe", { recursive: true });
  await fs.writeFile(`data/recipe/${id}.txt`, JSON.stringify(content));

  return res.status(201).json({
    id: id,
    content,
  });

});

app.get("/recipe/:id", async (req, res) => {
	if (!req.params.id) {
	  
	  return res.sendStatus(400)
	}
	if (fsSync.existsSync('data/recipe/'+ req.params.id +'.txt')) {
		console.log('file exists');
	  } else {
		console.log('file not found!');
		return res.sendStatus(404);
	  }
	const result = await fs.readFile('data/recipe/'+ req.params.id +'.txt', function(err, data) {
		if(!result)
		{
			return res.end();
		}
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(data);
		console.log(JSON.parse(data));
		return res.end();
	  });
	console.log(JSON.parse(result))

	return res.status(201).json(
	  JSON.parse(result)
	);

  });
  
app.get("/allRecipes", async (req, res) => {
  const results= [];
  for(let step=1; step<=4; step++){
    if (fsSync.existsSync('data/recipe')) {
      console.log('file'+ step+' exists');
      } else {
      console.log('file not found!');
      return res.sendStatus(404);
      }
     const result = await fs.readFile('data/recipe/'+step +'.txt', function(err, data) {
      if(!result)
      {
        return res.end();
      }
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      console.log(JSON.parse(data));
      return res.end();
      });

      results.push(JSON.parse(result));

    console.log(JSON.parse(result))
    }
    return res.status(201).json(
    results
    );
   
    });

app.post("/comments", async (req, res) => {
  const id = uuid();
  const content = req.body.content;

  if (!content) {
    return res.sendStatus(400);
  }

  await fs.mkdir("data/comments", { recursive: true });
  await fs.writeFile(`data/comments/${id}.txt`, content);

  res.status(201).json({
    id: id,
  });
});

app.listen(3000, () => console.log("API Server is running..."));
