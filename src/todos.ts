import PouchDB from 'pouchdb';
import { existsSync, mkdirSync } from 'fs';
// const homedir = process.env.HOME;

if (!existsSync(`${__dirname}/Todo-API`)) { mkdirSync(`${__dirname}/Todo-API`) }
const TodoDB = new PouchDB(`${__dirname}/Todo-API/Todo`);

/**
 * TodoConstructor Interface   
 * 
 * title: `string`  
 * items: `string`  
 * id?: `string`  
 */
interface TodoConstructor {
    title: string;
    items: string;
    id?: string;
}

/**
 * Todo class
 */
export class Todo {
    /**
     * Create a new Todo and store it in the remote database
     * @param TodoParams {TodoConstructor} Todo object passed into the new todo method
     * @returns Promise<PouchDB.Core.Response | void>
     */
    public async newTodo(TodoParams: TodoConstructor): Promise<PouchDB.Core.Response | void> {
        try {
            TodoParams.title = TodoParams.title.trim() || new Date().toDateString();
            let uniqueID: string = Math.random().toString(36).substring(2, 10).toString();

            // Todo object
            let todo = {
                _id: TodoParams.id || uniqueID,
                title: TodoParams.title,
                items: TodoParams.items,
                lastModified: new Date().toDateString(),
                completed: false
            };
            return await TodoDB.put(todo);
        }
        catch (err) {
            throw new Error(`(${err.status}) ${err.name}: ${err.message}`);
        }
    }
    /**
     * Update an existing Todo by using supplying the id of the old todo
     * and an object containing data for a new Todo. A new id is generated
     * 
     * @requires `TodoParams.id`
     * @param TodoParams {TodoConstructor} Object with new params for the update
     * @returns Promise<PouchDB.Core.Response | void>
     */
    public async update(TodoParams: TodoConstructor): Promise<PouchDB.Core.Response | void> {
        if (TodoParams.id) {
            try {
                let todo: any = await TodoDB.get(TodoParams.id);
                todo.title = TodoParams.title.trim();
                todo.items = TodoParams.items;
                todo.lastModified = new Date().toDateString();

                return await TodoDB.put(todo);
            } catch (err) { throw new Error(`(${err.status}) ${err.name}: ${err.message}`); }
        }
        else { return console.log(`Invalid or No todo ID provided`); }
    }

    /**
     * Get all todo items from the database
     * @returns Promise<Array<object> | void>
     */
    public async showAll(): Promise<Array<object> | void> {
        // Documents from the PouchDB database
        let docs: Array<string> = [];
        let allItems: Array<object> = [];
        try {
            let allDocs: any = await TodoDB.allDocs({ include_docs: true, descending: true });
            allDocs.rows.forEach(async (doc: any) => docs.push(doc));
        } catch (err) {
            throw new Error(`(${err.status}) ${err.name}: ${err.message}`);
        }

        // Generate return Array by iterating over every doc
        // TODO: Optimise this to work better/faster. See the PouchDB docs
        docs.forEach((todo: any) => {
            allItems.push({
                id: todo.id,
                title: todo.doc.title,
                items: JSON.parse(JSON.stringify(todo.doc.items)),
                completed: todo.doc.completed,
                lastModified: todo.doc.lastModified
            });
        });
        return allItems;
    }

    /**
     * Remove a todo item from the database
     * @param todoId {String} ID of Todo to be removed
     */
    public async deleteTodo(todoId: string): Promise<void> {
        try {
            let todo: any = await TodoDB.get(todoId);
            TodoDB.remove(todo._id, todo._rev);
            return console.log('todo Deleted');
        } catch (err) {
            throw new Error(`(${err.status}) ${err.name}: ${err.message}`);
        }
    }
    /**
     * Delete al Todo items in the database
     * @returns Promise<void>
     */
    public async deleteAll(): Promise<void> {
        try {
            let allDocs = await TodoDB.allDocs({ include_docs: true, descending: true });
            allDocs.rows.forEach(async (todo: any) => {
                todo = await todo;
                TodoDB.remove(todo.doc._id, todo.doc._rev);
            });
            return console.log('All todo Deleted');
        } catch (err) {
            throw new Error(`(${err.status}) ${err.name}: ${err.message}`);
        }
    }
    /**
     * Get a todo item from the database by using it's id
     * @param id Id of todo item to retrieve from the todo databse
     */
    public async get(id: string): Promise<any> {
        try {
            let todo: any = await TodoDB.get(id);
            return JSON.stringify({
                id: id,
                title: todo.title,
                items: JSON.parse(JSON.stringify(todo.items)),
                completed: todo.completed,
                lastModified: todo.lastModified
            });
        }
        catch (err) {
            throw new TypeError(`${err.message}`);
        }
    }
}

export default Todo
