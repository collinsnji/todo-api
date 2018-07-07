const express = require('express');
const app = express();
const todo = require('./src/todos');
const Todo = new todo();
const port = process.env.PORT || 4000;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    return res.end('TODO App API by Collin and Jesse');
})
app.get('/v1/todo/list', async (req, res) => {
    let todoData = await Todo.showAll();
    return res.send(todoData);
});

app.post('/v1/todo/new', async (req, res) => {
    let uuid = req.query.uuid;
    let title = req.query.title;
    let body = req.query.body;

    await Todo.newTodo(title, body, uuid);
    res.send('Todo Created')
    return res.end();
});

app.post('/v1/todo/update', async (req, res) => {
    let id = req.query.id;
    if (!id) return res.end('Error: You need to provide the Todo ID');

    let title = req.query.title;
    let body = req.query.body;

    await Todo.update(id, title, body);
    res.send('Todo Updated');
    return res.end();
});

app.post('/v1/todo/delete', async (req, res) => {
    let id = req.query.id;
    await Todo.deleteTodo(id);
    return res.end(`Deleted todo: ${id}`);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
