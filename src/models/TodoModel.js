import {observable, computed, reaction, autorun} from 'mobx';
import { now } from '../utils'

export default class TodoModel {
	store;
	id;
	@observable title;
	@observable completed;
	@observable lastModified;

	constructor(store, id, title, completed) {
		this.store = store;
		this.id = id;
		this.title = title;
		this.completed = completed;
		
		this.cancelAutoSave = reaction(
			() => this.toJS(),
			() => this.lastModified = now(),
			true
		)
	}

	destroy() {
		this.cancelAutoSave()
		this.store.removeTodo(this)
	}

	toggle() {
		this.completed = !this.completed;
	}

	setTitle(title) {
		this.title = title;
	}

	toJS() {
		return {
			id: this.id,
			title: this.title,
			completed: this.completed
		};
	}

	static fromJS(store, object) {
		return new TodoModel(store, object.id, object.title, object.completed);
	}
}
