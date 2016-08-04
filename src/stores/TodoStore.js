import {observable, computed, autorun} from 'mobx';
import TodoModel from '../models/TodoModel'
import { uuid, now } from '../utils';
import debounce from 'lodash/debounce'

export default class TodoStore {
	@observable todos = [];

	constructor () {
		this.lastSync = this.lastModified
		
		this.sync = debounce(() => {
			const modifiedTodos = this.todos
				.filter(todo => todo.lastModified > this.lastSync)
				.map(todo => todo.toJS())
			
			fetch('/api/todos/batch', {
				headers: new Headers({ 'content-type': 'application/json' }),
				method: 'post',
				body: JSON.stringify({
					created : [],
					modified : modifiedTodos,
					deletedIds : this.pendingDeletedIds
				})
			}).then(() => {
				this.pendingDeletedIds = []
				this.lastSync = this.lastModified
			})
		}, 500)
	}

	@observable pendingDeletedIds = []
	
	@computed get lastModified () {
		if (!this.todos) return null
		const arr = this.todos.map(todo => todo.lastModified)
		return Math.max.apply(null, arr)
	}

	@observable lastSync = null

	@computed get isSynced () {
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
		this.todos.push(new TodoModel(this, uuid(), title, false));
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
