const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mysql = require('mysql');
const axios = require('axios').default

// - Connection configuration
var con  = mysql.createPool({
  connectionLimit : 5,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "chatbot",
  multipleStatements: true
});

con.getConnection((err,connection)=> {
    if(err)
    throw err;
    console.log('Database connected successfully');
    connection.release();
  });
  

app.use(express.json())

app.get('/:keyword', async (req, res) => {
   var keyword = req.params.keyword

   try {
     var { data } = await axios.get('https://pokeapi.co/api/v2/pokemon/' + keyword)
     var pokemonType = data.types.map(typeList => typeList.type.name).join('/')
     var pokemonDesc = `${data.name} is a ${pokemonType} pokemon. The height is ${data.height/10} m and weight is ${data.weight/10} kg. Here's the picture of ${data.name}` 
     var pokemonResult = {
         desc : pokemonDesc,
         pic : data.sprites.other['official-artwork'].front_default
     }
     res.status(200).send({result : pokemonResult})
   } catch (error) {
     console.log(error)
     res.status(404).json({error : error.message})
   }
})

app.post('/:name', async (req, res) => {
    var name = req.params.name
    var query = `INSERT INTO users_history(name) VALUES ('${name}')`
    con.query(query,function(err,result){
        if(err){
            console.log(err)
            return res.status(500).json({error : 'failed insert users'})
        }
        return res.status(201).json({result : 'success insert users'})
    })
 })

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})