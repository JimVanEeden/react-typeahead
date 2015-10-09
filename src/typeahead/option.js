/**
 * @jsx React.DOM
 */

// var React = require('react');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = React.createClass({displayName: "TypeaheadOption",
  propTypes: {
    entryValue: React.PropTypes.string,
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    onClick: React.PropTypes.func,
    children: React.PropTypes.string,
    hover: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      customClasses: {},
      onClick: function(event) {
        event.preventDefault();
      }
    };
  },

  render: function() {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    return (
      React.createElement("li", {className: classList, onClick: this._onClick}, 
        React.createElement("a", {href: "javascript: void 0;", className: this._getClasses(), ref: "anchor"}, 
           this._getOptionText(this.props.children)
        )
      )
    );
  },

  _getOptionText: function (option) {

    var i = -1,
        indices = [],
        parts = [],
        entryValue = this.props.entryValue;

    if (option.indexOf(entryValue) < 0) {
      return React.createElement("span", {}, option);
    }

    while((i=option.indexOf(entryValue, i+1)) >= 0) {
      indices.push(i);
    }
    indices.push(option.length);

    parts.push(React.createElement("span", {key: -1}, option.slice(0, indices[0])));
    indices.every(function (i, index) {
      parts.push(React.createElement("span", {key: i, className: 'matched'}, option.slice(i, i + entryValue.length)));
      parts.push(React.createElement("span", {key: i + 1}, option.slice(i + entryValue.length, indices[index + 1])));
      if (index >= indices.length - 2) {
        return false;
      }
      return true;
    });

    return parts;
  },

  _getClasses: function() {
    var classes = {
      "typeahead-option": true,
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function(event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});


module.exports = TypeaheadOption;
