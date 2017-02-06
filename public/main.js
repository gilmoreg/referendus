var format = 'apa';

var formError = function(msg) {
	console.log(msg);
	$('.modal-message').hide().html(msg).slideDown(100).delay(5000).fadeOut(100);
}

var buildJSON = function(fields) {
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
					return undefined;
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
	return post;
}

var buildHTML = function(ref) {
	var type = '';
	switch(ref.type) {
		case 'Article': type = '<span class="label label-primary">Article</span>'; break;
		case 'Book': type ='<span class="label label-danger">Book</span>'; break;
		case 'Website': type = '<span class="label label-success">Website</span>'
	}
	var html = '<div class="ref" data-id="' + ref.id + '">'
				+	'<div class="ref-text green col-xs-9">' + type + ' ' + ref.html + '</div>'
				+	'<div class="ref-edit green col-xs-1"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>'
				+ 	'<div class="ref-del green col-xs-1"><i class="fa fa-trash-o" aria-hidden="true"></i></div>'
			+ '</div>';
	return html;
}

var refreshList = function() {
	$('.ref-container').empty();
	$.ajax({
		url: 'refs/' + format,
		type: 'GET',
		contentType: 'application/json',
		success: function(data) {
			data.refs.forEach(function(ref) {
				$('.ref-container').append(buildHTML(ref));
			});
		},
		error: function(msg) {
			console.log('refresh error', msg);
		}
	});
}

// TODO can I avoid duplication in the click functions?
var newModalSubmit = function() {
	$('#refModal .modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		var post = buildJSON($('.modal-form :input').serializeArray());
		$.ajax({
			url: 'refs/',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(post),
			success: function(data) {
				$("#refModal").modal('toggle');
				$('#refModal .modal-form').off('submit');
				refreshList();
			}
			// TODO error
		});
	});
}

var newModal = function() {
	$("#refModal").modal('toggle');
	$('.new-button-row').show();
	$('.submit button').html('Add');
	newModalSubmit();
}

var editModalClick = function(id) {
	$('#refModal .modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		var post = buildJSON($('.modal-form :input').serializeArray());
		post.id = id;
		$.ajax({
			url: 'refs/' + id,
			type: 'PUT',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(post),
			success: function(data) {
				$("#refModal").modal('toggle');
				$('.modal-form').off('submit');
				refreshList();
			}
			// TODO error
		});
	});
}

var editModal = function(id) {
	$.ajax({
		url: 'ref/' + id,
		type: 'GET',
		contentType: 'application/json',
		success: function(data) {
			$.get('./views/' + data.type.toLowerCase() + '.html', function(partial) {
				$('#refModal').modal('show');
				$('.modal-form').html(partial);
				$('.submit button').html('Update');
				$('.new-button-row').hide();
				var today = new Date();
				$('#year').attr('max', today.getFullYear());
				for(var field in data) {
					switch(field) {
						case 'authors': {
							console.log('authors',data[field]);
							if(data[field].length>0) {
								var author = data[field][0].author.lastName + ', ' + data[field][0].author.firstName;
								if(data[field][0].author.middleName) author += ', ' + data[field][0].author.middleName;
								$('#' + field).attr("value", author);
							}
							break;
						}
						case 'tags': {
							var tags = data[field].map(function(t) { return t.tag; });
							$('#' + field).attr("value", tags.join(", "));
							break;
						}
						case 'accessDate': 
						case 'pubDate': {
							console.log('accessDate',data[field]);
							document.getElementById(field).valueAsDate = new Date(data[field]);
							break;
						}
						default: {
							console.log('default',data[field]);
							$('#' + field).attr("value", data[field]);
						}
					}
				}
			});
			editModalClick(id);
		}
		// TODO error
	});
}

var closeDeleteModal = function() {
	$('#deleteModal').hide('modal');
	$('#yesDelete').off('click');
}

var deleteRef = function(id) {
	$.ajax({
		url: 'refs/' + id,
		type: 'DELETE',
		success: function(data) {
			closeDeleteModal();
		},
		error: function(msg) {
			console.log('error deleting', msg);
			closeDeleteModal();
		}
	});
	refreshList();
}

var deleteModal = function(id) {
	$('#deleteModal').show('modal');
	$('#yesDelete').on('click', function(e) {
		deleteRef(id);
	});
}

var testText = function() {
	return "Press, B. (2017). Bacon Press's Big Debut. <i>Journal 12</i>, <i>2</i>, 33-45.<br><br>Mister, T. A. (1970, February 28). Boring, <i>None other than</i>. Retrieved 2017, March 3 from https://whatever.com.Last, F. (2009). <i>Title</i>. Boston: BC.edu.";
}

var copyToClipboard = function() {
	var text = testText();
	clipboard.copy({'text/html':text}).then(
					function(){console.log("success");},
					function(err){console.log("failure", err);}
				);
	$.ajax({
			url: 'refs/' + format,
			type: 'GET',
			contentType: 'application/json',
			success: function(data) {
				data.refs.forEach(function(ref) {
					text += ref.html;
				});
				console.log(text);
				clipboard.copy({'text/html':"<i>text</i>"}).then(
					function(){console.log("success");},
					function(err){console.log("failure", err);}
				);
			},
			error: function(msg) {
				console.log('error copying', msg);
			}
		});
}

$(function() {
	$('#newRef').on('click', function() {
		newModal();
	});

	$('#copy').on('click', function() {
		copyToClipboard();
	});

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

	// TODO can I avoid duplication here?
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

	$('#refModal').on('hide.bs.modal', function () {
		$('#refModal .modal-form').off('submit');
		$('.modal-form').empty();
	});

	$('#deleteModal .close').on('click', function () {
		closeDeleteModal();
	});

	$('#noDelete').on('click', function(e) {
		closeDeleteModal();
	});
	
	// Edit button event handler
	$('.ref-container').on('click','.ref-edit', function(e) {
		e.preventDefault();
		var id = $(event.target).closest('.ref').attr('data-id');
		editModal(id);
	});

	// Delete button event handler
	$('.ref-container').on('click', '.ref-del', function(e) {
		e.preventDefault();
		var id = $(event.target).closest('.ref').attr('data-id');
		deleteModal(id);
	});

	refreshList();	
})

var References = (function() {

	var collection = [];

	var fetchRemote = function(id) {
		var url = '';
		if(id) url = 'ref/' + id;
		else url = 'refs/';
		$.ajax({
			url: this.url,
			type: 'GET',
			contentType: 'application/json',
			success: function(data) {
				return data;
			},
			error: function(msg) {
				console.log('fetchRemote error', msg);
			}
		});
	}

	var createRemote = function(ref) {
		return $.ajax({
			url: 'refs/',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(ref)
		});
	}

	return {
		create: function(ref) {
			createRemote(ref)
				.done(function() {
					console.log('POST success');
					collection.push(ref);
					localStorage.setItem('refs',JSON.stringify(collection));
				})
				.fail(function(msg) {
					console.log('POST error', msg);
				});
		},
		getAll: function() {

		},
		// Clipboard will not allow copying after an AJAX call, so just get what we have
		getAllLocal: function() {
				
		},
		getByID: function(id) {

		},
		update: function(id) {

		},
		delete: function(id) {

		}
	};

}());