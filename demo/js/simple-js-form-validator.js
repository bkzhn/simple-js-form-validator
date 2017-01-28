'use strict';

if (typeof jQuery == 'undefined') {
  throw new Error('jQuery is not defined');
}

var errorMessages = {
  empty: 'Field is empty',
  tooLong: 'Value is too long',
  tooShort: 'Value is too short',
  shortPassword: 'Must be at least 6 symbols',
  passwordsDontMatch: 'Passwords do not match',
  notNumeric: 'Value is not numeric',
  invalidEmail: 'Invalid email',
  alreadyExists: 'Already exists',
  isNotChecked: 'Please select',
  lessThan: 'Value is less than ',
  greaterThan: 'Value is greater than ',
  greaterThanZero: 'Value must be greater than 0',
  noSpaces: 'Please, remove spaces'
};

// main function
function simpleFormValidator(form) {
  var $form = $(form);

  $form.submit(function(e) {
    if (!$(this).validateForm()) {
      e.preventDefault();
    }
  });

  validatePassword($('#password'), $('#password_confirm'));

  $form.find('.validate')
    .each(function() {
      $(this).on('blur', function() {
        validateField(this);
      });
  });
}

// function that checks fields of the form
jQuery.fn.validateForm = function() {
  var result = true;

  $(this).find('.validate')
    .each(function() {
      result = validateField(this);

      if (result == false) {
        return false;
      }
    });

  return result;
};

// function that checks a field
function validateField(inputField) {
  var isInvalid;
  var isValid = true;

  var $inputField = $(inputField);
  var data = $inputField.attr('data-valid').split(' ');

  for (var i = 0; i < data.length; i++) {
    var param = data[i].split('-');

    switch (param[0]) {
      case 'not_empty':
        isInvalid = $inputField.val().length == 0 || typeof $inputField.val().length == 'undefined';

        if (toggleError($inputField, isInvalid, errorMessages.empty)) {
          return false;
        }
        break;
      case 'no_spaces':
        isInvalid = /\s/g.test($inputField.val());

        if (toggleError($inputField, isInvalid, errorMessages.noSpaces)) {
          return false;
        }
        break;
      case 'maxl':
        isInvalid = $inputField.val().length > param[1];

        if (toggleError($inputField, isInvalid, errorMessages.tooLong)) {
          return false;
        }
        break;
      case 'minl':
        isInvalid = $inputField.val().length < param[1];

        if (toggleError($inputField, isInvalid, errorMessages.tooShort)) {
          return false;
        }
        break;
      case 'is_numeric':
        isInvalid = !$.isNumeric($inputField.val());

        if ($inputField.val() == null) {
          isInvalid = false;
        }

        if (toggleError($inputField, isInvalid, errorMessages.notNumeric)) {
          return false;
        }
        break;
      case 'not_greater_than':
        isInvalid = parseInt($inputField.val()) > $('#' + param[1]).val();

        if (toggleError($inputField, isInvalid, greater_than + param[2])) {
          return false;
        }
        break;
      case 'not_less_than':
        isInvalid = parseInt($inputField.val()) < $('#' + param[1]).val();

        if (toggleError($inputField, isInvalid, errorMessages.lessThan + param[2])) {
          return false;
        }
        break;
      case 'not_zero':
        isInvalid = $inputField.val() == 0;

        if (toggleError($inputField, isInvalid, errorMessages.greaterThanZero)) {
          return false;
        }
        break;
      case 'email':
        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        isInvalid = !pattern.test($inputField.val());

        if (toggleError($inputField, isInvalid, errorMessages.invalidEmail)) {
          return false;
        }
        break;
      case 'checked':
        isInvalid = !$inputField.is(':checked');

        if (toggleError($inputField, isInvalid, errorMessages.isNotChecked)) {
          return false;
        }
        break;
      case 'ajax':
        var mydata;

        $.when($.ajax({
          type: 'POST',
          data: {
            param: $inputField.attr('name'),
            value: $inputField.val()
          },
          url: siteUrl + 'validate',
          success: function(ajaxData) {
            mydata = ajaxData;
          }
          }))
          .then(function() {
            if (toggleError($inputField, mydata == 1, exist)) {
              return false;
            }
          }
        );
        break;
      }
    }

  return true;
}

// function to show or hide error messages
function toggleError($element, isError, text) {
  if (isError) {
    $element.addClass('has-error');

    if ($element.hasClass('has-success')) {
      $element.removeClass('has-success');
    }

    if (!$element.next().hasClass('msg')) {
      $('<span class="msg msg-' + $element.attr('id') + '">' + text + '</span>').insertAfter($element).show();
      $element.focus();
    } else if ($element.next().hasClass('msg')) {
      $element.next('.msg').html(text);
    }
  } else if (!isError) {
    $element.addClass('has-success');

    if ($element.hasClass('has-error')) {
      $element.removeClass('has-error');
    }

    if ($element.next().hasClass('msg')) {
      $element.next('.msg-' + $element.attr('id')).remove();
    }
  }

  return isError;
}

// function that validates password
function validatePassword($password, $passwordConfirm) {
  $password.bind('keyup blur', function() {
    var $this = $(this);
    var isInvalid = /\s/g.test($this.val());

    if (!isInvalid) {
      isInvalid = $this.val().length < 6;

      if (toggleError($this, isInvalid, errorMessages.shortPassword)) {
        return false;
      }
    } else {
      if (toggleError($this, isInvalid, errorMessages.noSpaces)) {
        return false;
      }
    }
  });

  $passwordConfirm.keyup(function() {
    var $this = $(this);
    var isInvalid = /\s/g.test($this.val());

    if (!isInvalid) {
      isInvalid = $password.val() != $this.val();

      if (toggleError($this, isInvalid, errorMessages.passwordsDontMatch)) {
        return false;
      }
    } else {
      if (toggleError($this, isInvalid, errorMessages.noSpaces)) {
        return false;
      }
    }
  });
}
