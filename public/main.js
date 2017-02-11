let format;
let user = '';

const formError = msg => {
	console.log(msg);
	$('.modal-message')
		.hide()
		.html(msg)
		.slideDown(100)
		.delay(5000)
		.fadeOut(100);
};

const setFormat = (f) => {
	format = f;
	$('#apa-check, #chi-check, #mla-check').hide();
	switch(format) {
		case 'apa': {
			$('#apa-check').show();
			break;
		}
		case 'chicago': {
			$('#chi-check').show();
			break;
		}
		case 'mla': {
			$('#mla-check').show();
			break;
		}
		default: {
			console.log('setFormat invalid format');
		}
	}
	refreshList();
};

const buildJSON = fields => {
	let post = {};
	for(let i=0; i<fields.length;i++) {
		switch(fields[i].name) {
			case 'authors': {
				if(fields[i].value==='') break;
				if(!('authors' in Object.keys(post))) post['authors'] = [];
				const nameField = fields[i].value.split(',');
				if(nameField.length<2) {
					formError('<p>Author name must include last and first name separated by commas</p>');
					$('#authors').focus();
					return undefined;
				}
				const name = {
					'firstName': nameField[1].trim(),
					'lastName': nameField[0].trim()
				};
				if(nameField.length>=3) name['middleName'] = nameField[2].trim();
				post['authors'].push({'author': name });
				break;
			}
			case 'tags': {
				const tags = fields[i].value.split(',');
				if(tags.length<1) break;
				if(!('tags' in Object.keys(post))) post['tags'] = [];
				const tagList = [];
				tags.forEach(tag => {
					tagList.push( { 'tag':tag.trim() } );
				});
				post['tags'] = tagList;
				break;
			}
			default: {
				post[fields[i].name] = fields[i].value;
			}
		}
	}
	return post;
};

const buildHTML = ref => {
	let type = '';
	switch(ref.data.type) {
		case 'Article': type = '<div class="label label-primary ref-label">Article</div>'; break;
		case 'Book': type ='<div class="label label-danger ref-label">Book</div>'; break;
		case 'Website': type = '<div class="label label-success ref-label">Website</div>';
	}
	let html = `<li class="ref list-group-item" data-id="${ref.data._id}">`
				+   type
				+	'<div class="ref-del"><i class="fa fa-trash-o" aria-hidden="true"></i></div>'
				+	'<div class="ref-edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>'
				+	`<div class="ref-text">${ref.html}</div>`
			+ '</li>';
	return html;
};

const refreshList = () => {
	$('.container').empty();
	if(!user) {
		$('.container').html('<ul class="list-group ref-container">'
				+ '<p>Please log in or create an account to start creating references!</p>'
			+ '</ul>'
		);
		return;
	}
      
	References.getAll().then(data => {
		if(!data.refs) return; // TODO something more serious
		$.get('./views/tabs.html', partial => {
			$('.container').html(partial);
			data.refs.forEach(ref => {
				const html = buildHTML(ref);
				$('.ref-container').append(html);
				switch(ref.data.type.toLowerCase()) {
					case 'article': {
						$('.article-container').append(html);
						break;
					}
					case 'book': {
						$('.book-container').append(html);
						break;
					}
					case 'website': {
						$('.website-container').append(html);
						break;
					}
					default: {
						console.log('refreshList invalid reference type', ref.data.type);
					}
				}
			});
		});	
	}, msg => { console.log('refreshList() error', msg); }); // this might actually happen for legit reasons (refresh to clear list after logout)
};

const newModalSubmit = () => {
	$('#refModal .modal-form').on('submit', 'form', (e) => {
		e.preventDefault();
		const post = buildJSON($('.modal-form :input').serializeArray());
		References.create(post).then(() => {
			$('#refModal').modal('toggle');
			$('#refModal .modal-form').off('submit');
			refreshList();
		}, msg => { console.log('newModalSubmit() error', msg); });
	});
};

const newModal = () => {
	if(!user) return; // todo message
	$('#refModal').modal('toggle');
	$('.new-button-row').show();
	$('.submit button').html('Add');
	newModalSubmit();
};

const editModalClick = id => {
	if(!user) return; // todo message
	$('#refModal .modal-form').on('submit', 'form', e => {
		e.preventDefault();
		let post = buildJSON($('.modal-form :input').serializeArray());
		post.id = id;
		References.update(id, post).then(() => {
			$('#refModal').modal('toggle');
			$('.modal-form').off('submit');
			refreshList();
		}, msg => { console.log('editModalClick() error', msg); });
	});
};

const editModal = id => {
	if(!user) return; // todo message
	References.getByID(id).then(ref => {
		$.get('./views/' + ref.data.type.toLowerCase() + '.html', partial => {
			$('#refModal').modal('show');
			$('.modal-form').html(partial);
			$('.submit button').html('Update');
			$('.new-button-row').hide();
			const today = new Date();
			$('#year').attr('max', today.getFullYear());
			for(let field in ref.data) {
				switch(field) {
					case 'authors': {
						if(ref.data[field].length>0) {
							let author = ref.data[field][0].author.lastName + ', ' + ref.data[field][0].author.firstName;
							if(ref.data[field][0].author.middleName) author += ', ' + ref.data[field][0].author.middleName;
							$('#' + field).attr('value', author);
						}
						break;
					}
					case 'tags': {
						const tags = ref.data[field].map(t => { return t.tag; });
						$('#' + field).attr('value', tags.join(', '));
						break;
					}
					case 'accessDate': 
					case 'pubDate': {
						document.getElementById(field).valueAsDate = new Date(ref.data[field]);
						break;
					}
					default: {
						$('#' + field).attr('value', ref.data[field]);
					}
				}
			}
		});
		editModalClick(id);
	}, msg => { console.log('editModal() error', msg); });
};

const closeDeleteModal = () => {
	$('#deleteModal').hide('modal');
	$('#yesDelete').off('click');
};

const deleteRef = id => {
	if(!user) return; // todo message
	References.delete(id).then(() => {
		closeDeleteModal();
	}, msg => { 
		console.log('deleteRef() error', msg); 
		closeDeleteModal();
	});
	refreshList();
};

const deleteModal = id => {
	if(!user) return; // todo message
	$('#deleteModal').show('modal');
	$('#yesDelete').on('click', () => {
		deleteRef(id);
	});
};

const copyToClipboard = () => {
	const collection = References.getAllLocal();
	let text = '';
	collection.forEach(ref => {
		text += ref.html + '<br><br>';
	});
	clipboard.copy( {'text/html':text} ).then(
					() => {},
					err => {console.log('failure', err);}
				);
};

const signoutHandler = () => {
	$('#signout').off('click').on('click', () => {
		$.ajax({
			url: 'auth/logout',
			type: 'GET',
			success: () => {
				user = '';
				$('#login-nav').show();
				$('#logout').hide();
				$('.logged-in').hide();
				refreshList();
			},
			error: msg => { console.log('error logging out',msg); } // TODO real error handler
		});
		
	});
};

$(() => {
	setFormat('apa'); // todo: localStorage (per user?)

	$('#logout').hide();

	$('#newRef').on('click', () => {
		newModal();
	});

	$('#copy').on('click', () => {
		copyToClipboard();
	});

	$('#newArticle').on('click', () => {
		$.get('./views/article.html', html => {
			$('.modal-form').html(html);
			const today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newBook').on('click', () => {
		$.get('./views/book.html', html => {
			$('.modal-form').html(html);
			const today = new Date();
			$('#year').attr('max', today.getFullYear());
		});
	});

	$('#newWebsite').on('click', () => {
		$.get('./views/website.html', html => {
			$('.modal-form').html(html);
		});
	});

	$('#APA').on('click', () => {
		setFormat('apa');
	});

	$('#Chicago').on('click', () => {
		setFormat('chicago');
	});

	$('#MLA').on('click', () => {
		setFormat('mla');
	});

	$('#refModal').on('hide.bs.modal', () => {
		$('#refModal .modal-form').off('submit');
		$('.modal-form').empty();
	});

	$('#deleteModal .close').on('click', () => {
		closeDeleteModal();
	});

	$('#noDelete').on('click', () => {
		closeDeleteModal();
	});
	
	// Edit button event handler
	$('.ref-container').on('click','.ref-edit', e => {
		e.preventDefault();
		const id = $(event.target).closest('.ref').attr('data-id');
		editModal(id);
	});

	// Delete button event handler
	$('.ref-container').on('click', '.ref-del', e => {
		e.preventDefault();
		const id = $(event.target).closest('.ref').attr('data-id');
		deleteModal(id);
	});

	// Login event handler
	$('#login-nav').on('submit', e => {
		e.preventDefault();
		$('.dropdown.open .dropdown-toggle').dropdown('toggle'); // might not want to do this yet in case there's a message needs displayed
		$.ajax({
			url: 'auth/login',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify({ username: $('#username').val(), password: $('#password').val() } ),
			success: () => {
				user = $('#username').val();
				$('#login-nav').hide();
				$('#logout').show();
				$('.logged-in').show();
				signoutHandler();
				refreshList();
			},
			error: msg => { console.log('error logging in',msg); } // TODO real error handler
		});
	});

	$('#signup').on('click', e => {
		e.preventDefault();
		$('.dropdown.open .dropdown-toggle').dropdown('toggle'); // might not want to do this yet in case there's a message needs displayed
		$.ajax({
			url: 'auth/signup',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify({ username: $('#username').val(), password: $('#password').val() } ),
			success: () => {
				user = $('#username').val();
				$('#login-nav').hide();
				$('#logout').show();
				$('.logged-in').show();
				signoutHandler();
				refreshList();
			},
			error: msg => { console.log('error signing up',msg); } // TODO real error handler
		});
	});
});

const References = (() => {
	let collection;
	if(user) collection = JSON.parse(localStorage.getItem(user));
	else collection = JSON.parse(localStorage.getItem('local'));
	if(!collection) collection = [];

	const dbCreate = ref => {
		return $.ajax({
			url: 'refs/',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(ref)
		});
	};
	const dbGet = id => {
		let url = '';
		if(id) url = 'ref/' + id;
		else url = 'refs/' + format;
		return $.ajax({
			url: url,
			type: 'GET',
			contentType: 'application/json'
		});
	};
	const dbUpdate = (id, ref) => {
		return $.ajax({
			url: 'refs/' + id,
			type: 'PUT',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(ref)
		});
	};	
	const dbDelete = id => {
		return $.ajax({
			url: 'refs/' + id,
			type: 'DELETE'
		});
	};

	return {
		create: ref => {
			collection.push(ref);
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				dbCreate(ref)
					.done(() => { resolve(); })
					.fail(msg => { reject(msg); });
			});
		},
		getAll: () => {
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				dbGet()
					.done(data => { 
						collection = data.refs;
						resolve(data);
					})
					.fail(() => { reject(); });
			});
		},
		// Clipboard will not allow copying after an AJAX call, so just get what we have
		getAllLocal: () => {
			return collection;
		},
		getByID: id => {	
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				// If it in local memory, return that
				const index = collection.findIndex(r => { return r.data._id===id; } );
				if(index!==-1) {
					resolve(collection[index]);
				}
				dbGet(id)
					.done(data => { resolve(data); })
					.fail(() => { reject(); });
			});
		},
		update: (id, ref) => {
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				dbUpdate(id, ref)
					.done(data => { 
						const index = collection.findIndex(r => { return r.data._id===id; } );
						collection[index] = ref;
						resolve(data); 
					})
					.fail(() => { reject(); });
			});
		},
		delete: id => {
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				dbDelete(id)
					.done(() => { 
						collection = collection.filter(ref => {
							if(ref.data._id===id) return false;
							return true;
						});
						resolve(); 
					})
					.fail(() => { reject(); });
			});
		}
	};
})();