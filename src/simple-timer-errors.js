/**
 * @module simple-timer-errors
 * @description Promise-based simple timer for Node.js classes
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

class ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID extends TypeError {
	constructor() {
		super("The simple timer timeout type is not valid, it should be an integer.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS extends RangeError {
	constructor() {
		super("The simple timer timeout is out of bounds, it should be between 1 ms and infinity.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES extends Error {
	constructor() {
		super("The simple timer is not in the SET or RUNNING states.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_SIMPLE_TIMER_NOT_RUNNING extends Error {
	constructor() {
		super("The simple timer is not in the RUNNING state.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

const errors = {
	ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID,
	ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS,
	ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES,
	ERROR_SIMPLE_TIMER_NOT_RUNNING
};

Object.freeze(errors);

module.exports = errors;
