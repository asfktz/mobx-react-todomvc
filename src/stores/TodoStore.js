import {observable, computed, autorun} from 'mobx';
import TodoModel from '../models/TodoModel'
import { now } from '../utils';
import debounce from 'lodash/debounce'

export default class TodoStore {
	@observable todos = [];

	constructor () {
		this.lastSync = this.lastModified
		
		this.sync = debounce(() => {
			
			const createdTodos = this.todos
				.filter(todo => todo.isTemp)
				.map(todo => todo.toJS())

			const modifiedTodos = this.todos
				.filter(todo => !todo.isTemp && todo.lastModified > this.lastSync)
				.map(todo => todo.toJS())


			const promises = [].concat(
				
			)
	

		const createPromises = createdTodos.map((todo) => {
			return fetch('/api/todos', {
				headers: new Headers({ 'content-type': 'application/json' }),
				method: 'POST',
				body: JSON.stringify(todo.toJS())
			})
		})

		const updatePromise = fetch('/api/todos', {
			headers: new Headers({ 'content-type': 'application/json' }),
			method: 'PUT',
			body: JSON.stringify(modifiedTodos)
		}),

		const deletePromise = fetch('/api/todos', {
			headers: new Headers({ 'content-type': 'application/json' }),
			method: 'DELETE',
			body: JSON.stringify(this.pendingDeletedIds.toJS())
		})


		console.log([
			...createPromises, 
			updatePromise,
			deletePromise
		])

		// Promise.all(promises)
		// 	.then(() => {
		// 		console.log('done')
		// 		this.pendingDeletedIds = []
		// 	})

		// }, 500)
	}

	@observable pendingDeletedIds = []

	@computed get lastModified () {
		if (!this.todos) return 0

		const arr = this.todos
			// .filter((todo) => !todo.isTemp)
			.map((todo) => todo.lastModified)

		if (!arr.length) return 0

		return Math.max.apply(null, arr)
	}

	@observable lastSync = null

	@computed get isOutSync () {
		return this.lastSync === this.lastModified && this.pendingDeletedIds.length === 0
	}

	@computed get activeTodoCount() {
		return this.todos.reduce(
			(sum, todo) => sum + (todo.completed ? 0 : 1),
			0
		)
	}

	@computed get completedCount() {
		return this.todos.length - this.activeTodoCount;
	}


	subscribeServerToStore(model) {
		autorun(() => {
			const todos = this.toJS();
			if (this.subscribedServerToModel !== true) {
				this.subscribedServerToModel = true;
				return;
			}

			if (this.lastSync < this.lastModified || this.pendingDeletedIds.length) {
				this.sync()
			}

			// fetch('/api/todos', {
			// 	method: 'post',
			// 	body: json.stringify({ todos }),
			// 	headers: new headers({ 'content-type': 'application/json' })
			// })
		});
	}

	addTodo (title) {
		const todo = new TodoModel(this, {
			title,
			completed: false
		})

		this.todos.push(todo)
	}

	removeTodo (todo) {
		this.pendingDeletedIds.push(todo.id)
		this.todos.remove(todo);
	}

	toggleAll (checked) {
		this.todos.forEach(
			todo => todo.completed = checked
		);
	}

	clearCompleted () {
		this.todos = this.todos.filter(
			todo => !todo.completed
		);
	}

	toJS() {
		return this.todos.map(todo => todo.toJS());
	}

	static fromJS(array) {
		console.log(1111)
		const todoStore = new TodoStore();
		todoStore.todos = array.map(item => TodoModel.fromJS(todoStore, item));
		todoStore.lastSync = now()
		return todoStore;
	}
}
