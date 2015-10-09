/**
 * @jsx React.DOM
 */

// var React = require('react');
var $ = require('jquery');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');
var classNames = require('classnames');
var validateEmail = require('rfc822-validate');

function _arraysAreDifferent(array1, array2) {
  if (array1.length != array2.length){
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]){
      return true;
    }
  }
}

var singleTokenUpdates = function () {
  var token = $('.token-singleValue');
  var input = $('.typeahead input');

  input.css('padding-left', (token.width() + 14) + 'px' );
  token.focus();

  if (!token.length) {
    input.focus();
  }
};    

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = React.createClass({displayName: "TypeaheadTokenizer",
  componentDidUpdate: singleTokenUpdates,
  componentDidMount: singleTokenUpdates,
  propTypes: {
    name: React.PropTypes.string,
    options: React.PropTypes.array,
    customClasses: React.PropTypes.object,
    allowCustomValues: React.PropTypes.number,
    maxTokens: React.PropTypes.number,
    defaultSelected: React.PropTypes.array,
    defaultValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    initialTokens: React.PropTypes.array,
    inputProps: React.PropTypes.object,
    inputType: React.PropTypes.string,
    onTokenRemove: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onTokenAdd: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    filterOption: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    displayOption: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    maxVisible: React.PropTypes.number,
    defaultClassNames: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: this.props.defaultSelected.slice(0)
    };
  },

  getDefaultProps: function() {
    return {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      maxTokens: -1,
      defaultValue: "",
      inputType: "text",
      placeholder: "",
      initialTokens: [],
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      displayOption: function(token){return token },
      onKeyDown: function(event) {},
      onFocus: function(event) {},
      onBlur: function(event) {},
      onChange: function(event) {},
      onTokenAdd: function() {},
      onTokenRemove: function() {}
    };
  },

  componentWillReceiveProps: function(nextProps){
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)){
      this.setState({selected: nextProps.defaultSelected.slice(0)})
    }
  },

  focus: function(){
    this.refs.typeahead.focus();
  },

  getSelectedTokens: function(){
    return this.state.selected;
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function() {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function(selected, index) {
      var displayString = this.props.displayOption(selected);
      return (
        React.createElement(Token, {key:  displayString, className: classList, 
          onRemove:  this._removeTokenForValue, 
          object: selected,
          parent: this,
          ref: 'token' + index,
          name:  this.props.name}, 
           displayString 
        )
      );
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function() {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function(event) {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }
    this.props.onKeyDown(event);
  },

  _onPaste: function(event) {
    event.preventDefault();

    var emails = event.clipboardData.getData('Text').split(/[\s,;]+/);

    
    emails.map(this._addTokenForValue);
  },

  _handleBackspace: function(event){
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry.getDOMNode();
    if (!entry.value || entry.value.length <= 0) {
      var index = this.state.selected.length - 1;
      React.findDOMNode(this.refs['token' + index]).focus();
      event.preventDefault();
    }
  },

  _removeTokenForValue: function(value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({selected: this.state.selected});
    this.props.onTokenRemove(value);
    return;
  },

  _addTokenForValue: function(value) {
    if (this.props.inputType === 'email' && !validateEmail(value)) {
      return;
    }
    if (this.props.maxTokens >= 0 
      && this.state.selected.length >= this.props.maxTokens) {
      return;
    }
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({selected: this.state.selected});
    this.refs.typeahead.setEntryText("");
    this.props.onTokenAdd(value);
  },

  render: function() {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    var tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;
    var tokenizerClassList = classNames(tokenizerClasses)

    return (
      React.createElement("div", {className: tokenizerClassList}, 
         this._renderTokens(), 
        React.createElement(Typeahead, {ref: "typeahead", 
          className: classList, 
          placeholder: this.props.placeholder, 
          inputProps: this.props.inputProps, 
          allowCustomValues: this.props.allowCustomValues, 
          customClasses: this.props.customClasses, 
          options: this._getOptionsForTypeahead(), 
          defaultValue: this.props.defaultValue,
          inputType: this.props.inputType,
          maxVisible: this.props.maxVisible, 
          onOptionSelected: this._addTokenForValue, 
          onKeyDown: this._onKeyDown, 
          onFocus: this.props.onFocus, 
          onBlur: this.props.onBlur,
          onChange: this.props.onChange,
          onPaste: this._onPaste,
          displayOption: this.props.displayOption, 
          defaultClassNames: this.props.defaultClassNames, 
          filterOption: this.props.filterOption})
      )
    );
  }
});

module.exports = TypeaheadTokenizer;
