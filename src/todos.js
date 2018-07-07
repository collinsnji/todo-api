const PouchDB = require('pouchdb');
const homedir = require('os').homedir();
const fs = require('fs');

if (!fs.existsSync(`${homedir}/.local/Todo-API`)) { fs.mkdirSync(`${homedir}/.local/Todo-API`) }
const TodoDB = new PouchDB(`${homedir}/.local/Todo-API/Todo`);

class Todo {
    async newTodo(title, body, uuid) {
        title = title.trim();
        try {
            title = title.trim() || new Date().toDateString();
            let id = Number(new Date().toISOString().replace(/\D|2018-\d+-\d+/gmi, ''));
            let uniqueID = (Math.floor(Math.random() * id)).toString();

            let todo = {
                _id: uuid || (uniqueID.length < 9) ? uniqueID.padStart(9, 0) : uniqueID,
                title: title,
                body: body,
                lastModified: new Date().toDateString(),
                completed: false
            };
            await TodoDB.put(todo);
            return console.log('Todo added');
        }
        catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
        }
    }

    async update(todoId, newTaskTitle, newTaskBody) {
        if (todoId) {
            try {
                let todo = await TodoDB.get(todoId);
                todo.title = newTaskTitle.trim();
                todo.body = newTaskBody;
                todo.lastModified = new Date().toDateString();

                return await TodoDB.put(todo);
            } catch (err) { console.log(`Error: (${err.status}) ${err.name}: ${err.message}`); }
        }
        else { return console.log(`Invalid or No todo ID provided`); }
    }

    async showAll() {
        let docs = [];
        let allItems= [];
        try {
            let allDocs = await TodoDB.allDocs({ include_docs: true, descending: true });
            allDocs.rows.forEach(async (doc) => {
                docs.push(doc);
            });
        } catch (err) { console.log(`Error: (${err.status}) ${err.name}: ${err.message}`); }
        docs.forEach(todo => {
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

    async deleteTodo(todoId) {
        try {
            let todo = await TodoDB.get(todoId);
            TodoDB.remove(todo._id, todo._rev);
            return console.log('todo Deleted');
        } catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
        }
    }
    async deleteAll() {
        try {
            let allDocs = await TodoDB.allDocs({ include_docs: true, descending: true });
            allDocs.rows.forEach(async (todo) => {
                todo = await todo;
                TodoDB.remove(todo.doc._id, todo.doc._rev);
            });
            return console.log('All todo Deleted');
        } catch (err) {
            console.log(`Error: (${err.status}) ${err.name}: ${err.message}`);
        }
    }
}

module.exports = Todo;
