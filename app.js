const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

let dbConnection = null

const initDbAndServer = async () => {
  try {
    dbConnection = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('server satrted'))
  } catch (e) {
    console.log(e)
  }
}

initDbAndServer()

// api 1

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  console.log(priority)
  let dbQuery = ''

  if (status !== '' && priority !== '') {
    dbQuery = `
        select * from todo
        where
          status = "${status}" and priority = "${priority}";
     `
  } else if (status !== '') {
    dbQuery = ` select * from todo 
            where status = "${status}";
    `
  } else if (priority !== '') {
    dbQuery = ` select * from todo 
            where priority = "${priority}";
    `
  } else {
    dbQuery = ` select * from todo 
            where todo like "%${search_q}%";
    `
  }

  const result = await dbConnection.all(dbQuery)
  response.send(result)
})

// api 2

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params

  let dbQuery = `
      select * from todo
      where id = ${todoId};
   `
  let result = await dbConnection.get(dbQuery)
  response.send(result)
})

// api 3

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body

  let dbQuery = `
      insert into todo (id,todo,priority,status)
      values
      (${id},"${todo}","${priority}","${status}");
   `

  let result = await dbConnection.run(dbQuery)
  response.send('Todo Successfully Added')
})

// api4

app.put('/todos/:todoId', async (request, response) => {
  const {todo = '', priority = '', status = ''} = request.body
  const {todoId} = request.params
  console.log(priority, todo, status)
  let dbQuery = null

  if (todo !== '') {
    dbQuery = `
      update todo
      set
      todo = "${todo}"
      where 
        id = ${todoId};
   `
  } else if (priority !== '') {
    dbQuery = `
      update todo
      set
      priority = "${priority}"
      where 
        id = ${todoId};
   `
  } else if (status !== '') {
    dbQuery = `
      update todo
      set
      status = "${status}"
      where 
        id = ${todoId};
   `
  }

  let result = await dbConnection.run(dbQuery)

  if (todo !== '') {
    response.send('Todo Updated')
  } else if (priority !== '') {
    response.send('Priority Updated')
  } else if (status !== '') {
    response.send('Status Updated')
  }
})

//api 5

app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params

  let dbQuery = `
      delete from todo
      where id = ${todoId};
   `
  let result = await dbConnection.run(dbQuery)
  response.send('Todo Deleted')
})

module.exports = app
