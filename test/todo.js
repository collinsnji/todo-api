const expect = require('chai').expect;
const { Todo } = require('../build/src/todos');

describe('Running TODO tests..', () => {
    const todo = new Todo();

    it('todo should be an instance of imported Todo class', () => {
        expect((typeof todo)).to.equal('object');
        expect(todo instanceof Todo).to.equal(true);
    });

    it('Should create a new Todo Item', () => {
        expect(
            todo.newTodo({
                title: 'Test Todo item',
                body: 'Body of test todo',
                uuid: '005'
            })
        ).to.not.throw;
    });
    it('Should get all todo items as an array', () => {
        expect(typeof todo.showAll()).to.equal('object');
    });
});
