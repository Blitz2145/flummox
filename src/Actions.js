'use strict';

import arrayIncludes from './arrayIncludes';

/**
 * Actions
 *
 * Instances of the Actions class represent a set of actions. (In Flux parlance,
 * these might be more accurately denoted as Action Creators, while Action
 * refers to the payload sent to the dispatcher, but this is... confusing. We
 * will use Action to mean the function you call to trigger a dispatch.)
 *
 * Create actions by extending from the base Actions class and adding methods.
 * All methods on the prototype (except the constructor) will be
 * converted into actions. The return value of an action is used as the body
 * of the payload sent to the dispatcher.
 */
export default class Actions {

  constructor() {

    this._actions = new Map();
    this._constants = {};

    for (let methodName of this._getActionMethodNames()) {
      let constant = Symbol(methodName);

      this._actions.set(constant, action);
      this._constants[methodName] = constant;

      let action = this._wrapAction(methodName);
    }
  }

  getConstants() {
    return Object.assign({}, this._constants);
  }

  _getActionMethodNames(instance) {
    return Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(name =>
        typeof this[name] === 'function' &&
        !arrayIncludes(RESERVED_METHOD_NAMES, name)
      );
  }

  _wrapAction(methodName) {
    let originalMethod = this[methodName];
    let actionId = this._getActionId(methodName);

    let action = (...args) => {
      let body = originalMethod.call(this, ...args);

      try {
        this._dispatch(actionId, body);
      } catch(error) {
        if (error.message ===
          'Attempted to perform action before adding to Flux instance'
        ) {

          throw new ReferenceError(
            `You've attempted to perform the action `
          + `${this.constructor.name}#${methodName}, but it hasn't been added `
          + `to a Flux instance.`
          );

        } else {
          throw error;
        }
      }
    };

    this[methodName] = action;
  }

  _getActionId(methodName) {
    return this._constants[methodName];
  }

  _dispatch(actionId, body) {
    if (!this.flux) throw new ReferenceError(
      'Attempted to perform action before adding to Flux instance'
    );

    this.flux.dispatch({ actionId, body });
  }

}

const RESERVED_METHOD_NAMES = [
  'constructor',
  '_actions',
  '_constants',
  'flux',
  'getConstants',
  '_getActionMethodNames',
  '_wrapAction',
  '_getActionId',
  '_dispatch',
];
