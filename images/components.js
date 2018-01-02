'use strict';

//@author: chuter

;(function (root, NB, React, ReactDOM) {

  'use strict';

  var Formsy = root.Formsy;

  var InlineNBInput = React.createClass({
    displayName: 'InlineNBInput',


    mixins: [Formsy.Mixin],

    propTypes: {
      placeholder: React.PropTypes.string.isRequired
    },

    changeValue: function changeValue(event) {
      this.setValue(event.currentTarget.value);
    },


    render: function render() {
      var className = this.showRequired() ? 'required' : this.showError() ? 'error' : null;
      var errorMessage = this.getErrorMessage();

      return React.createElement(
        'div',null,
        React.createElement(
          'div',
          { className: 'input-panel input-panel--inline ' + className },
          React.createElement('input', { type: 'text', placeholder: this.props.placeholder, onChange: this.changeValue, value: this.getValue() })
        ),
        React.createElement(
          'div',
          { className: 'u-tips--error' },
          errorMessage
        )
      );
    }
  });

  var InputPenalView = React.createClass({
    displayName: 'InputPenalView',


    mixins: [Formsy.Mixin],

    propTypes: {
      label: React.PropTypes.string.isRequired,
      maxLength: React.PropTypes.number.isRequired,
      placeholder: React.PropTypes.string.isRequired,
      tips: React.PropTypes.string.isRequired
    },

    changeValue: function changeValue(event) {
      this.setValue(event.currentTarget.value);
    },


    render: function render() {
      var className = this.showRequired() ? 'required' : this.showError() ? 'error' : null;
      var errorMessage = this.getErrorMessage();

      return React.createElement(
        'section',
        { className: 'formgroup' },
        React.createElement(
          'label',
          { className: 'u-height--42 u-alignTop' },
          React.createElement(
            'h3',
            { className: 'u-fontWeight--normal u-textColorAccent u-alignBlock' },
            this.props.label + ''
          )
        ),
        React.createElement(
          'div',
          { className: 'input-panel ' + className },
          React.createElement('input', { type: 'text', placeholder: this.props.placeholder, onChange: this.changeValue, value: this.getValue() }),
          React.createElement(
            'div',
            { className: 'input--tips' },
            '最多' + this.props.maxLength + '字'
          )
        ),
        React.createElement(
          'div',
          { className: 'u-height--46 u-alignMiddle' },
          React.createElement(
            'span',
            { className: 'u-textColorTips u-alignBlock' },
            this.props.tips + '',
            React.createElement(
              'span',
              { className: 'u-tips--error' },
              errorMessage
            )
          )
        )
      );
    }
  });
	
	
	

  var NBFormView = React.createClass({
    displayName: 'NBFormView',

    getInitialState: function getInitialState() {
      return { canSubmit: false };
    },

    mapInputs: function mapInputs(inputs) {
      return {
        'outward': inputs.outward,
        'mettle': inputs.mettle,
        'achieve': inputs.achieve,
        'company': inputs.company,
        'title': inputs.title,
        'name': inputs.name
      };
    },

    submit: function submit(model) {
      this.props.onSubmit(model);
    },

    enableButton: function enableButton() {
      this.setState({
        canSubmit: true
      });
    },
    disableButton: function disableButton() {
      this.setState({
        canSubmit: false
      });
    },

    render: function render() {
      return React.createElement(
        Formsy.Form,
        { onValidSubmit: this.submit,
          onValid: this.enableButton, onInvalid: this.disableButton,
          mapping: this.mapInputs },
        React.createElement(InputPenalView, {
          name: 'outward',
          validations: 'maxLength:10',
          validationError: '\u8F93\u5165\u957F\u5EA6>10',
          placeholder: 'XX\u5F88X\uFF0CXX\u5F88X',
          maxLength: 10,
          label: '\u5916\u8C8C\u7279\u5F81',
          tips: '\u6848\u4F8B\u53C2\u8003\uFF08\u9152\u7A9D\u5F88\u6DF1\uFF0C\u8BED\u901F\u5F88\u5FEB\uFF09',
          required: true }),
        React.createElement(InputPenalView, {
          name: 'mettle',
          validations: 'maxLength:12',
          validationError: '\u8F93\u5165\u957F\u5EA6>12',
          placeholder: '\u6CA1\u6709XXX\uFF0C\u53EA\u6709XXXX',
          maxLength: 12,
          label: '\u6027\u683C\u7279\u70B9',
          tips: '\u6848\u4F8B\u53C2\u8003\uFF08\u6CA1\u6709\u65F6\u95F4\u8868\uFF0C\u53EA\u6709\u4E0D\u65AD\u8D85\u8D8A\uFF09',
          required: true }),
        React.createElement(InputPenalView, {
          name: 'achieve',
          validations: 'maxLength:20',
          validationError: '\u8F93\u5165\u957F\u5EA6>20',
          placeholder: 'XXXXXXXXXX',
          maxLength: 20,
          label: '\u4E2A\u4EBA\u6210\u5C31',
          tips: '\u6848\u4F8B\u53C2\u8003\uFF08\u5DF2\u6210\u96F7\u5E03\u65AF\uFF09',
          required: true }),
        React.createElement('div', { className: 'u-dividerLine u-dividerLine--H u-marginTop--45 u-marginBottom--30' }),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'u-inlineBLock u-width--340' },
            React.createElement(InlineNBInput, {
              name: 'company',
              validationError: '\u4E0D\u80FD\u4E3A\u7A7A',
              placeholder: '\u8BF7\u8F93\u5165\u516C\u53F8\u540D\u79F0',
              required: true })
          ),
          React.createElement(
            'div',
            { className: 'u-inlineBLock u-width--206 u-marginLeft--16' },
            React.createElement(InlineNBInput, {
              name: 'title',
              validationError: '\u4E0D\u80FD\u4E3A\u7A7A',
              placeholder: '\u8BF7\u8F93\u5165\u804C\u4F4D',
              required: true })
          )
        ),
        React.createElement(
          'div',
          { className: 'u-marginTop--18 u-width--250' },
          React.createElement(InlineNBInput, {
            name: 'name',
            validationError: '\u4E0D\u80FD\u4E3A\u7A7A',
            placeholder: '\u8BF7\u8F93\u5165\u59D3\u540D',
            required: true })
        ),
        React.createElement(
          'button',
          { type: 'submit', className: 'button button--banner u-marginTop--125', disabled: !this.state.canSubmit },
          '\u53BB\u4E0A\u4F20\u7167\u7247'
        )
      );
    }
  });
	
	
	

  var NBForm = function NBForm(options) {
    this.containerEl = options.el;
    this.init(options);
  };

  NBForm.prototype = {
    constructor: NBForm,
    View: NBFormView,

    init: function init(options) {},

    render: function render(options) {
      this.view = ReactDOM.render(React.createElement(this.View, { onSubmit: options.onSubmit }), this.containerEl);
    },

    destroy: function destroy() {
      ReactDOM.unmountComponentAtNode(this.containerEl);
    }
  };

  NB.Component.NBForm = NBForm;
})(self, NB, React || window.React, ReactDOM || window.ReactDOM);