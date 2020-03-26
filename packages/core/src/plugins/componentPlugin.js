import { setDefaultValueForUndefined } from '../utils';

export function componentPlugin() {
  return {
    async setup(widget, widgetDefinition) {
      let {
        info,
        bootstrap,
        load,
        mount,
        unmount,
        update,
        ...widgetProperties
      } = widgetDefinition;

      const lifeCycle = {
        info,
        bootstrap,
        load,
        mount,
        unmount,
        update,
      };

      widget.$in.component = {
        lifeCycle,
        isMounted: false,
      };

      widget = {
        ...widgetProperties,
        ...componentAPI(),
        ...widget,
      };

      setDefaultValueForUndefined(widget, ['props', 'state']);

      return widget;
    },
    create() {
      // @TODO bind events
    },
  };
}

async function callLifeCycleMethod(widget, methodName, args) {
  const { lifeCycle } = widget.$in.component;

  if (typeof lifeCycle[methodName] === 'function') {
    return lifeCycle[methodName](widget, ...args);
  }
}

function componentAPI() {
  return {
    async info(widget, ...args) {
      const { name, version, props, state, assets } = widget;
      const componentInfo =
        (await callLifeCycleMethod(widget, 'info', args)) || {};

      return { name, version, props, state, assets, ...componentInfo };
    },
    async mount(widget, ...args) {
      await widget.bootstrap(...args);
      await widget.load(...args);

      const html = callLifeCycleMethod(widget, 'mount', args);
      widget.$in.component.isMounted = true;

      return html;
    },
    async unmount(widget, ...args) {
      return callLifeCycleMethod(widget, 'unmount', args);
    },
    async bootstrap(widget, ...args) {
      return callLifeCycleMethod(widget, 'bootstrap', args);
    },
    async load(widget, ...args) {
      if (widget.state && Object.keys(widget.state).length !== 0) {
        return;
      }

      widget.state = await callLifeCycleMethod(widget, 'load', args);
    },
    async update(widget, ...args) {
      if (!widget.$in.component.isMounted) {
        return;
      }

      return callLifeCycleMethod(widget, 'update', args);
    },
    async setState(widget, state) {
      widget.state = { ...widget.state, ...state };

      return widget.update();
    },
    async setProps(widget, props) {
      widget.props = { ...widget.props, ...props };

      return widget.update();
    },
  };
}