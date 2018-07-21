import PouchDB from 'pouchdb';
import { existsSync, mkdirSync } from 'fs';
// const homedir = process.env.HOME;

if (!existsSync(`${__dirname}/Todo-API`)) { mkdirSync(`${__dirname}/Todo-API`) }
const TodoDB = new PouchDB(`${__dirname}/Todo-API/Todo`);

// Interface
interface TodoConstructor {
    title: string;
    body: string;
    uuid?: string;
}

export class Todo {
    constructor() { }

    public async newTodo(TodoParams: TodoConstructor): Promise<string | void> {
        try {
            TodoParams.title = TodoParams.title.trim() || new Date().toDateString();
            let uniqueID: string = Math.random().toString(36).substring(2, 10).toString();

            let todo = {
                _id: TodoParams.uuid || uniqueID,
                title: TodoParams.title,
                body: TodoParams.body,
                lastModified: new Date().toDateString(),
                completed: false
            };
            await TodoDB.put(todo);
            return console.log('Todo added');
        }
        catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
            return `Error: (${err.status}) ${err.name}: ${err.message}`;
        }
    }

    public async update(TodoParams: TodoConstructor): Promise<PouchDB.Core.Response | void> {
        if (TodoParams.uuid) {
            try {
                let todo: any = await TodoDB.get(TodoParams.uuid);
                todo.title = TodoParams.title.trim();
                todo.body = TodoParams.body;
                todo.lastModified = new Date().toDateString();

                return await TodoDB.put(todo);
            } catch (err) { console.log(`Error: (${err.status}) ${err.name}: ${err.message}`); }
        }
        else { return console.log(`Invalid or No todo ID provided`); }
    }

    public async showAll(): Promise<Array<object> | void> {
        let docs: Array<string> = [];
        let allItems: Array<object> = [];
        try {
            let allDocs: any = await TodoDB.allDocs({ include_docs: true, descending: true });
            allDocs.rows.forEach(async (doc: any) => docs.push(doc));
        } catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
        }

        docs.forEach((todo: any) => {
            allItems.push({
                id: todo.id,
                title: todo.doc.title,
                ingredients: {
                    id: Math.floor(Math.random() * 10),
                    items: [todo.doc.body]
                },
                lastModified: todo.doc.lastModified
            });
        });
        return allItems;
    }

    public async deleteTodo(todoId: string): Promise<void> {
        try {
            let todo: any = await TodoDB.get(todoId);
            TodoDB.remove(todo._id, todo._rev);
            return console.log('todo Deleted');
        } catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
        }
    }
    public async deleteAll(): Promise<void> {
        try {
            let allDocs = await TodoDB.allDocs({ include_docs: true, descending: true });
            allDocs.rows.forEach(async (todo: any) => {
                todo = await todo;
                TodoDB.remove(todo.doc._id, todo.doc._rev);
            });
            return console.log('All todo Deleted');
        } catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
        }
    }

    public async get(id: string): Promise<any> {
        try {
            let todo: any = await TodoDB.get(id);
            return JSON.stringify({
                id: todo.id,
                title: todo.title,
                ingredients: {
                    id: Math.floor(Math.random() * 10),
                    items: [todo.body]
                },
                lastModified: todo.lastModified
            });
        }
        catch (err) {
            console.log(`TypeError: ${err.message}`);
        }
    }
}

export default Todo
