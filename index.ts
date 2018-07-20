import express from 'express';
import { Todo as todo } from './src/todos';

const app: express.Application = express();
const Todo: todo = new todo();
const port: string | number = process.env.PORT || 4000;

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res): void => {
    return res.end('TODO App API by Collin and Jesse');
})
app.get('/v1/todo/list', async (req, res): Promise<express.Response> => {
    let todoData: Array<object> | void = await Todo.showAll();
    return res.send(todoData);
});

app.post('/v1/todo/new', async (req, res): Promise<void> => {
    const [uuid, title, body] = [req.query.uuid, req.query.title, req.query.body];

    // FIXME: Use TodoConstructor Interface to define type instead of any
    const todo: any = { uuid: uuid, title: title, body: body };

    await Todo.newTodo(todo);
    res.send('Todo Created')
    return res.end();
});

app.post('/v1/todo/update', async (req, res): Promise<void | any> => {
    const id = req.query.id;
    if (!id) return res.end('Error: You need to provide the Todo ID');

    const [title, body] = [req.query.title, req.query.body];
    const todo = { title: title, body: body, uuid: id }

    await Todo.update(todo);
    res.send('Todo Updated');
    return res.end();
});

app.post('/v1/todo/delete', async (req, res): Promise<void> => {
    let id = req.query.id;
    await Todo.deleteTodo(id);
    return res.end(`Deleted todo: ${id}`);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
