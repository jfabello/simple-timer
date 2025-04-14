/**
 * @module simple-timer-tests
 * @description Promise-based simple timer for Node.js tests.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
import { describe, expect, test } from "@jest/globals";
import { SimpleTimer } from "../src/simple-timer-class.js";

describe("Simple Timer tests", () => {
	test("An attempt to create a SimpleTimer instance must throw an ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID error when the timeout argument is undefined", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let simpleTimerInstance = new SimpleTimer();
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID);
		}
	});

	test("An attempt to create a SimpleTimer instance must throw an ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID error when the timeout argument is not an integer", () => {
		expect.assertions(4);
		try {
			// @ts-ignore
			let simpleTimerInstance = new SimpleTimer("200");
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let simpleTimerInstance = new SimpleTimer([200]);
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let simpleTimerInstance = new SimpleTimer({ timeout: 200 });
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID);
		}
		try {
			let simpleTimerInstance = new SimpleTimer(3.14);
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_TYPE_INVALID);
		}
	});

	test("An attempt to create a SimpleTimer instance must throw an ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS error when the timeout argument is not a positive integer greater than zero", () => {
		expect.assertions(2);
		try {
			let simpleTimerInstance = new SimpleTimer(0);
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS);
		}
		try {
			let simpleTimerInstance = new SimpleTimer(-200);
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_TIMEOUT_OUT_OF_BOUNDS);
		}
	});

	test("An attempt to create a SimpleTimer instance must return a SimpleTimer instance when the timeout argument is a positive integer greater than zero", () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		expect(simpleTimerInstance).toBeInstanceOf(SimpleTimer);
	});

	test("A SimpleTimer instance must be in the SET state after its constructor is called", () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		expect(simpleTimerInstance.state).toBe(SimpleTimer.SET);
	});

	test("A SimpleTimer instance must return a Promise object when its start(...) method is called and it is in the SET state", () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		expect(simpleTimerInstance.state).toBe(SimpleTimer.SET);
		expect(simpleTimerInstance.start()).toBeInstanceOf(Promise);
	});

	test("A SimpleTimer instance must be in the RUNNING state after its start(...) method is called", () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		simpleTimerInstance.start();
		expect(simpleTimerInstance.state).toBe(SimpleTimer.RUNNING);
	});

	test("A SimpleTimer instance must return a Promise object when its start(...) method is called and it is in the RUNNING state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		simpleTimerInstance.start();
		await new SimpleTimer(100).start();
		expect(simpleTimerInstance.state).toBe(SimpleTimer.RUNNING);
		expect(simpleTimerInstance.start()).toBeInstanceOf(Promise);
	});

	test("A SimpleTimer instance with a 200 ms timeout must take about 200 ms to time out when its start(...) method is called", async () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		let startTime = Date.now();
		await simpleTimerInstance.start();
		let endTime = Date.now();
		expect((endTime - startTime) / 1000).toBeCloseTo(0.2);
	});

	test("A SimpleTimer instance with a 200 ms timeout must have its promise resolve to SimpleTimer.DONE when it times out", async () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		let simpleTimerResult = await simpleTimerInstance.start();
		expect(simpleTimerResult).toBe(SimpleTimer.DONE);
	});

	test("A SimpleTimer instance with a 200 ms timeout must be in the DONE state when it times out", async () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		await simpleTimerInstance.start();
		expect(simpleTimerInstance.state).toBe(SimpleTimer.DONE);
	});

	test("A SimpleTimer instance call to its start(...) method must throw an ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES when it is in the DONE state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		await simpleTimerInstance.start();
		try {
			expect(simpleTimerInstance.state).toBe(SimpleTimer.DONE);
			simpleTimerInstance.start();
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES);
		}
	});

	test("A SimpleTimer instance must take about 100 ms when its cancel(...) method is called 100 ms after its start(...) method is called and it is in the RUNNING state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		let startTime = Date.now();
		simpleTimerInstance.start();
		await new SimpleTimer(100).start();
		expect(simpleTimerInstance.state).toBe(SimpleTimer.RUNNING);
		simpleTimerInstance.cancel();
		let endTime = Date.now();
		expect((endTime - startTime) / 1000).toBeCloseTo(0.1);
	});

	test("A SimpleTimer instance must have its promise resolve to SimpleTimer.CANCELLED when its cancel(...) method is called and it is in the RUNNING state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		let simpleTimerResult = simpleTimerInstance.start();
		await new SimpleTimer(100).start();
		expect(simpleTimerInstance.state).toBe(SimpleTimer.RUNNING);
		simpleTimerInstance.cancel();
		expect(await simpleTimerResult).toBe(SimpleTimer.CANCELLED);
	});

	test("A SimpleTimer instance must be in the CANCELLED state after its cancel(...) instance method is called", async () => {
		expect.assertions(1);
		let simpleTimerInstance = new SimpleTimer(200);
		simpleTimerInstance.start();
		await new SimpleTimer(100).start();
		simpleTimerInstance.cancel();
		expect(simpleTimerInstance.state).toBe(SimpleTimer.CANCELLED);
	});

	test("A SimpleTimer instance call to its start(...) method must throw an ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES when it is in the CANCELLED state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		simpleTimerInstance.start();
		await new SimpleTimer(100).start();
		simpleTimerInstance.cancel();
		try {
			expect(simpleTimerInstance.state).toBe(SimpleTimer.CANCELLED);
			simpleTimerInstance.start();
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_IN_SET_OR_RUNNING_STATES);
		}
	});

	test("A SimpleTimer instance call to its cancel(...) method must throw an ERROR_SIMPLE_TIMER_NOT_RUNNING when it is in the SET state", () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		try {
			expect(simpleTimerInstance.state).toBe(SimpleTimer.SET);
			simpleTimerInstance.cancel();
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_RUNNING);
		}
	});

	test("A SimpleTimer instance call to its cancel(...) method must throw an ERROR_SIMPLE_TIMER_NOT_RUNNING when it is in the DONE state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		await simpleTimerInstance.start();
		try {
			expect(simpleTimerInstance.state).toBe(SimpleTimer.DONE);
			simpleTimerInstance.cancel();
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_RUNNING);
		}
	});

	test("A SimpleTimer instance call to its cancel(...) method must throw an ERROR_SIMPLE_TIMER_NOT_RUNNING when it is in the CANCELLED state", async () => {
		expect.assertions(2);
		let simpleTimerInstance = new SimpleTimer(200);
		simpleTimerInstance.start();
		await new SimpleTimer(100).start();
		simpleTimerInstance.cancel();
		try {
			expect(simpleTimerInstance.state).toBe(SimpleTimer.CANCELLED);
			simpleTimerInstance.cancel();
		} catch (error) {
			expect(error).toBeInstanceOf(SimpleTimer.errors.ERROR_SIMPLE_TIMER_NOT_RUNNING);
		}
	});
});
