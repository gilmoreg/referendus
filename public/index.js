var format = 'APA';

var formError = function(msg) {
	console.log(msg);
	$('.modal-message').hide().html(msg).slideDown(100).delay(5000).fadeOut(100);
}

// To Mark: there has to be a better way?
var generateReference = function(ref) {
	switch(format) {
		case 'APA': {
			switch(ref.type) {
				case 'Article': { return generateAPAArticle(ref); break; }
				case 'Book': { return generateAPABook(ref); break; }
				case 'Website': { return generateAPAWebsite(ref); break; }
			}
			break;
		 };
		case 'Chicago': {
			switch(ref.type) {
				case 'Article': { return generateChicagoArticle(ref); break; }
				case 'Book': { return generateChicagoBook(ref); break; }
				case 'Website': { return generateChicagoWebsite(ref); break; }
			}
			break;
		}
		case 'MLA': {
			switch(ref.type) {
				case 'Article': { return generateMLAArticle(ref); break; }
				case 'Book': { return generateMLABook(ref); break; }
				case 'Website': { return generateMLAWebsite(ref); break; }
			}
			break;
		}
		// TODO error
		default: { return ''; }
	}
}

var firstFullLastInitials = function(author) {
	var str = author.lastName + ', ' + author.firstName.charAt(0) + '.';
	if(author.middleName) str += author.middleName.charAt(0) + '.';
	return str;
}

var generateAPAAuthorList = function(authors) {
	if(authors.length<1) return '';
	var str='';
	// Single author
	if(authors.length===1) {
		str += firstFullLastInitials(authors[0]);
	}
	// Two authors
	else if(authors.length===2) {
		str += firstFullLastInitials(authors[0]) + '& ' + firstFullLastInitials(authors[1]);		
	}
	// Between 3 and 7 authors
	else if(authors.length>=3 && authors.length<=7) {
		// Last author has to be preceded by ampersand, so count up to penultimate only
		for(var i=0; i<authors.length-1;i++) {
			str += firstFullLastInitials(authors[i]) + ', ';
		}
		str += '& ' + firstFullLastInitials(authors[authors.length-1]) + '. ';
	}
	// More than 7 authors
	else if(authors.length>7) {
		for(var i=0; i<6;i++) {
			str += firstFullLastInitials(authors[i]) + ', ';
		}
		str += '. . . ' + firstFullLastInitials(authors[authors.length-1]);
	}
	return str;
}

// https://owl.english.purdue.edu/owl/resource/560/06/
var generateAPAArticle = function(ref) {
	var str = '';
	str += generateAPAAuthorList(ref.authors) + ' ';
	str += '(' + ref.year + '). ' + ref.title + '. ' + '<i>' + ref.journal + '</i>, ';
	str += '<i>' + ref.volume + '</i>';
	if(ref.pages) str += ', ' + ref.pages + '.';
	else str += '.';
	return str;
}

var generateAPABook = function(ref) {
	var str = '';
	str += generateAPAAuthorList(ref.authors) + ' ';
	str += '(' + ref.year + '). <i>' + ref.title + '</i>. ';
	str += ref.city + ': ' + ref.publisher + '.';
	return str;
}

var generateAPAWebsite = function(ref) {
  var str = '';
  str += generateAPAAuthorList(ref.authors) + ' ';
  if(ref.pubDate) str += '(' + ref.pubDate + '). ';
  str += ref.title + '. <i>' + ref.siteTitle + '</i>. Retrieved ' + ref.accessDate + ' from ' + ref.url + '.';
  return str;
}

var generateChicagoArticle = function(ref) {

}

var generateChicagoBook = function(ref) {

}

var generateChicagoWebsite = function(ref) {
	
}

var generateMLAArticle = function(ref) {

}

var generateMLABook = function(ref) {

}

var generateMLAWebsite = function(ref) {
	
}

var refreshList = function() {
	$('.ref-container').empty();
	$.ajax({
		url: 'refs/',
		type: 'GET',
		contentType: 'application/json',
		success: function(data) {
			console.log(data);
			data.refs.forEach(function(ref) {
				var html = '<div class="ref" id="' + ref.id + '">'
							+	'<div class="ref-text green col-xs-9">' + ref.title + '</div>'
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

	$('#APA').on('click', function() {
		format = 'APA';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#Chicago').on('click', function() {
		format = 'Chicago';
		$("#formatModal").modal('toggle');
		refreshList();
	});

	$('#MLA').on('click', function() {
		format = 'MLA';
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
					if(!('authors' in Object.keys(post))) post['authors'] = [];
					var nameField = field.value.split(',');
					if(nameField.length<2) {
						formError('<p>Author name must include last and first name separated by commas</p>');
						$('#authors').focus();
						return false;
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