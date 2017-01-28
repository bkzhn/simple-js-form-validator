'use strict';

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
  $(form).submit(function(e) {
    if (!$(this).validateForm()) {
      e.preventDefault();
    }
  });

  validatePassword();

  $(form).find('.validate').each(function() {
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
function validateField(inputField, next) {
  var isValid = true;
  var data = $(inputField).attr('data-valid').split(' ');

  for (var i = 0; i < data.length; i++) {
    var param = data[i].split('-');

    switch (param[0]) {
      case 'not_empty':
        var isInvalid = $(inputField).val().length == 0 || typeof $(inputField).val().length == 'undefined';

        if (toggleError(inputField, isInvalid, errorMessages.empty)) {
          return false;
        }
        break;
      case 'no_spaces':
        var isInvalid = /\s/g.test($(inputField).val());

        if (toggleError(inputField, isInvalid, errorMessages.noSpaces)) {
          return false;
        }
        break;
      case 'maxl':
        var isInvalid = $(inputField).val().length > param[1];

        if (toggleError(inputField, isInvalid, errorMessages.tooLong)) {
          return false;
        }
        break;
      case 'minl':
        var isInvalid = $(inputField).val().length < param[1];

        if (toggleError(inputField, isInvalid, errorMessages.tooShort)) {
          return false;
        }
        break;
      case 'is_numeric':
        var isInvalid = !$.isNumeric($(inputField).val());

        if ($(inputField).val() == null) {
          isInvalid = false;
        }

        if (toggleError(inputField, isInvalid, errorMessages.notNumeric)) {
          return false;
        }
        break;
      case 'not_greater_than':
        var isInvalid = parseInt($(inputField).val()) > $('#' + param[1]).val();

        if (toggleError(inputField, isInvalid, greater_than + param[2])) {
          return false;
        }
        break;
      case 'not_less_than':
        var isInvalid = parseInt($(inputField).val()) < $('#' + param[1]).val();

        if (toggleError(inputField, isInvalid, errorMessages.lessThan + param[2])) {
          return false;
        }
        break;
      case 'not_zero':
        var isInvalid = $(inputField).val() == 0;

        if (toggleError(inputField, isInvalid, errorMessages.greaterThanZero)) {
          return false;
        }
        break;
      case 'email':
        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        var isInvalid = !pattern.test($(inputField).val());

        if (toggleError(inputField, isInvalid, errorMessages.invalidEmail)) {
          return false;
        }
        break;
      case 'checked':
        var isInvalid = !$(inputField).is(':checked');

        if (toggleError(inputField, isInvalid, errorMessages.isNotChecked)) {
          return false;
        }
        break;
      case 'ajax':
        var mydata;

        $.when($.ajax({
          type: 'POST',
          data: {
            param: $(inputField).attr('name'),
            value: $(inputField).val()
          },
          url: siteUrl + 'validate',
          success: function(ajax_data) {
            mydata = ajax_data;
          }
          }))
          .then(function() {
            if (toggleError(inputField, mydata == 1, exist)) {
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
function toggleError(obj, err, txt) {
  if (err) {
    $(obj).addClass('has-error');

    if ($(obj).hasClass('has-success')) {
      $(obj).removeClass('has-success');
    }

    if (!$(obj).next().hasClass('msg')) {
      $('<span class="msg msg-' + $(obj).attr('id') + '">' + txt + '</span>').insertAfter($(obj)).show();
      $(obj).focus();
    } else if ($(obj).next().hasClass('msg')) {
      $(obj).next('.msg').html(txt);
    }
  } else if (!err) {
    $(obj).addClass('has-success');

    if ($(obj).hasClass('has-error')) {
      $(obj).removeClass('has-error');
    }

    if ($(obj).next().hasClass('msg')) {
      $(obj).next('.msg-' + $(obj).attr('id')).remove();
    }
  }

  return err;
}

// Функция валидирующая по полю пароля и подтверждения
function validatePassword() {
  $('#password').bind('keyup blur', function() {
    var isInvalid = /\s/g.test($(this).val());

    if (!isInvalid) {
      isInvalid = $(this).val().length < 6;

      if (toggleError($(this), isInvalid, errorMessages.shortPassword)) {
        return false;
      }
    } else {
      if (toggleError($(this), isInvalid, errorMessages.noSpaces)) {
        return false;
      }
    }
  });

  $('#password_confirm').keyup(function() {
    var isInvalid = /\s/g.test($(this).val());

    if (!isInvalid) {
      isInvalid = $('#password').val() != $(this).val();

      if (toggleError($(this), isInvalid, errorMessages.passwordsDontMatch)) {
        return false;
      }
    } else {
      if (toggleError($(this), isInvalid, errorMessages.noSpaces)) {
        return false;
      }
    }
  });
}
