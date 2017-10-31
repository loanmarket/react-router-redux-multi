# react-router-redux-multi

[![build status](https://img.shields.io/travis/reactjs/react-router-redux-multi/master.svg?style=flat-square)](https://travis-ci.org/loanmarket/react-router-redux-multi)

> **Keep your state in sync with your *multiple* routers** :sparkles::sparkles::sparkles::sparkles:

This is a fork of [react-router-redux](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux). It retains the same simple API as react-router-redux v5 but adds additional support for using multiple routers.

Use this as a drop-in replacement for react-router-redux when you have multiple routers that you want to sync with your redux store.

## Why fork?

React Router Redux does not allow you to sync multiple routers to your redux store. See this issue: https://github.com/ReactTraining/react-router/issues/5663. This is understandable if you only have a single global router that is linked to your URL history. However, we believe that routers should be more extensible and generic than that. You may also want to use routing logic elsewhere to present components which you do not explicitly want stored in your browers url history. We initially developed this fork as a pull request to generate conversation around the best approaches to implementating support for multiple routers. However, React Redux Router are not willing to support multiple routers, so we have now published this for anyone else who encounters this use case.

## Installation

```
npm install --save react-router-redux-multi
npm install --save history
```

## API

### <ConnectedRouter>

#### props

* `store` (*[Redux Store](http://redux.js.org/docs/api/Store.html)*): The single Redux store in your application.
* `children` (*ReactElement*): The root of your routes.
* `history` (*[History](https://github.com/ReactTraining/history)*): The history instance who's location maps to routes
* `namespace` (*string*): The namespace for to identify the history instance (default: 'default')

### routerMiddleware(history, [namespace])

Redux middle to intercept history actions and update the location in the reducer.
Takes history instance as first argument, and optional namespace string to specify which history object to intercept.

*Usage:*
```js
const middleeare =
const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  applyMiddleware(middleware)
)
```

### routerReducer

The redux reducer for storing router locations. Can store any number of history locations.

State is of the form:
```js
{
  location: {
    default: history.location,
    [namespace]: history.location
  }
}
```

*Usage:*
```js
import ConnectedRouter from '../ConnectedRouter'
import { routerReducer } from '../reducer'

store = createStore(combineReducers({
  router: routerReducer
}))
```

### History Actions

This library exposes all History instances navigation methods (push, replace, go, goBack, goForward) as dispatchable redux actions. For detailed description of these methods look at the [History documentation](https://github.com/ReactTraining/history#navigation).

You can also create actions which target a specific history object by using the namespaced variants.

* `namespacedPush(namespace)(path, [state])`
* `namespacedReplace(namespace)(path, [state])`
* `namespacedGo(namespace)(n)`
* `namespacedGoBack(namespace)()`
* `namespacedGoForward(namespace)()`

These actions will triger state changes only on the history identified by that namespace. The same namespace should be passed to actions, as is passed to ConnectedRouter and routerMiddleware.

Or you create an object with all namespaced actions via `namespacedRouterActions(namespace)`.

*Usage:*
```js
import { push, namespacedPush } from 'react-router-redux'

// Using store directly:
// to target the default router
store.dispatch(push('/foo'))

// or to target another reducer use namespaced actions
pushMemory = namespacedPush('memory')
store.dispatch(pushMemory('/foo'))

// Or via Connect
connect(
  () => {}, // mapStateToProps
  dispatch =>
  bindActionCreators({
    push: push,
    pushToMemory: namespacedPush('/foo'),
  }, dispatch);
)



## Example Usage

Here's a basic idea of how it works:

```js
import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

import reducers from './reducers' // Or wherever you keep your reducers

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory()
const memoryhistory = createMemoryHistory()
const memoryNamespace = 'memory'

// Build the middleware for intercepting and dispatching navigation actions
const middleware = [
  routerMiddleware(history),
  routerMiddleware(memoryhistory, memoryNamespace)
]

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  applyMiddleware(middleware)
)

ReactDOM.render(
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    { /* This router is linked to your URL history */ }
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/topics" component={Topics}/>
      </div>
    </ConnectedRouter>
    { /* This router is stored in memory */ }
    <ConnectedRouter history={memoryHistory} namespace={memoryNamespace}>
      <div>
        <Route path="/animationB" component={AnimationA}/>
        <Route path="/animationA" component={AnimationB}/>
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
```
