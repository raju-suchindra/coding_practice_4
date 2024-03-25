const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const app = express()
let dbPath = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())

let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e}`)
  }
}
intializeDbAndServer()

//API 1 - List of players from the cricket team

const convertDBObject = objectItem => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team`
  const getPlayerQueryResponse = await db.all(getPlayersQuery)
  response.send(
    getPlayerQueryResponse.map(eachPlayer => convertDBObject(eachPlayer)),
  )
})

// // API 2 - Creates a new player in the team (database). player_id is auto-incremented

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const createPlayerQuery = ` insert into cricket_team(player_name,
    jersey_number,role) 
    values('${playerName}',${jerseyNumber},'${role}');`
  const createPlayerQueryResponse = await db.run(createPlayerQuery)
  response.send('Player Added to Team')
})

// //API 3- return the player details by playerId

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetailQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const getPlayerDetailsResponse = await db.get(getPlayerDetailQuery)
  response.send(convertDBObject(getPlayerDetailsResponse))
})

// //update the details of the player using player ID
// // API 4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerDetailsQuery = `update cricket_team set
  player_name = '${playerName}' , jersey_number = ${jerseyNumber} , role = '${role}'
  where player_id = ${playerId};`
  await db.run(updatePlayerDetailsQuery)
  response.send('Player Details Updated')
})

// //API 5
// //Deletes a player from the team (database) based on the player ID

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
