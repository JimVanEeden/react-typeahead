/**
 * @jsx React.DOM
 */

// var React = require('react');
var classNames = require('classnames');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({displayName: "Token",
  propTypes: {
    className: React.PropTypes.string,
    name: React.PropTypes.string,
    children: React.PropTypes.string,
    parent: React.PropTypes.object,
    object: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object,
    ]),
    onRemove: React.PropTypes.func
  },

  render: function() {
    var className = classNames([
      "typeahead-token",
      this.props.className
    ]);

    return (
      React.createElement("div", {className: className, tabIndex: 0, onKeyDown: this._removeHandler}, 
        this._renderHiddenInput(), 
        this.props.children, 
        this._renderCloseButton()
      )
    );
  },

  _renderHiddenInput: function() {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return (
      React.createElement("input", {
        type: "hidden", 
        name:  this.props.name + '[]', 
        value:  this.props.object}
      )
    );
  },

  _removeHandler: function (event) {
    event.preventDefault();

    if (event.type === 'click' 
      || event.keyCode === 8 
      || event.keyCode === 46) { // only on delete or backspace or click
      this.props.onRemove(this.props.object);
      this.props.parent.focus();
    }
  },

  _renderCloseButton: function() {
    if (!this.props.onRemove) {
      return "";
    }
    return (
      React.createElement("a", {className: "typeahead-token-close", 
        href: "#", 
        tabIndex: -1, 
        onClick: this._removeHandler
      }, "×")
    );
  }
});

module.exports = Token;
