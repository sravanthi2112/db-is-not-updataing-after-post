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
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//get list of players API 1

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

// creating a new player in DB API 2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const playersQuery = `
  INSERT INTO cricket_team(player_name, jersey_number, role)
  VALUES (
    '${player_name}',
    '${jersey_number}',
    '${role}'
  );`
  await db.run(playersQuery)
  response.send('Player Added to Team')
})

//Return a player based on a player ID API 3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersIdDetails = `
  SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const playerIdDetail = await db.get(getPlayersIdDetails)
  response.send(convertDbObjectToResponseObject(playerIdDetail))
})

//updating details API 4

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updateqyery = `
  UPDATE 
    cricket_team 
  SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE 
    player_id = ${playerId};`

  await db.run(updateqyery)
  response.send('Player Details Updated')
})

//Delete player Details API

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteplayerdetailsquery = `
  DELETE FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`
  await db.run(deleteplayerdetailsquery)
  response.send('Player Removed')
})

module.exports = app
