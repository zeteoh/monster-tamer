/**
 * @typedef State
 * @type {Object}
 * @property {string} name
 * @property {()=>void}[onEnter]
 */
export class StateMachine {
  /**
   * @type {Map<string, State>}
   */
  #states;
  /**
   * @type {State | undefined}
   */
  #currentState;
  /**
   * @type {string}
   */
  #id;
  /**
   * @type {Object | undefined}
   */
  #context;
  /**
   * @type {boolean}
   */
  #isChangingState;
  /**
   * @type {string[]}
   */
  #changingStateQueue;
  /**
   *
   * @param {string} id
   * @param {Object} [context]
   */
  constructor(id, context) {
    this.#id = id;
    this.#context = context;
    this.#isChangingState = false;
    this.#changingStateQueue = [];
    this.#currentState = undefined;
    this.#states = new Map();
  }

  /**
   * @type {string | undefined}
   */
  get currentStateName(){
    return this.#currentState?.name 
  }

  update() {
    if (this.#changingStateQueue.length > 0) {
      this.setState(this.#changingStateQueue.shift());
      return;
    }
  }
  /**
   *
   * @param {string} name
   */
  setState(name) {
    const methodName = "setState";
    if (!this.#states.has(name)) {
      console.warn(
        `[${StateMachine.name}-${
          this.#id
        }:${methodName}] tried to change to unknown state: ${name}`
      );
      return;
    }
    if (this.#isCurrentState(name)) {
      return;
    }
    // if the state provided is not our current state, then
    if (this.#isChangingState) {
      this.#changingStateQueue.push(name);
      return;
    }
    // this true will allow us to start transitioning state
    // since other conditions are false
    this.#isChangingState = true;
    console.log(
      `[${StateMachine.name}-${this.#id}:${methodName}] tried to change from ${
        this.#currentState?.name ?? "none"
      } to ${name}`
    );

    this.#currentState = this.#states.get(name);

    if (this.#currentState.onEnter) {
      console.log(
        `[${StateMachine.name}-${
          this.#id
        }:${methodName}] ${this.#currentState.name} on enter invoked`
      );

      this.#currentState.onEnter();
    }
    this.#isChangingState = false;
  }
  /**
   *
   * @param {State} state
   */
  addState(state) {
    this.#states.set(state.name, {
      name: state.name,
      //bind func ensures that the 'this.' refers to the current
      //state and not other states when the onEnter is called
      onEnter: this.#context
        ? state.onEnter?.bind(this.#context)
        : state.onEnter,
    });
  }

  /**
   *
   * @param {string} name
   * @returns {boolean}
   */
  #isCurrentState(name) {
    if (!this.#isCurrentState) {
      return false;
    }
    return this.#isCurrentState.name === name;
  }
}
