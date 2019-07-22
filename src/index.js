import React from 'react';
import ReactReconciler from 'react-reconciler';

function setStyles(domElement, styles) {
  Object.keys(styles).forEach(name => {
    const rawValue = styles[name];
    const isEmpty = rawValue === null || typeof rawValue === 'boolean' || rawValue === '';

    // Unset the style to its default values using an empty string
    if (isEmpty) domElement.style[name] = '';
    else {
      const value =
        typeof rawValue === 'number' && !isUnitlessProperty(name) ? `${rawValue}px` : rawValue;

      domElement.style[name] = value;
    }
  });
}

const HostConfig = {
  now: Date.now,
  getRootHostContext: function(rootInstance) {
    console.log('getRootHostContext', rootInstance);
    return { rootHostContext: 'yes' };
  },
  getChildHostContext: function(parentHostContext, type, rootInstance) {
    console.log('getChildHostContext', parentHostContext, type, rootInstance);
    return { childHostContext: 'yes' }
  },
  shouldSetTextContent: function(type, props) {
    console.log('shouldSetTextContent', type, props);
    return (
      type === 'textarea' ||
      typeof props.children === 'string' ||
      typeof props.children === 'number'
    );
  },
  createTextInstance: function(text, rootContainerInstance, internalInstanceHandle) {
    console.log('createTextInstance', text, rootContainerInstance, internalInstanceHandle)
    return document.createTextNode(text);
  },
  createInstance: function(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
    console.log('createInstance', type, props, rootContainerInstance, hostContext, internalInstanceHandle)
    return document.createElement(type);
  },
  appendInitialChild: function(parentInstance, child) {
    console.log('appendInitialChild', parentInstance, child);
    parentInstance.appendChild(child);
  },
  finalizeInitialChildren: function(domElement, type, props, rootContainerInstance, hostContext) {
    console.log('finalizeInitialChildren', domElement, type, props, rootContainerInstance, hostContext);
    // Set the prop to the domElement
    Object.keys(props).forEach(propName => {
      const propValue = props[propName];

      if (propName === 'style') {
        setStyles(domElement, propValue);
      } else if (propName === 'children') {
        // Set the textContent only for literal string or number children, whereas
        // nodes will be appended in `appendChild`
        if (typeof propValue === 'string' || typeof propValue === 'number') {
          domElement.textContent = propValue;
        }
      } else if (propName === 'className') {
        domElement.setAttribute('class', propValue);
      } else if (isEventName(propName)) {
        const eventName = propName.toLowerCase().replace('on', '');
        domElement.addEventListener(eventName, propValue);
      } else {
        domElement.setAttribute(propName, propValue);
      }
    });

    // Check if needs focus
    switch (type) {
      case 'button':
      case 'input':
      case 'select':
      case 'textarea':
        return !!props.autoFocus;
    }

    return false;
  },
  prepareForCommit: function(containerInfo) {
    console.log('prepareForCommit', containerInfo)
  },
  resetAfterCommit: function(containerInfo) {
    console.log('resetAfterCommit', containerInfo)
  },
  appendChildToContainer: function(parentInstance, child) {
    console.log('appendChildToContainer', parentInstance, child)
    parentInstance.appendChild(child);
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

function XXX() {
  return <span>XXX</span>;
}
function Foo({ children }) {
  return <p>Foo{ children }<XXX /></p>;
}
function App() {
  return (
    <Foo>
      App
    </Foo>
  );
}

Banana.render(<App />, document.querySelector('#root'));