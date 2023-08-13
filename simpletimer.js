/**
 * @module jfabello/simpletimer
 * @description Promise-based simple timer.
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const { EventEmitter } = require("node:events");

// Errors
const simpleTimerErrors = require("./errors.js");

/**
 * @description Promise-based simple timer.
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
	 * @description Read-only constant representing the SET timer state.
	 */
	static get SET() {
		return SimpleTimer.#SET;
	}

	/**
	 * @description Read-only constant representing the RUNNING timer state.
	 */
	static get RUNNING() {
		return SimpleTimer.#RUNNING;
	}

	/**
	 * @description Read-only constant representing the DONE timer state.
	 */
	static get DONE() {
		return SimpleTimer.#DONE;
	}

	/**
	 * @description Read-only constant representing the CANCELLED timer state.
	 */
	static get CANCELLED() {
		return SimpleTimer.#CANCELLED;
	}

	/**
	 * @description Read-only object that contains the simple timer error classes as properties.
	 */
	static get errors() {
		return simpleTimerErrors;
	}

	/**
	 * @description The timer state of simple timer instance.
	 */
	get state() {
		return this.#timerState;
	}

	/**
	 * @description Creates a new instance of the simple timer.
	 * @param {number} timeout The timer timeout in miliseconds.
	 */
	constructor(timeout) {
		if (Number.isInteger(timeout) !== true) {
			throw new SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID();
		}
		if (timeout < 1) {
			throw new SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS();
		}

		this.#timerTimeout = timeout;
		this.#timerState = SimpleTimer.#SET;
		this.#timerEmitter = new EventEmitter();
	}

	/**
	 * @description Starts the simple timer.
	 * @returns {Promise} A promise that fulfills to SimpleTimer.DONE if the timer times out, or SimpleTimer.CANCELLED if the timer is cancelled before it times out.
	 */
	start() {
		if (this.#timerState === SimpleTimer.#RUNNING) {
			return this.#timerPromise;
		}

		if (this.#timerState !== SimpleTimer.#SET) {
			throw new SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES();
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
	 * @description Cancels the simple timer.
	 * @returns {Promise} A promise that fulfills to SimpleTimer.DONE if the timer times out, or SimpleTimer.CANCELLED if the timer is cancelled before it times out.
	 */
	cancel() {
		if (this.#timerState !== SimpleTimer.#RUNNING) {
			throw new SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_RUNNING();
		}

		clearTimeout(this.#timerHandle);
		this.#timerEmitter.emit("timercancelled");
		return this.#timerPromise;
	}
}

module.exports = SimpleTimer;
