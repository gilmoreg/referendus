let format = 'apa';
let user = '';

const formError = msg => {
	console.log(msg);
	$('.modal-message').hide().html(msg).slideDown(100).delay(5000).fadeOut(100);
}

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
				}
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
	};
	return post;
}

const buildHTML = ref => {
	let type = '';
	switch(ref.data.type) {
		case 'Article': type = '<span class="label label-primary">Article</span>'; break;
		case 'Book': type ='<span class="label label-danger">Book</span>'; break;
		case 'Website': type = '<span class="label label-success">Website</span>'
	}
	let html = `<div class="ref" data-id="${ref.data._id}">`
				+	`<div class="ref-text">${type} ${ref.html}</div>`
				+	'<div class="ref-edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>'
				+ 	'<div class="ref-del"><i class="fa fa-trash-o" aria-hidden="true"></i></div>'
			+ '</div>';
	return html;
}

const refreshList = () => {
	$('.ref-container').empty();
	References.getAll().then(data => {
		console.log('getall',data);
		if(!data.refs) return; // TODO something more serious
		data.refs.forEach(ref => {
			$('.ref-container').append(buildHTML(ref));
		});
	}, msg => { console.log('refreshList() error', msg); }); // this might actually happen for legit reasons (refresh to clear list after logout)
}

const newModalSubmit = () => {
	$('#refModal .modal-form').on('submit', 'form', (e) => {
		e.preventDefault();
		const post = buildJSON($('.modal-form :input').serializeArray());
		References.create(post).then( (data) => {
			$("#refModal").modal('toggle');
			$('#refModal .modal-form').off('submit');
			refreshList();
		}, msg => { console.log('newModalSubmit() error', msg); });
	});
}

const newModal = () => {
	if(!user) return; // todo message
	$("#refModal").modal('toggle');
	$('.new-button-row').show();
	$('.submit button').html('Add');
	newModalSubmit();
}

const editModalClick = id => {
	if(!user) return; // todo message
	$('#refModal .modal-form').on('submit', 'form', e => {
		e.preventDefault();
		let post = buildJSON($('.modal-form :input').serializeArray());
		post.id = id;
		References.update(id, post).then(data => {
			$("#refModal").modal('toggle');
			$('.modal-form').off('submit');
			refreshList();
		}, msg => { console.log('editModalClick() error', msg); });
	});
}

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
							$('#' + field).attr("value", author);
						}
						break;
					}
					case 'tags': {
						const tags = ref.data[field].map(t => { return t.tag; });
						$('#' + field).attr("value", tags.join(", "));
						break;
					}
					case 'accessDate': 
					case 'pubDate': {
						document.getElementById(field).valueAsDate = new Date(ref.data[field]);
						break;
					}
					default: {
						$('#' + field).attr("value", ref.data[field]);
					}
				}
			}
		});
		editModalClick(id);
	}, msg => { console.log('editModal() error', msg); });
}

const closeDeleteModal = () => {
	$('#deleteModal').hide('modal');
	$('#yesDelete').off('click');
}

const deleteRef = id => {
	if(!user) return; // todo message
	References.delete(id).then(data => {
		closeDeleteModal();
	}, msg => { 
		console.log('deleteRef() error', msg); 
		closeDeleteModal();
	});
	refreshList();
}

const deleteModal = id => {
	if(!user) return; // todo message
	$('#deleteModal').show('modal');
	$('#yesDelete').on('click', e => {
		deleteRef(id);
	});
}

const copyToClipboard = () => {
	const collection = References.getAllLocal();
	let text = '';
	collection.forEach(ref => {
		text += ref.html + '<br><br>';
	});
	clipboard.copy( {'text/html':text} ).then(
					() => {},
					err => {console.log("failure", err);}
				);
}

const signoutHandler = () => {
	$('#signout').off('click').on('click', e => {
		$.ajax({
			url: 'auth/logout',
			type: 'GET',
			success: () => {
				user = '';
				$('#login-nav').show();
				$('#logout').hide();
				refreshList();
			},
			error: msg => { console.log('error logging out',msg); } // TODO real error handler
		});
		
	});
}

$(() => {
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
		format = 'apa';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#Chicago').on('click', () => {
		format = 'chicago';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#MLA').on('click', () => {
		format = 'mla';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#refModal').on('hide.bs.modal', () => {
		$('#refModal .modal-form').off('submit');
		$('.modal-form').empty();
	});

	$('#deleteModal .close').on('click', () => {
		closeDeleteModal();
	});

	$('#noDelete').on('click', e => {
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
				signoutHandler();
				refreshList();
			},
			error: msg => { console.log('error signing up',msg); } // TODO real error handler
		});
	});
})

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
	}
	const dbGet = id => {
		let url = '';
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
	const dbDelete = id => {
		return $.ajax({
			url: 'refs/' + id,
			type: 'DELETE'
		});
	}

	return {
		create: ref => {
			collection.push(ref);
			if(user) localStorage.setItem(user,JSON.stringify(collection));
			else localStorage.setItem('local',JSON.stringify(collection));
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
						localStorage.setItem(user,JSON.stringify(collection));
						resolve(data);
					})
					.fail(msg => { reject(); });
			});
		},
		// Clipboard will not allow copying after an AJAX call, so just get what we have
		getAllLocal: () => {
			return collection;
		},
		// This is the one case in which pulling from localStorage is safe and will increase speed
		getByID: id => {	
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				// if it's in local storage, return that
				const index = collection.findIndex(r => { return r.data._id===id; } );
				if(index!==-1) {
					resolve(collection[index]);
				}
				dbGet(id)
					.done(data => { resolve(data); })
					.fail(msg => { reject(); });
			});
		},
		update: (id, ref) => {
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				dbUpdate(id, ref)
					.done(data => { 
						const index = collection.findIndex(r => { return r.data._id===id; } );
						collection[index] = ref;
						localStorage.setItem(user,JSON.stringify(collection));
						resolve(data); 
					})
					.fail(msg => { reject(); });
			});
		},
		delete: id => {
			localStorage.setItem(user,JSON.stringify(collection));
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
					.fail(msg => { reject(); });
			});
		}
	};
})();