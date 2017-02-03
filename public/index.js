var MOCK_REF_LIST = {
	"references" : [
		{
			"type": "article",
			"title": "The power of images: mathematics and metaphysics in Hobbes's optics",
			"authors": [
				{ 
                    "author": {
					    "firstName":"Antoni",
					    "lastName":"Malet"
                    }
                }
			],
			"journal":"Studies in History and Philosophy of Science",
			"year":"2001",
			"volume":"32",
			"issue":"2",
			"pages":"303-333",
			"id":"10.1016/S0039-3681(00)00039-X",
			"tags": [
				"hobbes","optics","metaphysics"
			]
		},
		{
			"type": "article",
			"title": "On the Sovereign Authorization",
			"authors": [
                {
                    "author": {
                        "firstName":"Clifford",
                        "lastName":"Orwin"
                    }
                }
			],
			"journal":"Political Theory",
			"year":"1975",
			"volume":"3",
			"issue":"1",
			"pages":"26-44",
			"url":"http://www.jstor.org/stable/190606",
			"tags": [
				"hobbes","sovereignty","theology"
			]
		},
		{
			"type": "article",
			"title": "Thomas Hobbes on the Family and the State of Nature",
			"authors": [
				{
                    "author": {
                        "firstName":"Gordon",
                        "middleName":"J.",
                        "lastName":"Schochet"
                    }
				}
			],
			"journal":"Political Science Quarterly",
			"year":"1967",
			"volume":"82",
			"issue":"3",
			"pages":"427-445",
			"url":"http://www.jstor.org/stable/2146773",
			"tags": [
				"hobbes","family","nature"
			]
		},
		{
			"type": "book",
			"title": "The Open Society and its Enemies",
			"authors": [
                {
                    "author": {
                        "firstName":"Karl",
                        "lastName":"Popper"
                    }
                }
			],
			"year":"1966",
			"edition":"5th",
			"city":"Princeton",
			"publisher":"Princeton University Press",
			"id":"0691019681",
			"url":"http://www.jstor.org/stable/2146773",
			"tags": [
				"science"
			]
		},
		{
			"type": "website",
			"title": "One Nation Under God?",
			"sitetitle":"The New York Times",
			"authors": [
                {
                    "author": {
                        "firstName":"Molly",
                        "lastName":"Worthen"
                    }
                }
			],
			"date":"12-23-2012",
			"accessdate":"11-29-16",
			"url":"http://www.nytimes.com/2012/12/23/opinion/sunday/american-christianity-and-secularism-at-a-crossroads.html",
			"tags": [
				"theology"
			]
		}
	]
}

function getAndDisplayReferences() {
    var html = '';
    MOCK_REF_LIST.references.forEach(function(element) {
        html += 
            '<div class="ref">' + 
                '<div class="ref-text green col-xs-9">' + element.title.trunc(20) + '</div>' +
                '<div class="ref-edit green col-xs-1"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>' + 
                '<div class="ref-del green col-xs-1"><i class="fa fa-trash-o" aria-hidden="true"></i></div>' +
            '</div>';
    }, this); 
    $('.ref-container').html(html);
}

String.prototype.trunc = String.prototype.trunc ||
      function(n){
          return (this.length > n) ? this.substr(0,n-1)+'&hellip;' : this;
      };

$(function() {
    //getAndDisplayReferences();
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
})