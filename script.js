$(document).ready(function () {
    // Create and append new key-value pair
    function createKeyValuePair() {
      var template = $('#key-value-template').html();
      var element = $(template);
      element.find('.remove-btn').on('click', function () {
        $(this).closest('.key-value-pair').remove();
      });
      return element;
    }

    // Add initial key-value pairs
    $('#query-params-container').append(createKeyValuePair());
    $('#request-headers-container').append(createKeyValuePair());

    // Setup CodeMirror editors
    var requestEditor = CodeMirror.fromTextArea(document.getElementById('json-request-body'), {
      mode: 'application/json',
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2
    });

    var responseEditor = CodeMirror.fromTextArea(document.getElementById('json-response-body'), {
      mode: 'application/json',
      lineNumbers: true,
      readOnly: true,
      tabSize: 2,
      indentUnit: 2
    });

    // Form submit event
    $('#api-form').on('submit', function (e) {
      e.preventDefault();

      var url = $('#url').val();
      var method = $('#method').val();

      var queryParams = {};
      $('#query-params-container .key-value-pair').each(function () {
        var key = $(this).find('.key').val();
        var value = $(this).find('.value').val();
        if (key) {
          queryParams[key] = value;
        }
      });

      var headers = {};
      $('#request-headers-container .key-value-pair').each(function () {
        var key = $(this).find('.key').val();
        var value = $(this).find('.value').val();
        if (key) {
          headers[key] = value;
        }
      });

      var data;
      try {
        data = JSON.parse(requestEditor.getValue() || '{}');
      } catch (e) {
        alert('JSON data is malformed');
        return;
      }

      axios({
        url: url,
        method: method,
        params: queryParams,
        headers: headers,
        data: data
      })
        .then(function (response) {
          $('#response-section').removeClass('d-none');
          $('#status').text(response.status);
          $('#time').text(response.headers['x-response-time']);
          $('#size').text(prettyBytes(JSON.stringify(response.data).length + JSON.stringify(response.headers).length));
          responseEditor.setValue(JSON.stringify(response.data, null, 2));
          $('#response-headers').empty();
          $.each(response.headers, function (key, value) {
            $('#response-headers').append('<div>' + key + '</div><div>' + value + '</div>');
          });
        })
        .catch(function (error) {
          console.error(error);
        });
    });

    // Add buttons event listeners
    $('#add-query-param-btn').on('click', function () {
      $('#query-params-container').append(createKeyValuePair());
    });

    $('#add-request-header-btn').on('click', function () {
      $('#request-headers-container').append(createKeyValuePair());
    });
  });