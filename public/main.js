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
		$.get('./views/article.html', function(html) {
			$('.modal-form').html(html);
			var today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newBook').on('click', function() {
		$.get('./views/book.html', function(html) {
			$('.modal-form').html(html);
			var today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newWebsite').on('click', function() {
		$.get('./views/website.html', function(html) {
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

	$('.ref-container').on('click','.ref-edit', function(e) {
		e.preventDefault();
		var id = $(event.target).closest('.ref').attr('id');
		$.ajax({
			url: 'ref/' + id,
			type: 'GET',
			contentType: 'application/json',
			success: function(data) {
				//$("#newModal").modal('toggle');
				$.get('./views/' + data.type.toLowerCase() + '.html', function(html) {
					$('#editModal').modal('show');
					$('#edit-modal-body').html(html);
					var today = new Date();
					$('#year').attr('max', today.getFullYear());
					for(var field in data) {
						if(data.hasOwnProperty(field)) {
							if(field==='authors') {
								// TODO this will be tough
							}
							else if(field==='tags') {
								var tags = data[field].map(function(t) { return t.tag; });
								$('#' + field).attr("value", tags.join(", "));
							}
							else {
								$('#' + field).attr("value", data[field]);
							}
						}
					}
				});
				refreshList();
			}
		});
	});

	$('.modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		var fields = $('.modal-form :input').serializeArray();
		var post = {};
		for(var i=0; i<fields.length;i++) {
			switch(fields[i].name) {
				case 'authors': {
					if(fields[i].value==='') break;
					if(!('authors' in Object.keys(post))) post['authors'] = [];
					var nameField = fields[i].value.split(',');
					if(nameField.length<2) {
						formError('<p>Author name must include last and first name separated by commas</p>');
						$('#authors').focus();
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
					var tags = fields[i].value.split(',');
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
					post[fields[i].name] = fields[i].value;
				}
			}
		};

		$.ajax({
			url: 'refs/',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			//proessData: 'false',
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