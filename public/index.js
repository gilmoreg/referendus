$(function() {
	$('#newArticle').on('click', function() {
		$.get('./addArticle.html', function(html) {
			$('.modal-form').html(html);
			var today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newBook').on('click', function() {
		$.get('./addBook.html', function(html) {
			$('.modal-form').html(html);
			var today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newWebsite').on('click', function() {
		$.get('./addWebsite.html', function(html) {
			$('.modal-form').html(html);
		});
	});

	$('.modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		var fields = $('.modal-form :input').serializeArray();
		var post = {};
		fields.forEach(function(field) {
			switch(field.name) {
				case 'author': {
					if(!('authors' in Object.keys(post))) post['authors'] = [];
					var nameField = field.value.split(',');
					if(nameField.length<2) {
						// TODO error
						return;
					}
					var name = {
						'firstName': nameField[1].trim(),
						'lastName': nameField[0].trim()
					}
					if(nameField.length>=3) name['middleName'] = nameField[2].trim();

					post['authors'].push({'author': name });
					break;
				}
				case 'tags': {

					break;
				}
				default: {
					post[field.name] = field.value;
				}
			}
		});

		$.ajax({
			url: 'refs/',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			proessData: 'false',
			data: JSON.stringify(post),
			success: function(data) {
				console.log('POST response: ', data);
			}
		});
		// TODO: only if submit was successful
		$("#newModal").modal('toggle');
	});
})