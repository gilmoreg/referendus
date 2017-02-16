let format;
let user;
let activeTab = 'All';
let currentSearch = '';

const formError = (form, msg) => {
	form
		.hide()
		.html(msg)
		.slideDown(100)
		.delay(2000)
		.fadeOut(100);
};

const setFormat = f => {
	format = f;
	if(user) {
		localStorage.setItem(user,format);
	}
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
			console.error('setFormat invalid format');
		}
	}
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
					formError($('.modal-message)'),'<p>Author name must include last and first name separated by commas</p>');
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

const addRefClickListeners = () => {
	$('.container').on('click','.ref-edit', e => {
		e.preventDefault();
		const id = $(event.target).closest('.ref').attr('data-id');
		editModal(id);
	});

	$('.container').on('click', '.ref-del', e => {
		e.preventDefault();
		const id = $(event.target).closest('.ref').attr('data-id');
		deleteModal(id);
	});

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		activeTab = e.target.innerHTML;
	});
};

const refreshList = () => {
	$('.container').off('click').empty();
	if(!user) {
		$.get('./views/instructions.html', partial => {
			$('.container').html(partial);
			return;
		});
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
						console.error('refreshList invalid reference type', ref.data.type);
					}
				}
			});
			addRefClickListeners();
			// Populate search results, if any
			if(currentSearch!=='') {
				References.search(currentSearch).then(results => {
					results.forEach(sr => {
						$('.results-container').append(buildHTML(sr));
					});
					$('.nav-tabs a[href="#results"]')
						.tab('show')
						.html(currentSearch);
				});
			}
		});	
	}, msg => { console.error('refreshList() error', msg); }); // this might actually happen for legit reasons (refresh to clear list after logout)
};

const newModalSubmit = () => {
	$('#refModal .modal-form').on('submit', 'form', (e) => {
		e.preventDefault();
		const post = buildJSON($('.modal-form :input').serializeArray());
		References.create(post).then(() => {
			$('#refModal').modal('toggle');
			$('#refModal .modal-form').off('submit');
			refreshList();
		}, msg => { console.error('newModalSubmit() error', msg); });
	});
};

const newModal = () => {
	if(!user) return;
	$('#refModal').modal('toggle');
	$('.new-button-row').show();
	$('.submit button').html('Add');
	newModalSubmit();
};

const editModalClick = id => {
	if(!user) return;
	$('#refModal .modal-form').on('submit', 'form', e => {
		e.preventDefault();
		let post = buildJSON($('.modal-form :input').serializeArray());
		post.id = id;
		References.update(id, post).then(() => {
			$('#refModal').modal('toggle');
			$('.modal-form').off('submit');
			refreshList();
		}, msg => { console.error('editModalClick() error', msg); });
	});
};

const editModal = id => {
	if(!user) return;
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
						if(ref.data[field]) document.getElementById(field).valueAsDate = new Date(ref.data[field]);
						break;
					}
					default: {
						$('#' + field).attr('value', ref.data[field]);
					}
				}
			}
		});
		editModalClick(id);
	}, msg => { console.error('editModal() error', msg); });
};

const closeDeleteModal = () => {
	$('#deleteModal').hide('modal');
	$('#yesDelete').off('click');
};

const deleteRef = id => {
	if(!user) return;
	References.delete(id).then(() => {
		closeDeleteModal();
	}, msg => { 
		console.error('deleteRef() error', msg); 
		closeDeleteModal();
	});
	refreshList();
};

const deleteModal = id => {
	if(!user) return;
	$('#deleteModal').show('modal');
	$('#yesDelete').on('click', () => {
		deleteRef(id);
	});
};

const copyToClipboard = () => {
	const collection = References.getAllVisible();
	let text = '';
	collection.forEach(ref => {
		text += ref.html + '<br><br>';
	});
	clipboard.copy( {'text/html':text} ).then(
					() => {
						// TODO display success message
					},
					err => {console.error('clipboard failure', err);}
				);
};

const tagSearch = () => {
	currentSearch = $('#tag-search').val();
	if(currentSearch==='') return;
	References.search(currentSearch)
		.then(() => {
			$('.nav-tabs a[href="#results"]')
				.tab('show')
				.html(currentSearch);
			activeTab = currentSearch;
			refreshList();
		})
		.catch(() => {
			// Display error for one second
			$('#tag-search').val('No results.');
			setTimeout(() => {
				$('#tag-search').val('');
			},1000);
		});
};

const signoutHandler = () => {
	$('#signout').off('click').on('click', () => {
		$.ajax({
			url: 'auth/logout',
			type: 'GET',
			success: () => {
				user = '';
				showSignedOut();
				refreshList();
			},
			error: msg => { console.error('error logging out',msg); } // TODO real error handler
		});
		
	});
};

const showSignedIn = () => {
	$('#login-nav').hide();
	$('#logout').show();
	$('.logged-in').show();
};

const showSignedOut = () => {
	$('#login-nav').show();
	$('#logout').hide();
	$('.logged-in').hide();
};

$(() => {
	$('head').append('<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">');

	setFormat('apa');
	// Check if user is logged in - this will get called every refresh
	$.get('auth/check', res => {
		if(res.username) {
			user = res.username;
			showSignedIn();
			if(localStorage.getItem(user)!==null) setFormat(localStorage.getItem(user));
			signoutHandler();
			References.getAll().then(() => { refreshList(); });
		}
		else {
			user = '';
			showSignedOut();
			refreshList();
		}
	});

	$('#logout').hide();

	// Format dropdown
	$('#APA').on('click', () => {
		setFormat('apa');
		refreshList();
	});

	$('#Chicago').on('click', () => {
		setFormat('chicago');
		refreshList();
	});

	$('#MLA').on('click', () => {
		setFormat('mla');
		refreshList();
	});

	// Navbar event handlers
	$('#newRef').on('click', () => {
		newModal();
	});

	$('#copy').on('click', () => {
		copyToClipboard();
	});

	$('#nav-search').on('submit', e => {
		e.preventDefault();
		tagSearch();
	});

	// new/edit modal event handlers
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

	$('#refModal').on('hide.bs.modal', () => {
		$('#refModal .modal-form').off('submit');
		$('.modal-form').empty();
	});

	$('#refModal').on('click', '.doi-search', e => {
		e.preventDefault();
		formError($('.modal-message)'),'Sorry, search is disabled.');
	});

	// Delete yes/no modal
	$('#deleteModal .close').on('click', () => {
		closeDeleteModal();
	});

	$('#noDelete').on('click', () => {
		closeDeleteModal();
	});

	// Login event handlers
	$('#login-nav').on('submit', e => {
		e.preventDefault();
		$.ajax({
			url: 'auth/login',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify({ username: $('#username').val(), password: $('#password').val() } ),
			success: () => {
				$('.dropdown.open .dropdown-toggle').dropdown('toggle');
				user = $('#username').val();
				showSignedIn();
				signoutHandler();
				if(localStorage.getItem(user)!==null) setFormat(localStorage.getItem(user));
				refreshList();
			},
			error: msg => { 
				console.error('Error signing in: ',msg);
				formError($('.signin-message'), 'Error logging in.');
			}
		});
	});

	$('#signup').on('click', e => {
		e.preventDefault();
		$.ajax({
			url: 'auth/signup',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify({ username: $('#username').val(), password: $('#password').val() } ),
			success: () => {
				$('.dropdown.open .dropdown-toggle').dropdown('toggle'); 
				user = $('#username').val();
				$('#login-nav').hide();
				$('#logout').show();
				$('.logged-in').show();
				signoutHandler();
				refreshList();
			},
			error: msg => {
				formError($('.signin-message'), 'Error signing up.');
			}
		});
	});
});

const References = (() => {
	let collection = [];
	
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

	const getAllByType = type => {
		return collection.filter(item => { return item.data.type===type; } );
	};

	const getAllByTag = tag => {
		return collection.filter(item => {
			const index = item.data.tags.findIndex(r => { return r.tag===tag; } );
			return index!==-1;
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
		getAllVisible: () => {
			switch(activeTab) {
				case 'All': return collection;
				case 'Articles': return getAllByType('Article');
				case 'Books': return getAllByType('Book');
				case 'Websites': return getAllByType('Website');
				// Assuming search results active if it doesn't match the above
				default: return getAllByTag(activeTab);
			}
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
		search: tag => {
			return new Promise( (resolve,reject) => {
				if(!user) reject('Must be logged in.');
				let results = getAllByTag(tag);
				if(results.length>0) resolve(results);
				else reject();
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