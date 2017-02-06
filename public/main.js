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
	References.getAll().then( (data) => {
		console.log('refreshList',data);
		data.refs.forEach(function(ref) {
			$('.ref-container').append(buildHTML(ref));
		});
	}, (msg) => { console.log('refreshList() error', msg); });
}

var newModalSubmit = function() {
	$('#refModal .modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		var post = buildJSON($('.modal-form :input').serializeArray());
		References.create(post).then( (data) => {
			console.log('newModalSubmit', data);
			$("#refModal").modal('toggle');
			$('#refModal .modal-form').off('submit');
			refreshList();
		}, (msg) => { console.log('newModalSubmit() error', msg); });
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
		References.update(id, post).then( (data) => {
			$("#refModal").modal('toggle');
			$('.modal-form').off('submit');
			refreshList();
		}, (msg) => { console.log('editModalClick() error', msg); });
	});
}

var editModal = function(id) {
	References.getByID(id).then( (data) => {
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
	}, (msg) => { console.log('editModal() error', msg); });
}

var closeDeleteModal = function() {
	$('#deleteModal').hide('modal');
	$('#yesDelete').off('click');
}

var deleteRef = function(id) {
	References.delete(id).then( (data) => {
		closeDeleteModal();
	}, (msg) => { 
		console.log('deleteRef() error', msg); 
		closeDeleteModal();
	});
	refreshList();
}

var deleteModal = function(id) {
	$('#deleteModal').show('modal');
	$('#yesDelete').on('click', function(e) {
		deleteRef(id);
	});
}

const copyToClipboard = () => {
	const collection = References.getAllLocal();
	let text = '';
	collection.forEach((ref) => {
		text += ref.html + '<br><br>';
	});
	clipboard.copy( {'text/html':text} ).then(
					() => {console.log("success");},
					(err) => {console.log("failure", err);}
				);
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

const References = (() => {

	let collection = [];

	const dbCreate = (ref) => {
		return $.ajax({
			url: 'refs/',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(ref)
		});
	}

	const dbGet = (id) => {
		var url = '';
		if(id) url = 'ref/' + id;
		else url = 'refs/' + format;
		return $.ajax({
			url: url,
			type: 'GET',
			contentType: 'application/json'
		});
	}

	const dbUpdate = (id, ref) => {
		return $.ajax({
			url: 'refs/' + id,
			type: 'PUT',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(ref)
		});
	}	

	const dbDelete = (id) => {
		return $.ajax({
			url: 'refs/' + id,
			type: 'DELETE'
		});
	}

	// TODO: throughout, assuming we want to manipulate local storage even if server is not available
	// This would mean that once the server is available, work might be lost
	return {
		create: (ref) => {
			collection.push(ref);
			localStorage.setItem('refs',JSON.stringify(collection));
			return new Promise( (resolve,reject) => {
				dbCreate(ref)
					.done(() => { resolve(); })
					.fail((msg) => { reject(); });
			});
		},
		// If we are getting the whole set, assume we mean the server
		getAll: () => {
			return new Promise( (resolve,reject) => {
				dbGet()
					.done((data) => { 
						collection = data.refs;
						localStorage.setItem('refs',JSON.stringify(collection));
						resolve(data);
					})
					.fail((msg) => { reject();	});
			});
		},
		// Clipboard will not allow copying after an AJAX call, so just get what we have
		getAllLocal: () => {
			return collection;
		},
		getByID: function(id) {
			// if it's in local storage, return that
			const index = collection.findIndex( (r) => { return r.id===id; } );
			return new Promise( (resolve,reject) => {
				dbGet(id)
					.done((data) => { resolve(data); })
					.fail((msg) => { reject();	});
			});
		},
		update: (id, ref) => {
			const index = collection.findIndex( (r) => { return r.id===id; } );
			collection[index] = ref;
			localStorage.setItem('refs',JSON.stringify(collection));
			return new Promise( (resolve,reject) => {
				dbUpdate(id, ref)
					.done((data) => { resolve(data); })
					.fail((msg) => { reject();	});
			});
		},
		delete: (id) => {
			collection = collection.filter((ref) => {
				if(ref.id===id) return false;
				return true;
			});
			localStorage.setItem('refs',JSON.stringify(collection));
			return new Promise( (resolve,reject) => {
				dbDelete(id)
					.done(() => { resolve(); })
					.fail((msg) => { reject();	});
			});
		}
	};

})();