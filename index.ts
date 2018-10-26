import express from 'express';
import { Todo as todo } from './src/todos';

const app: express.Application = express();
const Todo: todo = new todo();
const port: string | number = process.env.PORT || 4000;

app.use(express.json());
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * Show the default message for the root route
 */
app.all('/', (req, res): void => {
    return res.end('TODO App API by Collin and Jesse');
});

/**
 * List all todo items
 */
app.get('/v1/todo/list', async (req, res): Promise<express.Response> => {
    let todoData: Array<object> | void = await Todo.showAll();
    return res.send(todoData);
});

/**
 * Get todo by supplying it's uuid
 */
app.get('/v1/todo/:id', async (req, res): Promise<express.Response> => {
    let id: string = req.params.id;
    let todo = await Todo.get(id.toString());
    return res.send(todo);
});

/**
 * Create a new todo item
 */
app.post('/v1/todo/new', async (req, res): Promise<any> => {
    console.log(req.body);
    const [id, title, items] = [
        req.query.id || req.body.id,
        req.query.title || req.body.title,
        req.query.items || req.body.items
    ];
    if (!title || !items) {
        return res.status(400).json({ error: 'Could not parse Todo body' });
    }
    // FIXME: Use TodoConstructor Interface to define type instead of any
    const todo: any = { id: id, title: title, items: items };
    try {
        await Todo.newTodo(todo);
        return res.send('Todo Created');
    } catch (e) {
        res.end(e);
    }
    return res.end();
});

/**
 * Update an existing todo item
 */
app.put('/v1/todo/update', async (req, res): Promise<void | any> => {
    const id = req.query.id;
    if (!id) return res.end('Error: You need to provide the Todo ID');

    const [title, items] = [req.query.title, req.query.items];
    const todo = { title: title, items: items, id: id }

    await Todo.update(todo);
    res.send('Todo Updated');
    return res.end();
});

/**
 * Delete a todo item using it's ID
 */
app.delete('/v1/todo/delete/:id?', async (req, res): Promise<express.Response | void> => {
    let id = req.params.id || req.query.id;
    if (!id) {
        return res.status(400).send({
            message: `Could not find note with id ${id}`
        });
    }
    await Todo.deleteTodo(id);
    return res.end(`Deleted todo: ${id}`);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
