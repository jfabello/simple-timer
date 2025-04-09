/**
 * @module jfabello/simple-timer
 * @description Promise-based simple timer for Node.js.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const { EventEmitter } = require("node:events");

// Errors
const errors = require("./errors.js");

/**
 * @description A simple timer class that provides a way to set, start, and cancel a timer with a specified timeout.
 */
class SimpleTimer {
	// Private class constants
	static #SET = Symbol("SET");
	static #RUNNING = Symbol("RUNNING");
	static #DONE = Symbol("DONE");
	static #CANCELLED = Symbol("CANCELLED");

	// Private instance variables
	#timerTimeout = null;
	#timerState = null;
	#timerEmitter = null;
	#timerPromise = null;
	#timerHandle = null;

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the SET timer state.
	 */
	static get SET() {
		return SimpleTimer.#SET;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the RUNNING timer state.
	 */
	static get RUNNING() {
		return SimpleTimer.#RUNNING;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the DONE timer state.
	 */
	static get DONE() {
		return SimpleTimer.#DONE;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the CANCELLED timer state.
	 */
	static get CANCELLED() {
		return SimpleTimer.#CANCELLED;
	}

	/**
	 * @static
	 * @type {Object}
	 * @description Read-only property that contains the simple timer error classes as its properties.
	 */
	static get errors() {
		return errors;
	}

	/**
	 * @type {Symbol}
	 * @description The timer instance state.
	 */
	get state() {
		return this.#timerState;
	}

	/**
	 * @description Creates a new instance of the simple timer.
	 * @constructor
	 * @param {number} timeout - The timeout duration in milliseconds. Must be an integer greater than 0.
	 * @throws {SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID} If the timeout is not an integer.
	 * @throws {SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS} If the timeout is less than 1.
	 */
	constructor(timeout) {
		if (Number.isInteger(timeout) !== true) {
			throw new errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID();
		}
		if (timeout < 1) {
			throw new errors.ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS();
		}

		this.#timerTimeout = timeout;
		this.#timerState = SimpleTimer.#SET;
		this.#timerEmitter = new EventEmitter();
	}

	/**
	 * @description Starts the timer if it is in the SET state. If the timer is already running, it returns the existing timer promise. If the timer is not in the SET or RUNNING states, it throws an error.
	 * @returns {Promise} A promise that fulfills to SimpleTimer.DONE if the timer times out, or SimpleTimer.CANCELLED if the timer is cancelled before it times out.
	 * @throws {SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES} If the timer is not in the SET or RUNNING states.
	 */
	start() {
		if (this.#timerState === SimpleTimer.#RUNNING) {
			return this.#timerPromise;
		}

		if (this.#timerState !== SimpleTimer.#SET) {
			throw new errors.ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES();
		}

		this.#timerPromise = new Promise((resolve, reject) => {
			this.#timerEmitter.once("timerup", () => {
				this.#timerHandle = null;
				this.#timerPromise = null;
				this.#timerState = SimpleTimer.#DONE;
				resolve(this.#timerState);
			});

			this.#timerEmitter.once("timercancelled", () => {
				this.#timerHandle = null;
				this.#timerPromise = null;
				this.#timerState = SimpleTimer.#CANCELLED;
				resolve(this.#timerState);
			});
		});

		this.#timerHandle = setTimeout(() => this.#timerEmitter.emit("timerup"), this.#timerTimeout);
		this.#timerState = SimpleTimer.#RUNNING;
		return this.#timerPromise;
	}

	/**
	 * @description Cancels the simple timer. If the timer is not in the RUNNING state, it throws an error.
	 * @returns {Promise} A promise that fulfills to SimpleTimer.CANCELLED once the timer is cancelled.
	 * @throws {SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_RUNNING} If the timer is not running.
	 */
	cancel() {
		if (this.#timerState !== SimpleTimer.#RUNNING) {
			throw new errors.ERROR_SIMPLE_TIMER_NOT_RUNNING();
		}

		clearTimeout(this.#timerHandle);
		this.#timerEmitter.emit("timercancelled");
		return this.#timerPromise;
	}
}

module.exports = SimpleTimer;
