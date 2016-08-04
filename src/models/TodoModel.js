import {observable, computed, reaction, autorun} from 'mobx';
import { uuid, now } from '../utils'

export default class TodoModel {
	store;
	@observable title;
	@observable completed;
	@observable lastModified;

	constructor(store, { id, title, completed }) {
		this.store = store;
		this.key = uuid();
		this.id = id;
		this.title = title;
		this.completed = completed;

		this.cancelAutoSave = reaction(
			() => this.toJS(),
			() => this.lastModified = now(),
			true
		)
	}

	@computed get isTemp () {
		return !this.id
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

	static fromJS(store, { id, title, completed }) {
		return new TodoModel(store, { id, title, completed });
	}
}
