var format = 'apa';

var formError = function(msg) {
	console.log(msg);
	$('.modal-message').hide().html(msg).slideDown(100).delay(5000).fadeOut(100);
}

var refreshList = function() {
	$('.ref-container').empty();
	$.ajax({
		url: 'refs/' + format,
		type: 'GET',
		contentType: 'application/json',
		success: function(data) {
			data.refs.forEach(function(ref) {
				var html = '<div class="ref" id="' + ref.id + '">'
							+	'<div class="ref-text green col-xs-9">' + ref.html + '</div>'
							+	'<div class="ref-edit green col-xs-1"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>'
							+ 	'<div class="ref-del green col-xs-1"><i class="fa fa-trash-o" aria-hidden="true"></i></div>'
						+ '</div>';
				$('.ref-container').append(html);
			});
			
		}
	});
}

$(function() {
	$('#newArticle').on('click', function() {
		$.get('./views/addArticle.html', function(html) {
			$('.modal-form').html(html);
			var today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newBook').on('click', function() {
		$.get('./views/addBook.html', function(html) {
			$('.modal-form').html(html);
			var today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newWebsite').on('click', function() {
		$.get('./views/addWebsite.html', function(html) {
			$('.modal-form').html(html);
		});
	});

	$('#APA').on('click', function() {
		format = 'apa';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#Chicago').on('click', function() {
		format = 'chicago';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#MLA').on('click', function() {
		format = 'mla';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('.modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		var fields = $('.modal-form :input').serializeArray();
		var post = {};
		fields.forEach(function(field) {
			switch(field.name) {
				case 'authors': {
					if(field.value==='') break;
					if(!('authors' in Object.keys(post))) post['authors'] = [];
					var nameField = field.value.split(',');
					if(nameField.length<2) {
						formError('<p>Author name must include last and first name separated by commas</p>');
						$('#authors').focus();
						// TODO: the form is still submitting!
						return false;
						break;
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
					var tags = field.value.split(',');
					if(tags.length<1) break;
					if(!('tags' in Object.keys(post))) post['tags'] = [];
					var tagList = [];
					tags.forEach(function(tag) {
						tagList.push( { 'tag':tag.trim() } );
					});
					post['tags'] = tagList;
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
				$("#newModal").modal('toggle');
				refreshList();
				console.log('POST response: ', data);
			}
		});
	});

	refreshList();
	
})