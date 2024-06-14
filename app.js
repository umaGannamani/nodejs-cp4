const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const dbObjectToResponseObject = dbPlayerObject => {
  return {
    playerId: dbPlayerObject.player_id,
    playerName: dbPlayerObject.player_name,
    jerseyNumber: dbPlayerObject.jersey_number,
    role: dbPlayerObject.role,
  }
}

//API 1
app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
  SELECT 
  * 
  FROM 
  cricket_team;`
  const playersArray = await db.all(getPlayerQuery)
  response.send(
    playersArray.map(playerDetails => dbObjectToResponseObject(playerDetails)),
  )
})

//API 2
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO
  cricket_team (player_name, jersey_number, role)
  VALUES ('${playerName}','${jerseyNumber}','${role}');`
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

//API 3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery1 = `
  SELECT 
  * 
  FROM
  cricket_team
  WHERE
  player_id = ${playerId};`
  const playerDetail = await db.get(getPlayerQuery1)
  response.send(dbObjectToResponseObject(playerDetail))
})

//API 4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails1 = request.body
  const {playerName, jerseyNumber, role} = playerDetails1
  const updatePlayerQuery = `
  UPDATE cricket_team
  SET
  player_name = "${playerName}",
  jersey_number = "${jerseyNumber}",
  role = "${role}"
  WHERE 
  player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 5
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE
  FROM
  cricket_team
  WHERE
  player_id = ${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
