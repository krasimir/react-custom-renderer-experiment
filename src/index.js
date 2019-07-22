import ReactDOM from '../react-dom';
import React, { useState, useEffect } from 'react';
import ReactReconciler from 'react-reconciler';
import * as scheduler from 'scheduler';
const {unstable_now: now} = scheduler;

const log = (...args) => {
  console.log(args[0]);
  // console.log(...args);
}

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

function isEventName(propName) {
  return propName.startsWith('on') && window.hasOwnProperty(propName.toLowerCase());
}

function shallowDiff(oldObj, newObj) {
  // Return a diff between the new and the old object
  const uniqueProps = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  const changedProps = Array.from(uniqueProps).filter(
    propName => oldObj[propName] !== newObj[propName]
  );

  return changedProps;
}

function isUppercase(letter) {
  return /[A-Z]/.test(letter);
}

const HostConfig = {
  now,
  getRootHostContext: function(rootInstance) {
    log('getRootHostContext', rootInstance);
    return { rootHostContext: 'yes' };
  },
  getChildHostContext: function(parentHostContext, type, rootInstance) {
    log('getChildHostContext', parentHostContext, type, rootInstance);
    return { childHostContext: 'yes' }
  },
  shouldSetTextContent: function(type, props) {
    log('shouldSetTextContent', type, props);
    return (
      type === 'textarea' ||
      typeof props.children === 'string' ||
      typeof props.children === 'number'
    );
  },
  createTextInstance: function(text, rootContainerInstance, internalInstanceHandle) {
    log('createTextInstance', text, rootContainerInstance, internalInstanceHandle)
    return document.createTextNode(text);
  },
  createInstance: function(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
    log('createInstance', type, props, rootContainerInstance, hostContext, internalInstanceHandle)
    return document.createElement(type);
  },
  appendInitialChild: function(parentInstance, child) {
    log('appendInitialChild', parentInstance, child);
    parentInstance.appendChild(child);
  },
  finalizeInitialChildren: function(domElement, type, props, rootContainerInstance, hostContext) {
    log('finalizeInitialChildren', domElement, type, props, rootContainerInstance, hostContext);
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
        log('propValue', propValue);
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
    log('prepareForCommit', containerInfo)
  },
  resetAfterCommit: function(containerInfo) {
    log('resetAfterCommit', containerInfo)
  },
  appendChildToContainer: function(parentInstance, child) {
    log('appendChildToContainer', parentInstance, child)
    parentInstance.appendChild(child);
  },
  getPublicInstance(inst) {
    log('getPublicInstance', inst)
    return inst;
  },
  prepareUpdate(domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
    log('prepareUpdate', domElement, type, oldProps, newProps, rootContainerInstance, hostContext)
    return shallowDiff(oldProps, newProps);
  },
  appendChild(parentInstance, child) {
    log('appendChild', parentInstance, child)
    parentInstance.appendChild(child);
  },
  removeChildFromContainer(parentInstance, child) {
    log('removeChildFromContainer', parentInstance, child)
    parentInstance.removeChild(child);
  },

  insertBefore(parentInstance, child, beforeChild) {
    log('insertBefore', parentInstance, child)
    parentInstance.insertBefore(child, beforeChild);
  },

  insertInContainerBefore(parentInstance, child, beforeChild) {
    log('insertInContainerBefore', parentInstance, child, beforeChild)
    parentInstance.insertBefore(child, beforeChild);
  },
  commitUpdate(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
    log('commitUpdate', domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle)
    updatePayload.forEach(propName => {
      // children changes is done by the other methods like `commitTextUpdate`
      if (propName === 'children') return;

      if (propName === 'style') {
        // Return a diff between the new and the old styles
        const styleDiffs = shallowDiff(oldProps.style, newProps.style);
        const finalStyles = styleDiffs.reduce((acc, styleName) => {
          // Style marked to be unset
          if (!newProps.style[styleName]) acc[styleName] = '';
          else acc[styleName] = newProps.style[styleName];

          return acc;
        }, {});

        setStyles(domElement, finalStyles);
      } else if (newProps[propName] || typeof newProps[propName] === 'number') {
        if (isEventName(propName)) {
          const eventName = propName.toLowerCase().replace('on', '');
          domElement.removeEventListener(eventName, oldProps[propName]);
          domElement.addEventListener(eventName, newProps[propName]);
        } else {
          domElement.setAttribute(propName, newProps[propName]);
        }
      } else {
        if (isEventName(propName)) {
          const eventName = propName.toLowerCase().replace('on', '');
          domElement.removeEventListener(eventName, oldProps[propName]);
        } else {
          domElement.removeAttribute(propName);
        }
      }
    });
  },
  commitMount(domElement, type, newProps, internalInstanceHandle) {
    log('commitMount', domElement, type, newProps, internalInstanceHandle);
    domElement.focus();
  },

  commitTextUpdate(textInstance, oldText, newText) {
    log('commitTextUpdate', textInstance, oldText, newText);
    textInstance.nodeValue = newText;
  },

  resetTextContent(domElement) {
    log('resetTextContent', domElement);
    domElement.textContent = '';
  },
  scheduleDeferredCallback: scheduler.unstable_scheduleCallback,
  cancelDeferredCallback: scheduler.unstable_cancelCallback,
  schedulePassiveEffects: scheduler.unstable_scheduleCallback,
  cancelPassiveEffects: scheduler.unstable_cancelCallback,
  supportsMutation: true,

  useSyncScheduling: true
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
  const [ counter, setCounter ] = useState(0);
  console.log(counter);
  useEffect(() => {
    setCounter(42);
  }, [])

  return (
    <span style={ { cursor: 'pointer' } } onClick={ () => setCounter(counter + 1) }>
      XXX({ counter })
    </span>
  );
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
// ReactDOM.render(<App />, document.querySelector('#root'));