/**
 * Promise-based simple timer for Node.js.
 * @module jfabello/simple-timer-class
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const { EventEmitter } = require("node:events");

// Errors
const errors = require("./simple-timer-errors.js");

/**
 * A simple timer class that provides a way to set, start, and cancel a timer with a specified timeout.
 * @class SimpleTimer
 */
class SimpleTimer {
	// Private class constants
	static #SET = Symbol("SET");
	static #RUNNING = Symbol("RUNNING");
	static #DONE = Symbol("DONE");
	static #CANCELLED = Symbol("CANCELLED");

	// Private instance variables
	/** @type {number} */ #timerTimeout = null;
	/** @type {symbol} */ #timerState = null;
	/** @type {EventEmitter} */ #timerEmitter = null;
	/** @type {Promise} */ #timerPromise = null;
	/** @type {NodeJS.Timeout} */ #timerHandle = null;

	/**
	 * Read-only property representing the SET timer state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get SET() {
		return SimpleTimer.#SET;
	}

	/**
	 * Read-only property representing the RUNNING timer state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get RUNNING() {
		return SimpleTimer.#RUNNING;
	}

	/**
	 * Read-only property representing the DONE timer state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get DONE() {
		return SimpleTimer.#DONE;
	}

	/**
	 * Read-only property representing the CANCELLED timer state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get CANCELLED() {
		return SimpleTimer.#CANCELLED;
	}

	/**
	 * Read-only property that contains the simple timer error classes as its properties.
	 * @static
	 * @readonly
	 * @type {object}
	 */
	static get errors() {
		return errors;
	}

	/**
	 * The timer instance state.
	 * @readonly
	 * @type {symbol}
	 */
	get state() {
		return this.#timerState;
	}

	/**
	 * Creates a new instance of the simple timer.
	 * @constructor
	 * @param {number} timeout - The timeout duration in milliseconds. Must be an integer greater than 0.
	 * @throws {ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID} If the timeout is not an integer.
	 * @throws {ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS} If the timeout is less than 1.
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
	 * Starts the timer if it is in the SET state. If the timer is already running, it returns the existing timer promise. If the timer is not in the SET or RUNNING states, it throws an error.
	 * @returns {Promise<symbol>} A promise that fulfills to SimpleTimer.DONE if the timer times out, or SimpleTimer.CANCELLED if the timer is cancelled before it times out.
	 * @throws {ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES} If the timer is not in the SET or RUNNING states.
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
	 * Cancels the simple timer. If the timer is not in the RUNNING state, it throws an error.
	 * @returns {Promise<symbol>} A promise that fulfills to SimpleTimer.CANCELLED once the timer is cancelled.
	 * @throws {ERROR_SIMPLE_TIMER_NOT_RUNNING} If the timer is not running.
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

module.exports = { SimpleTimer };
