import React from 'react';
import ReactReconciler from 'react-reconciler';

const HostConfig = {
  now: Date.now,
  getRootHostContext: function(...args) {
    console.log('getRootHostContext', ...args)
  },
  getChildHostContext: function(...args) {
    console.log('getChildHostContext', ...args)
  },
  shouldSetTextContent: function(...args) {
    console.log('shouldSetTextContent', ...args)
  },
  createTextInstance: function(...args) {
    console.log('createTextInstance', ...args)
  },
  createInstance: function(...args) {
    console.log('createInstance', ...args)
  },
  appendInitialChild: function(...args) {
    console.log('appendInitialChild', ...args)
  },
  finalizeInitialChildren: function(...args) {
    console.log('finalizeInitialChildren', ...args)
  },
  prepareForCommit: function(...args) {
    console.log('prepareForCommit', ...args)
  },
  resetAfterCommit: function(...args) {
    console.log('resetAfterCommit', ...args)
  },
  appendChildToContainer: function(...args) {
    console.log('appendChildToContainer', ...args)
  },
  supportsMutation: true
}
const ReactReconcilerInst = ReactReconciler(HostConfig);
var rootContainer;

const Banana = {
  render: (reactElement, domElement, callback) => {
    // Create a root Container if it doesn't exist
    if (!rootContainer) {
      rootContainer = ReactReconcilerInst.createContainer(domElement, false);
    }

    // update the root Container
    return ReactReconcilerInst.updateContainer(reactElement, rootContainer, null, callback);
  }
};

function Foo({ children }) {
  return <p>Foo{ children }</p>;
}
function App() {
  return (
    <Foo>
      Bar
    </Foo>
  );
}

Banana.render(<App />, document.querySelector('#root'));