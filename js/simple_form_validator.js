var empty = 'Поле пусто';
var too_long = 'Слишком длинное значение';
var too_short = 'Слишком короткое значение';
var password_short = 'Не менее 6 символов';
var not_match = 'Пароли не совпадают';
var not_numeric = 'Не числовое значение';
var email = 'Не соответствует шаблону';
var exist = 'Уже существует';
checked = 'Выберите пункт';
var less_than = 'Значение меньше ';
var greater_than = 'Значение больше ';
var not_zero = 'Значение должно быть больше 0'


// Основная функция
function simple_form_validator(the_form) {
    $(the_form).submit(function (e) {
        if (!$(this).form_validate())
            e.preventDefault();
    });
    
    password_validator();
    
    $(the_form).find('.validate').each(function () {
        $(this).on('blur', function () {
            field_validate(this);
        });
    });
} // simple_form_validator()


// Функция проходящая по всем полям формы
jQuery.fn.form_validate = function () {
    var result = true;
    
    $(this).find('.validate').each(function () {
        result = field_validate(this);
        
        if (result == false) return false;
    });
    return result;
};


// Функция непосредственой проверки поля
function field_validate(input_field, next) {
    var validation_result = true;
    var data = $(input_field).attr('data-valid').split(' ');
    
    for (var i = 0; i < data.length; i++) {
        var param = data[i].split('-');
        
        switch (param[0]) {
            case 'not_empty':
                var is_invalid = $(input_field).val().length == 0 || typeof $(input_field).val().length == 'undefined';
                if (toggle_error(input_field, is_invalid, empty)) return false;
                break;
            case 'maxl':
                var is_invalid = $(input_field).val().length > param[1];
                if (toggle_error(input_field, is_invalid, too_long)) return false;
                break;
            case 'minl':
                var is_invalid = $(input_field).val().length < param[1];
                if (toggle_error(input_field, is_invalid, too_short)) return false;
                break;
            case 'is_numeric':
                var is_invalid = !$.isNumeric($(input_field).val());
                if ($(input_field).val() == null) is_invalid = false;
                if (toggle_error(input_field, is_invalid, not_numeric)) return false;
                break;
            case 'not_greater_than':
                var is_invalid = $(input_field).val() > $('#' + param[1]).val();
                if (toggle_error(input_field, is_invalid, greater_than + param[2])) return false;
                break;
            case 'not_less_than':
                var is_invalid = $(input_field).val() < $('#' + param[1]).val();
                if (toggle_error(input_field, is_invalid, less_than + param[2])) return false;
                break;
            case 'not_zero':
                var is_invalid = $(input_field).val() == 0;
                if (toggle_error(input_field, is_invalid, not_zero)) return false;
                break;
            case 'email':
                var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                var is_invalid = !pattern.test($(input_field).val());
                if (toggle_error(input_field, is_invalid, email)) return false;
                break;
            case 'checked':
                var is_invalid = !$(input_field).is(':checked');
                if (toggle_error(input_field, is_invalid, checked)) return false;
                break;
            case 'ajax':
                var mydata;
                $.when($.ajax({
                    type: "POST",
                    data: {
                        param: $(input_field).attr('name'),
                        value: $(input_field).val()
                    },
                    url: siteUrl + 'validate',
                    success: function (ajax_data) {
                        mydata = ajax_data;
                    }
                })
                ).then(function () {
                    if (toggle_error(input_field, mydata == 1, exist)) return false;
                });
                break;
        }
    } // for loop
    return true;
} // field_validate()


// Функция показа | скрытия текста ошибки
function toggle_error(obj, err, txt) {
    if (err) {
        $(obj).addClass('has-error');
        
        if ($(obj).hasClass('has-success')) $(obj).removeClass('has-success');
        
        if (!$(obj).next().hasClass('msg')) {
            $('<span class="msg msg-' + $(obj).attr('id') + '">' + txt + '</span>').insertAfter($(obj)).show();
            $(obj).focus();
        } else if ($(obj).next().hasClass('msg')) {
            $(obj).next('.msg').html(txt);
        }
    } else if (!err) {
        $(obj).addClass('has-success');
        
        if ($(obj).hasClass('has-error')) $(obj).removeClass('has-error');
        
        if ($(obj).next().hasClass('msg')) $(obj).next('.msg-' + $(obj).attr('id')).remove();
    }
    return err;
} // toggle_error()


// Функция валидирующая по полю пароля и подтверждения
function password_validator() {
    $('#password').bind('keyup blur', function () {
        var is_invalid = $(this).val().length < 6;
        if (toggle_error($(this), is_invalid, password_short)) return false;
    });
    
    $('#password_confirm').keyup(function () {
        var is_invalid = $('#password').val() != $(this).val();
        if (toggle_error($(this), is_invalid, not_match)) return false;
    });
} // password_validator()
