import React from 'react';

import WidgetWrapper from './WidgetWrapper';
import AbstractMerkurComponent from './AbstractMerkurComponent';

export default class MerkurSlot extends AbstractMerkurComponent {
  /**
   * Returns access to current slot properties, based on it's name
   * passed in props.
   */
  get slot() {
    const { widgetProperties, slotName } = this.props;

    return (
      (widgetProperties &&
        widgetProperties.slots &&
        widgetProperties.slots[slotName]) ||
      null
    );
  }

  /**
   * @inheritdoc
   */
  get html() {
    return this.slot?.html || null;
  }

  /**
   * @inheritdoc
   */
  get container() {
    return (
      (this._isClient() &&
        document?.querySelector(this.slot?.containerSelector)) ||
      null
    );
  }

  /**
   * The component should update only in following cases:
   *  1) Component has no props.widgetProperties.
   *  2) Widget properties changed (name or version).
   *
   * @param {object} nextProps
   */
  shouldComponentUpdate(nextProps) {
    if (
      !this.props.widgetProperties ||
      AbstractMerkurComponent.hasWidgetChanged(
        this.props.widgetProperties,
        nextProps.widgetProperties
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Cleanup when we receive empty widget properties.
   *
   * @param {object} prevProps
   * @param {object} prevState
   */
  componentDidUpdate(prevProps) {
    const { widgetProperties: currentWidgetProperties } = this.props;
    const { widgetProperties: prevWidgetProperties } = prevProps;

    if (!currentWidgetProperties && prevWidgetProperties) {
      this._removeSlot();

      return;
    }
  }

  /**
   * Cleanup when unmounting
   */
  componentWillUnmount() {
    this._removeSlot();
  }

  /**
   * There are two possible outputs from the render method:
   *  1) Fallback is rendered only, when there are no widget properties.
   *  2) WidgetWrapper is rendered in case of SSR (on server-side),
   *     SSR hydrate - with server-side rendered HTML and on client
   *     (SPA) without HTML.
   *
   * @return {React.ReactElement|null}
   */
  render() {
    const { widgetProperties } = this.props;

    if (!widgetProperties || !this.slot) {
      return this._renderFallback();
    }

    /**
     * In case of SPA rendering, we render fallback (which can also display
     * loading placeholders) inside the component wrapper, until the widget
     * assets are loaded and mounted, which results in overriding the contents
     * of the wrapper (containing fallback) with slot markup. In case of SPA
     * we also don't want to render html to prevent FOUC.
     */
    const isInitialSPARender = this._isClient() && !this._isSSRHydrate();
    const html = isInitialSPARender ? '' : this._getWidgetHTML();

    return (
      <WidgetWrapper
        containerSelector={this.slot.containerSelector}
        html={html}>
        {isInitialSPARender && this._renderFallback()}
      </WidgetWrapper>
    );
  }

  /**
   * Cleanup after slot removal.
   */
  _removeSlot() {
    this._clearCachedHtml();
  }
}
