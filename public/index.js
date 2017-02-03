$(function() {
	$('#newArticle').on('click', function() {
		$.get('./addArticle.html', function(html) {
			$('.modal-form').html(html);
		});
	});

	$('#newBook').on('click', function() {
		$.get('./addBook.html', function(html) {
			$('.modal-form').html(html);
		});
	});

	$('#newWebsite').on('click', function() {
		$.get('./addWebsite.html', function(html) {
			$('.modal-form').html(html);
		});
	});

	$('.modal-form').on('submit', 'form', function(e) {
		e.preventDefault();
		$("#newModal").modal('toggle');
	});
})